"use client";

import {FormEvent, useMemo, useState, type ReactNode} from "react";
import {useRouter} from "next/navigation";
import type {AuthError} from "@supabase/supabase-js";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {OAuthButtons} from "@/components/auth/OAuthButtons";
import {useToast} from "@/hooks/use-toast";
import {
  createSupabaseBrowserClient,
  getSupabaseAuthRedirectUrl,
} from "@/lib/supabase/client";
import {useUser} from "@/providers/user-provider";

type FeedbackStatus = "info" | "success" | "error" | "warning";

type Feedback = {type: FeedbackStatus; message: string; title?: string};

const alertTitles: Record<FeedbackStatus, string> = {
  info: "Información",
  success: "Éxito",
  error: "Error",
  warning: "Atención",
};

const RATE_LIMIT_MESSAGE =
  "Has realizado demasiados intentos. Espera unos minutos e inténtalo nuevamente.";

const isAuthError = (error: unknown): error is AuthError =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  "status" in error;

const getRegisterErrorMessage = (error: AuthError) => {
  const normalized = error.message?.toLowerCase() ?? "";

  if (error.status === 429 || normalized.includes("rate limit")) {
    return RATE_LIMIT_MESSAGE;
  }

  if (normalized.includes("email_already_registered") || normalized.includes("already registered")) {
    return "El correo ya está registrado. Si tu cuenta no está confirmada, puedes reenviar el correo de activación.";
  }

  if (normalized.includes("invalid email")) {
    return "El correo electrónico no es válido.";
  }

  return error.message || "No se pudo registrar la cuenta.";
};

const getLoginErrorMessage = (error: AuthError) => {
  const normalized = error.message?.toLowerCase() ?? "";

  if (error.status === 429 || normalized.includes("rate limit")) {
    return RATE_LIMIT_MESSAGE;
  }

  if (normalized.includes("invalid login credentials")) {
    return "Usuario o contraseña incorrectos, o cuenta no confirmada.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico antes de iniciar sesión.";
  }

  return error.message || "No se pudo iniciar sesión.";
};

export function AccountAccessPanel() {
  const router = useRouter();
  const toast = useToast();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const {status, error, clearError, refreshUser} = useUser();
  const [tabIndex, setTabIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] =
    useState<string | null>(null);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);

  const isRegisterLoading = isRegistering || status === "loading";
  const isLoginLoading = isLoggingIn || status === "loading";

  const alert = useMemo<Feedback | null>(
    () =>
      feedback ?? (error ? {type: "error", message: error, title: "Error"} : null),
    [feedback, error]
  );

  const resetFeedback = () => {
    setFeedback(null);
    clearError();
    setPendingConfirmationEmail(null);
  };

  const parseApiError = async (response: Response) => {
    if (response.headers.get("content-type")?.includes("application/json")) {
      const payload = await response.json();

      if (payload?.error) {
        if (typeof payload.error === "string") {
          return payload.error;
        }

        const {formErrors, fieldErrors} = payload.error as {
          formErrors?: string[];
          fieldErrors?: Record<string, string[]>;
        };

        if (Array.isArray(formErrors) && formErrors.length > 0) {
          return formErrors.join("\n");
        }

        if (fieldErrors && typeof fieldErrors === "object") {
          for (const messages of Object.values(fieldErrors)) {
            if (Array.isArray(messages) && messages.length > 0) {
              return messages[0];
            }
          }
        }
      }
    }

    const message = await response.text();
    return message || "Ocurrió un error inesperado";
  };

  const handleResendConfirmation = async () => {
    if (!pendingConfirmationEmail) {
      return;
    }

    try {
      setIsResendingConfirmation(true);
      const {error: resendError} = await supabase.auth.resend({
        type: "signup",
        email: pendingConfirmationEmail,
        options: {
          emailRedirectTo: getSupabaseAuthRedirectUrl(),
        },
      });

      if (resendError) {
        throw resendError;
      }

      toast({
        status: "success",
        title: "Correo reenviado",
        description: "Hemos reenviado el enlace de confirmación. Revisa tu bandeja de entrada.",
        duration: 7000,
      });
    } catch (error) {
      const message = isAuthError(error)
        ? getRegisterErrorMessage(error)
        : error instanceof Error
          ? error.message
          : "No se pudo reenviar el correo de confirmación.";
      setFeedback({
        type: "error",
        title: "No se pudo reenviar el correo",
        message,
      });
      toast({
        status: "error",
        title: "No se pudo reenviar el correo",
        description: message,
        duration: 9000,
      });
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (registerForm.password !== registerForm.confirmPassword) {
      const message = "Las contraseñas no coinciden.";
      setFeedback({
        type: "error",
        title: "Datos inválidos",
        message,
      });
      toast({
        status: "error",
        title: "Datos inválidos",
        description: message,
        duration: 5000,
      });
      return;
    }

    const trimmedName = registerForm.name.trim();
    const trimmedLastName = registerForm.lastName.trim();
    const rawEmail = registerForm.email.trim();
    const email = rawEmail.toLowerCase();

    try {
      setIsRegistering(true);
      const metadata: Record<string, string> = {};

      if (trimmedName) {
        metadata.name = trimmedName;
      }

      if (trimmedLastName) {
        metadata.lastName = trimmedLastName;
      }

      const {data, error: signUpError} = await supabase.auth.signUp({
        email,
        password: registerForm.password,
        options: {
          data: Object.keys(metadata).length ? metadata : undefined,
          emailRedirectTo: getSupabaseAuthRedirectUrl(),
        },
      });

      if (signUpError) {
        const message = getRegisterErrorMessage(signUpError);
        const normalized = signUpError.message?.toLowerCase() ?? "";

        if (
          normalized.includes("email_already_registered") ||
          normalized.includes("already registered")
        ) {
          setPendingConfirmationEmail(rawEmail);
          setFeedback({
            type: "info",
            title: "Confirma tu correo",
            message:
              "Ya existe una cuenta asociada a este correo pero está pendiente de confirmación. Puedes reenviar el correo de activación.",
          });
          toast({
            status: "info",
            title: "Confirma tu correo",
            description:
              "Ya existe una cuenta asociada a este correo. Revisa tu bandeja de entrada o reenvía el correo de confirmación.",
            duration: 9000,
          });
        } else {
          setFeedback({
            type: "error",
            title: "No se pudo crear la cuenta",
            message,
          });
          toast({
            status: "error",
            title: "No se pudo crear la cuenta",
            description: message,
            duration: 9000,
          });
        }

        return;
      }

      const alreadyRegisteredPending =
        !!data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;

      if (alreadyRegisteredPending) {
        setPendingConfirmationEmail(rawEmail);
        setFeedback({
          type: "info",
          title: "Confirma tu correo",
          message:
            "Tu cuenta ya existe pero aún no ha sido confirmada. Puedes reenviar el correo de activación.",
        });
        toast({
          status: "info",
          title: "Confirma tu correo",
          description:
            "Tu cuenta ya existe pero sigue pendiente de confirmación. Revisa tu correo o vuelve a enviar el enlace.",
          duration: 9000,
        });
        return;
      }

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            email,
            password: registerForm.password,
            name: trimmedName || undefined,
            lastName: trimmedLastName || undefined,
          }),
        });

        if (!response.ok) {
          const message = await parseApiError(response);
          throw new Error(message);
        }
      } catch (apiError) {
        await supabase.auth.signOut();
        throw apiError;
      }

      if (data.session) {
        await refreshUser();
        toast({
          status: "success",
          title: "Cuenta creada",
          description: "Ya puedes administrar tu perfil.",
          duration: 7000,
        });
        setFeedback({
          type: "success",
          message: "Cuenta creada correctamente. Ya puedes administrar tu perfil.",
        });
      } else {
        toast({
          status: "success",
          title: "Confirma tu correo",
          description: "Hemos enviado un enlace de confirmación a tu correo.",
          duration: 9000,
        });
        setFeedback({
          type: "success",
          message: "Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta.",
        });
        void router.push(`/account/check-email?email=${encodeURIComponent(email)}`);
      }

      setPendingConfirmationEmail(null);
      setRegisterForm({
        name: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "No se pudo registrar la cuenta";

      if (message.toLowerCase().includes("registrad")) {
        setPendingConfirmationEmail(rawEmail);
      }

      setFeedback({
        type: "error",
        title: "No se pudo crear la cuenta",
        message,
      });
      toast({
        status: "error",
        title: "No se pudo crear la cuenta",
        description: message,
        duration: 9000,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    try {
      setIsLoggingIn(true);
      const rawEmail = loginForm.email.trim();
      const normalizedEmail = rawEmail.toLowerCase();
      const {data, error: signInError} = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: loginForm.password,
      });

      if (signInError) {
        const message = getLoginErrorMessage(signInError);
        const normalized = signInError.message?.toLowerCase() ?? "";

        if (normalized.includes("email not confirmed")) {
          setPendingConfirmationEmail(rawEmail);
        }

        setFeedback({
          type: "error",
          title: "No se pudo iniciar sesión",
          message,
        });
        toast({
          status: "error",
          title: "No se pudo iniciar sesión",
          description: message,
          duration: 9000,
        });
        return;
      }

      if (data.session) {
        await refreshUser();
      }

      toast({
        status: "success",
        title: "Sesión iniciada",
        description: "Cargando tu historial...",
        duration: 5000,
      });
      setFeedback({
        type: "success",
        message: "Sesión iniciada. Cargando tu historial...",
      });
      setLoginForm({email: "", password: ""});
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
      setFeedback({
        type: "error",
        title: "No se pudo iniciar sesión",
        message,
      });
      toast({
        status: "error",
        title: "No se pudo iniciar sesión",
        description: message,
        duration: 9000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const tabs = [
    {label: "Crear cuenta", description: "Regístrate para llevar un registro de tus compras."},
    {label: "Iniciar sesión", description: "Accede con tus credenciales o redes sociales."},
  ];

  return (
    <div className="flex flex-col gap-6">
      {pendingConfirmationEmail ? (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/60 bg-warning/10 p-4 text-sm text-warning-foreground">
          <div className="font-semibold">Confirma tu correo</div>
          <p>
            Hemos detectado que <span className="font-semibold">{pendingConfirmationEmail}</span> todavía no ha sido confirmada.
            Revisa tu bandeja de entrada o solicita un nuevo correo.
          </p>
          <Button
            variant="link"
            className="w-fit px-0 text-warning-foreground underline-offset-4 hover:underline"
            onClick={handleResendConfirmation}
            disabled={isResendingConfirmation}
          >
            {isResendingConfirmation ? "Enviando" : "Reenviar correo de confirmación"}
          </Button>
        </div>
      ) : null}

      {alert ? (
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-muted/50 p-4 text-sm text-foreground">
          <div className="font-semibold">
            {alert.title ?? alertTitles[alert.type] ?? "Aviso"}
          </div>
          <p>{alert.message}</p>
        </div>
      ) : null}

      <section className="rounded-xl border border-white/10 bg-background/80 p-6 shadow-soft">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-background/60 p-1 text-sm">
              {tabs.map((tab, index) => (
                <button
                  key={tab.label}
                  type="button"
                  className={`rounded-full px-4 py-2 font-medium transition ${
                    tabIndex === index
                      ? "bg-accent text-background shadow-soft"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                  onClick={() => {
                    setTabIndex(index);
                    resetFeedback();
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-foreground/70">{tabs[tabIndex]?.description}</p>
          </div>

          {tabIndex === 0 ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Nombre">
                  <Input
                    placeholder="Tu nombre"
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({...prev, name: event.target.value}))
                    }
                    autoComplete="given-name"
                  />
                </FormField>
                <FormField label="Apellido">
                  <Input
                    placeholder="Tu apellido"
                    value={registerForm.lastName}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({...prev, lastName: event.target.value}))
                    }
                    autoComplete="family-name"
                  />
                </FormField>
                <FormField label="Correo electrónico" required className="md:col-span-2">
                  <Input
                    type="email"
                    placeholder="tu@correo.com"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({...prev, email: event.target.value}))
                    }
                    autoComplete="email"
                    required
                  />
                </FormField>
                <FormField label="Contraseña" required>
                  <Input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({...prev, password: event.target.value}))
                    }
                    autoComplete="new-password"
                    required
                  />
                </FormField>
                <FormField label="Confirmar contraseña" required>
                  <Input
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={registerForm.confirmPassword}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({...prev, confirmPassword: event.target.value}))
                    }
                    autoComplete="new-password"
                    required
                  />
                </FormField>
              </div>

              <DividerWithLabel label="O continúa con" />
              <OAuthButtons />

              <Button type="submit" disabled={isRegisterLoading} className="w-full gap-2">
                {isRegisterLoading ? <Spinner /> : null}
                {isRegisterLoading ? "Creando cuenta" : "Crear cuenta"}
              </Button>
            </form>
          ) : null}

          {tabIndex === 1 ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <FormField label="Correo electrónico" required>
                  <Input
                    type="email"
                    placeholder="tu@correo.com"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((prev) => ({...prev, email: event.target.value}))
                    }
                    autoComplete="email"
                    required
                  />
                </FormField>
                <FormField label="Contraseña" required>
                  <Input
                    type="password"
                    placeholder="Tu contraseña"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((prev) => ({...prev, password: event.target.value}))
                    }
                    autoComplete="current-password"
                    required
                  />
                </FormField>
              </div>

              <DividerWithLabel label="O continúa con" />
              <OAuthButtons />

              <Button type="submit" disabled={isLoginLoading} className="w-full gap-2">
                {isLoginLoading ? <Spinner /> : null}
                {isLoginLoading ? "Iniciando sesión" : "Iniciar sesión"}
              </Button>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

function FormField({label, required, className, children}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

type DividerWithLabelProps = {
  label: string;
};

function DividerWithLabel({label}: DividerWithLabelProps) {
  return (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-foreground/50">
      <span className="h-px flex-1 bg-white/10" />
      {label}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

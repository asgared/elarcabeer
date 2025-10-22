"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  chakra,
  useToast
} from "@chakra-ui/react";
import type {AlertStatus} from "@chakra-ui/react";
import type {AuthError} from "@supabase/supabase-js";
import {FormEvent, useMemo, useState} from "react";
import {useRouter} from "next/navigation";

import {
  createSupabaseBrowserClient,
  getSupabaseAuthRedirectUrl
} from "@/lib/supabase/client";
import {useUser} from "@/providers/user-provider";
import {OAuthButtons} from "@/components/auth/OAuthButtons";

type Feedback = {type: AlertStatus; message: string; title?: string};

const alertTitles: Record<AlertStatus, string> = {
  info: "Información",
  success: "Éxito",
  error: "Error",
  warning: "Atención",
  loading: "Aviso"
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
    confirmPassword: ""
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] =
    useState<string | null>(null);
  const [isResendingConfirmation, setIsResendingConfirmation] =
    useState(false);

  const isRegisterLoading = isRegistering || status === "loading";
  const isLoginLoading = isLoggingIn || status === "loading";

  const alert = useMemo<Feedback | null>(
    () =>
      feedback ??
      (error ? {type: "error", message: error, title: "Error"} : null),
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
          emailRedirectTo: getSupabaseAuthRedirectUrl()
        }
      });

      if (resendError) {
        throw resendError;
      }

      toast({
        status: "success",
        title: "Correo reenviado",
        description: "Hemos reenviado el enlace de confirmación. Revisa tu bandeja de entrada.",
        duration: 7000,
        isClosable: true
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
        message
      });
      toast({
        status: "error",
        title: "No se pudo reenviar el correo",
        description: message,
        duration: 9000,
        isClosable: true
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
        message
      });
      toast({
        status: "error",
        title: "Datos inválidos",
        description: message,
        duration: 5000,
        isClosable: true
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
          emailRedirectTo: getSupabaseAuthRedirectUrl()
        }
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
              "Ya existe una cuenta asociada a este correo pero está pendiente de confirmación. Puedes reenviar el correo de activación."
          });
          toast({
            status: "info",
            title: "Confirma tu correo",
            description:
              "Ya existe una cuenta asociada a este correo. Revisa tu bandeja de entrada o reenvía el correo de confirmación.",
            duration: 9000,
            isClosable: true
          });
        } else {
          setFeedback({
            type: "error",
            title: "No se pudo crear la cuenta",
            message
          });
          toast({
            status: "error",
            title: "No se pudo crear la cuenta",
            description: message,
            duration: 9000,
            isClosable: true
          });
        }

        return;
      }

      const alreadyRegisteredPending =
        !!data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0;

      if (alreadyRegisteredPending) {
        setPendingConfirmationEmail(rawEmail);
        setFeedback({
          type: "info",
          title: "Confirma tu correo",
          message:
            "Tu cuenta ya existe pero aún no ha sido confirmada. Puedes reenviar el correo de activación."
        });
        toast({
          status: "info",
          title: "Confirma tu correo",
          description:
            "Tu cuenta ya existe pero sigue pendiente de confirmación. Revisa tu correo o vuelve a enviar el enlace.",
          duration: 9000,
          isClosable: true
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
            lastName: trimmedLastName || undefined
          })
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
          isClosable: true
        });
        setFeedback({
          type: "success",
          message: "Cuenta creada correctamente. Ya puedes administrar tu perfil."
        });
      } else {
        toast({
          status: "success",
          title: "Confirma tu correo",
          description: "Hemos enviado un enlace de confirmación a tu correo.",
          duration: 9000,
          isClosable: true
        });
        setFeedback({
          type: "success",
          message: "Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta."
        });
        void router.push(`/account/check-email?email=${encodeURIComponent(email)}`);
      }

      setPendingConfirmationEmail(null);
      setRegisterForm({
        name: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "No se pudo registrar la cuenta";

      if (message.toLowerCase().includes("registrad")) {
        setPendingConfirmationEmail(rawEmail);
      }

      setFeedback({
        type: "error",
        title: "No se pudo crear la cuenta",
        message
      });
      toast({
        status: "error",
        title: "No se pudo crear la cuenta",
        description: message,
        duration: 9000,
        isClosable: true
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
        password: loginForm.password
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
          message
        });
        toast({
          status: "error",
          title: "No se pudo iniciar sesión",
          description: message,
          duration: 9000,
          isClosable: true
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
        isClosable: true
      });
      setFeedback({
        type: "success",
        message: "Sesión iniciada. Cargando tu historial..."
      });
      setLoginForm({email: "", password: ""});
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
      setFeedback({
        type: "error",
        title: "No se pudo iniciar sesión",
        message
      });
      toast({
        status: "error",
        title: "No se pudo iniciar sesión",
        description: message,
        duration: 9000,
        isClosable: true
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Stack spacing={6}>
      {pendingConfirmationEmail && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Stack spacing={1} flex="1">
            <AlertTitle>Confirma tu correo</AlertTitle>
            <AlertDescription>
              <Stack spacing={3}>
                <Text>
                  Hemos detectado que {""}
                  <chakra.span fontWeight="semibold">
                    {pendingConfirmationEmail}
                  </chakra.span>{" "}
                  todavía no ha sido confirmada. Revisa tu bandeja de entrada o solicita un nuevo correo.
                </Text>
                <Button
                  variant="link"
                  colorScheme="yellow"
                  onClick={handleResendConfirmation}
                  isLoading={isResendingConfirmation}
                  loadingText="Enviando"
                  alignSelf="flex-start"
                >
                  Reenviar correo de confirmación
                </Button>
              </Stack>
            </AlertDescription>
          </Stack>
        </Alert>
      )}

      {alert && (
        <Alert status={alert.type} borderRadius="md">
          <AlertIcon />
          <Stack spacing={1} flex="1">
            <AlertTitle>{alert.title ?? alertTitles[alert.type] ?? "Aviso"}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Stack>
        </Alert>
      )}

      <Tabs
        index={tabIndex}
        onChange={(index) => {
          setTabIndex(index);
          resetFeedback();
        }}
        variant="enclosed"
      >
        <TabList>
          <Tab>Crear cuenta</Tab>
          <Tab>Iniciar sesión</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <chakra.form onSubmit={handleRegister}>
              <Stack spacing={6}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Nombre</FormLabel>
                    <Input
                      placeholder="Tu nombre"
                      value={registerForm.name}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({...prev, name: event.target.value}))
                      }
                      autoComplete="given-name"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Apellido</FormLabel>
                    <Input
                      placeholder="Tu apellido"
                      value={registerForm.lastName}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({...prev, lastName: event.target.value}))
                      }
                      autoComplete="family-name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Correo electrónico</FormLabel>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({...prev, email: event.target.value}))
                      }
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Contraseña</FormLabel>
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({...prev, password: event.target.value}))
                      }
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <Input
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={registerForm.confirmPassword}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({...prev, confirmPassword: event.target.value}))
                      }
                      autoComplete="new-password"
                    />
                  </FormControl>
                </Stack>
                <Stack spacing={3}>
                  <HStack align="center" spacing={3} color="whiteAlpha.700">
                    <Divider />
                    <Text fontSize="sm" fontWeight="medium" textTransform="uppercase">
                      O continúa con
                    </Text>
                    <Divider />
                  </HStack>
                  <OAuthButtons />
                </Stack>
                <Button
                  colorScheme="yellow"
                  type="submit"
                  isLoading={isRegisterLoading}
                  loadingText="Creando cuenta"
                >
                  Crear cuenta
                </Button>
              </Stack>
            </chakra.form>
          </TabPanel>
          <TabPanel>
            <chakra.form onSubmit={handleLogin}>
              <Stack spacing={6}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Correo electrónico</FormLabel>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((prev) => ({...prev, email: event.target.value}))
                      }
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Contraseña</FormLabel>
                    <Input
                      type="password"
                      placeholder="Tu contraseña"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((prev) => ({...prev, password: event.target.value}))
                      }
                      autoComplete="current-password"
                    />
                  </FormControl>
                </Stack>
                <Stack spacing={3}>
                  <HStack align="center" spacing={3} color="whiteAlpha.700">
                    <Divider />
                    <Text fontSize="sm" fontWeight="medium" textTransform="uppercase">
                      O continúa con
                    </Text>
                    <Divider />
                  </HStack>
                  <OAuthButtons />
                </Stack>
                <Button
                  colorScheme="yellow"
                  type="submit"
                  isLoading={isLoginLoading}
                  loadingText="Iniciando sesión"
                >
                  Iniciar sesión
                </Button>
              </Stack>
            </chakra.form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}

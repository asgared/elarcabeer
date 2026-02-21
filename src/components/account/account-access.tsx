"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
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
import type { AlertStatus } from "@chakra-ui/react";
import type { AuthError } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createSupabaseBrowserClient,
  getSupabaseAuthRedirectUrl
} from "@/lib/supabase/client";
import { useUser } from "@/providers/user-provider";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import {
  registerSchema,
  loginSchema,
} from "@/lib/validations/schemas";
import type { RegisterFormData, LoginFormData } from "@/lib/validations/schemas";

type Feedback = { type: AlertStatus; message: string; title?: string };

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
  const { status, error, clearError, refreshUser } = useUser();
  const [tabIndex, setTabIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // ── Register form (react-hook-form + zod) ──
  const registerMethods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ── Login form (react-hook-form + zod) ──
  const loginMethods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
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
      (error ? { type: "error", message: error, title: "Error" } : null),
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

        const { formErrors, fieldErrors } = payload.error as {
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
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: pendingConfirmationEmail,
        options: {
          emailRedirectTo: getSupabaseAuthRedirectUrl("/auth/confirm")
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

  const handleRegister = async (formValues: RegisterFormData) => {
    resetFeedback();

    const trimmedName = (formValues.name ?? "").trim();
    const trimmedLastName = (formValues.lastName ?? "").trim();
    const email = formValues.email; // already lowercased by Zod transform

    try {
      setIsRegistering(true);
      const metadata: Record<string, string> = {};

      if (trimmedName) {
        metadata.name = trimmedName;
      }

      if (trimmedLastName) {
        metadata.lastName = trimmedLastName;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: formValues.password,
        options: {
          data: Object.keys(metadata).length ? metadata : undefined,
          emailRedirectTo: getSupabaseAuthRedirectUrl("/auth/confirm")
        }
      });

      if (signUpError) {
        const normalized = signUpError.message?.toLowerCase() ?? "";

        if (
          !normalized.includes("email_already_registered") &&
          !normalized.includes("already registered")
        ) {
          const message = getRegisterErrorMessage(signUpError);
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
          return;
        }

        console.log("El usuario ya existe en Auth, procediendo a forzar sincronización con Prisma...");
      }

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: formValues.password,
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
      registerMethods.reset();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "No se pudo registrar la cuenta";

      if (message.toLowerCase().includes("registrad")) {
        setPendingConfirmationEmail(email);
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

  const handleLogin = async (formValues: LoginFormData) => {
    resetFeedback();

    try {
      setIsLoggingIn(true);
      const normalizedEmail = formValues.email; // already lowercased by Zod transform
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: formValues.password
      });

      if (signInError) {
        const message = getLoginErrorMessage(signInError);
        const normalized = signInError.message?.toLowerCase() ?? "";

        if (normalized.includes("email not confirmed")) {
          setPendingConfirmationEmail(normalizedEmail);
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
      loginMethods.reset();
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

  const regErrors = registerMethods.formState.errors;
  const logErrors = loginMethods.formState.errors;

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
                  Hemos detectado que {" "}
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
            <chakra.form onSubmit={registerMethods.handleSubmit(handleRegister)}>
              <Stack spacing={6}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!regErrors.name}>
                    <FormLabel>Nombre</FormLabel>
                    <Input
                      placeholder="Tu nombre"
                      {...registerMethods.register("name")}
                      autoComplete="given-name"
                    />
                    <FormErrorMessage>{regErrors.name?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!regErrors.lastName}>
                    <FormLabel>Apellido</FormLabel>
                    <Input
                      placeholder="Tu apellido"
                      {...registerMethods.register("lastName")}
                      autoComplete="family-name"
                    />
                    <FormErrorMessage>{regErrors.lastName?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!regErrors.email}>
                    <FormLabel>Correo electrónico</FormLabel>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      {...registerMethods.register("email")}
                      autoComplete="email"
                    />
                    <FormErrorMessage>{regErrors.email?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!regErrors.password}>
                    <FormLabel>Contraseña</FormLabel>
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      {...registerMethods.register("password")}
                      autoComplete="new-password"
                    />
                    <FormErrorMessage>{regErrors.password?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!regErrors.confirmPassword}>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <Input
                      type="password"
                      placeholder="Repite tu contraseña"
                      {...registerMethods.register("confirmPassword")}
                      autoComplete="new-password"
                    />
                    <FormErrorMessage>{regErrors.confirmPassword?.message}</FormErrorMessage>
                  </FormControl>
                </Stack>
                <Stack spacing={5}>
                  <HStack align="center" spacing={5} color="whiteAlpha.700">
                    <Divider />
                    <Text fontSize="sm" fontWeight="medium" textTransform="uppercase" minWidth={"12vh"}>
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
                  isDisabled={!registerMethods.formState.isValid}
                >
                  Crear cuenta
                </Button>
              </Stack>
            </chakra.form>
          </TabPanel>
          <TabPanel>
            <chakra.form onSubmit={loginMethods.handleSubmit(handleLogin)}>
              <Stack spacing={6}>
                <Stack spacing={4}>
                  <FormControl isRequired isInvalid={!!logErrors.email}>
                    <FormLabel>Correo electrónico</FormLabel>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      {...loginMethods.register("email")}
                      autoComplete="email"
                    />
                    <FormErrorMessage>{logErrors.email?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!logErrors.password}>
                    <FormLabel>Contraseña</FormLabel>
                    <Input
                      type="password"
                      placeholder="Tu contraseña"
                      {...loginMethods.register("password")}
                      autoComplete="current-password"
                    />
                    <FormErrorMessage>{logErrors.password?.message}</FormErrorMessage>
                  </FormControl>
                </Stack>
                <Stack spacing={5}>
                  <HStack align="center" spacing={5} color="whiteAlpha.700">
                    <Divider />
                    <Text fontSize="sm" fontWeight="medium" textTransform="uppercase" minWidth={"12vh"}>
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
                  isDisabled={!loginMethods.formState.isValid}
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

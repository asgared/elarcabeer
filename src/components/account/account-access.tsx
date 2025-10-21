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
  chakra
} from "@chakra-ui/react";
import type {AlertStatus} from "@chakra-ui/react";
import {FormEvent, useMemo, useState} from "react";

import {createSupabaseBrowserClient} from "@/lib/supabase/client";
import {useUser} from "@/providers/user-provider";
import {OAuthButtons} from "@/components/auth/OAuthButtons";

type Feedback = {type: Extract<AlertStatus, "success" | "error">; message: string};

export function AccountAccessPanel() {
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

  const isRegisterLoading = isRegistering || status === "loading";
  const isLoginLoading = isLoggingIn || status === "loading";

  const alert = useMemo<Feedback | null>(
    () => feedback ?? (error ? {type: "error", message: error} : null),
    [feedback, error]
  );

  const resetFeedback = () => {
    setFeedback(null);
    clearError();
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

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (registerForm.password !== registerForm.confirmPassword) {
      setFeedback({type: "error", message: "Las contraseñas no coinciden."});
      return;
    }

    try {
      setIsRegistering(true);
      const trimmedName = registerForm.name.trim();
      const trimmedLastName = registerForm.lastName.trim();
      const metadata: Record<string, string> = {};

      if (trimmedName) {
        metadata.name = trimmedName;
      }

      if (trimmedLastName) {
        metadata.lastName = trimmedLastName;
      }

      const {data, error} = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: Object.keys(metadata).length ? metadata : undefined
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            email: registerForm.email,
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
      }

      setFeedback({
        type: "success",
        message:
          data.session
            ? "Cuenta creada correctamente. Ya puedes administrar tu perfil."
            : "Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta."
      });
      setRegisterForm({name: "", lastName: "", email: "", password: "", confirmPassword: ""});
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo registrar la cuenta"
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
      const {data, error} = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        await refreshUser();
      }

      setFeedback({type: "success", message: "Sesión iniciada. Cargando tu historial..."});
      setLoginForm({email: "", password: ""});
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo iniciar sesión"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Stack spacing={6}>
      {alert && (
        <Alert status={alert.type} borderRadius="md">
          <AlertIcon />
          <Stack spacing={1}>
            <AlertTitle>{alert.type === "success" ? "Éxito" : "Error"}</AlertTitle>
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

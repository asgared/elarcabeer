"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from "@chakra-ui/react";
import type {AlertStatus} from "@chakra-ui/react";
import {FormEvent, useMemo, useState} from "react";

import {useUser} from "@/providers/user-provider";

type Feedback = {type: Extract<AlertStatus, "success" | "error">; message: string};

export function AccountAccessPanel() {
  const {registerUser, login, status, error, clearError} = useUser();
  const [tabIndex, setTabIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const isLoading = status === "loading";

  const alert = useMemo(() => feedback ?? (error ? {type: "error", message: error} : null), [feedback, error]);

  const resetFeedback = () => {
    setFeedback(null);
    clearError();
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (registerForm.password !== registerForm.confirmPassword) {
      setFeedback({type: "error", message: "Las contraseñas no coinciden."});
      return;
    }

    try {
      await registerUser({
        email: registerForm.email,
        password: registerForm.password,
        name: registerForm.name || undefined
      });

      setFeedback({type: "success", message: "Cuenta creada correctamente. Ya puedes administrar tu perfil."});
      setRegisterForm({name: "", email: "", password: "", confirmPassword: ""});
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo registrar la cuenta"
      });
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    try {
      await login({email: loginForm.email, password: loginForm.password});
      setFeedback({type: "success", message: "Sesión iniciada. Cargando tu historial..."});
      setLoginForm({email: "", password: ""});
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo iniciar sesión"
      });
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

      <Tabs index={tabIndex} onChange={(index) => {
        setTabIndex(index);
        resetFeedback();
      }} variant="enclosed">
        <TabList>
          <Tab>Crear cuenta</Tab>
          <Tab>Iniciar sesión</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Stack as="form" onSubmit={handleRegister} spacing={4}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  placeholder="Tu nombre"
                  value={registerForm.name}
                  onChange={(event) => setRegisterForm((prev) => ({...prev, name: event.target.value}))}
                  autoComplete="name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((prev) => ({...prev, email: event.target.value}))}
                  autoComplete="email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((prev) => ({...prev, password: event.target.value}))}
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
              <Button colorScheme="yellow" type="submit" isLoading={isLoading} loadingText="Creando cuenta">
                Crear cuenta
              </Button>
            </Stack>
          </TabPanel>
          <TabPanel>
            <Stack as="form" onSubmit={handleLogin} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({...prev, email: event.target.value}))}
                  autoComplete="email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  placeholder="Tu contraseña"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({...prev, password: event.target.value}))}
                  autoComplete="current-password"
                />
              </FormControl>
              <Button colorScheme="yellow" type="submit" isLoading={isLoading} loadingText="Iniciando sesión">
                Iniciar sesión
              </Button>
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}

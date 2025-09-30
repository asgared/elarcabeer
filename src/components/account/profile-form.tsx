"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack
} from "@chakra-ui/react";
import type {AlertStatus} from "@chakra-ui/react";
import {FormEvent, useEffect, useMemo, useState} from "react";

import {useUser} from "@/providers/user-provider";

type Feedback = {type: Extract<AlertStatus, "success" | "error">; message: string};

export function ProfileForm() {
  const {user, updateUser, status, error, logout, clearError} = useUser();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((prev) => ({...prev, name: user.name ?? "", email: user.email}));
  }, [user]);

  const alert = useMemo(() => feedback ?? (error ? {type: "error", message: error} : null), [feedback, error]);
  const isLoading = status === "loading";

  if (!user) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    clearError();

    if (form.password && form.password !== form.confirmPassword) {
      setFeedback({type: "error", message: "Las contraseñas no coinciden."});
      return;
    }

    try {
      await updateUser({
        name: form.name ? form.name : null,
        email: form.email,
        password: form.password ? form.password : undefined
      });

      setFeedback({type: "success", message: "Perfil actualizado correctamente."});
      setForm((prev) => ({...prev, password: "", confirmPassword: ""}));
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo actualizar el perfil"
      });
    }
  };

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="lg">Información de tu perfil</Heading>
      </Stack>

      {alert && (
        <Alert status={alert.type} borderRadius="md">
          <AlertIcon />
          <Stack spacing={1}>
            <AlertTitle>{alert.type === "success" ? "Cambios guardados" : "Error"}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Stack>
        </Alert>
      )}

      <Stack as="form" onSubmit={handleSubmit} spacing={4}>
        <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
          <FormControl>
            <FormLabel>Nombre completo</FormLabel>
            <Input
              placeholder="Cómo quieres que te llamemos"
              value={form.name}
              onChange={(event) => setForm((prev) => ({...prev, name: event.target.value}))}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Correo electrónico</FormLabel>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({...prev, email: event.target.value}))}
              autoComplete="email"
            />
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
          <FormControl>
            <FormLabel>Nueva contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Actualiza tu contraseña"
              value={form.password}
              onChange={(event) => setForm((prev) => ({...prev, password: event.target.value}))}
              autoComplete="new-password"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Confirmar contraseña</FormLabel>
            <Input
              type="password"
              placeholder="Repite la nueva contraseña"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({...prev, confirmPassword: event.target.value}))}
              autoComplete="new-password"
            />
          </FormControl>
        </SimpleGrid>

        <Stack direction={{base: "column", sm: "row"}} spacing={4} justify="flex-start">
          <Button colorScheme="yellow" type="submit" isLoading={isLoading} loadingText="Guardando cambios">
            Guardar cambios
          </Button>
          <Button variant="outline" onClick={logout} isDisabled={isLoading}>
            Cerrar sesión
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

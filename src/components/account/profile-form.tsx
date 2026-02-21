"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
  chakra,
  useToast,
} from "@chakra-ui/react";
import type { AlertStatus } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon } from "@chakra-ui/icons";

import { useUser } from "@/providers/user-provider";
import { profileSchema } from "@/lib/validations/schemas";
import type { ProfileFormData } from "@/lib/validations/schemas";

type Feedback = { type: Extract<AlertStatus, "success" | "error">; message: string };

export function ProfileForm() {
  const { user, updateUser, status, error, logout, clearError, refreshUser } = useUser();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      name: user?.name ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? "",
      lastName: user.lastName ?? "",
      secondLastName: user.secondLastName ?? "",
      email: user.email,
      phone: user.phone ?? "",
      password: "",
      confirmPassword: "",
    });
  }, [user, reset]);

  const alert = useMemo<Feedback | null>(
    () => feedback ?? (error ? { type: "error", message: error } : null),
    [feedback, error],
  );
  const isLoading = status === "loading" || isSubmitting;

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploadingAvatar(true);

        // 1. Get signature from our API
        const signRes = await fetch("/api/users/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sign" }),
        });

        if (!signRes.ok) {
          const err = await signRes.json().catch(() => null);
          throw new Error(err?.error ?? "No se pudo obtener la firma de Cloudinary.");
        }

        const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData },
        );

        if (!uploadRes.ok) {
          throw new Error("Error al subir la imagen a Cloudinary.");
        }

        const uploadData = await uploadRes.json();
        const url = uploadData.secure_url as string;

        // 3. Save URL to our DB
        const saveRes = await fetch("/api/users/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", url }),
        });

        if (!saveRes.ok) {
          throw new Error("No se pudo guardar el avatar.");
        }

        await refreshUser();
        toast({
          status: "success",
          title: "Avatar actualizado",
          description: "Tu nueva foto de perfil se guardó correctamente.",
          duration: 5000,
          isClosable: true,
        });
      } catch (err) {
        console.error(err);
        toast({
          status: "error",
          title: "Error al subir avatar",
          description: err instanceof Error ? err.message : "Ocurrió un error.",
          duration: 7000,
          isClosable: true,
        });
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [refreshUser, toast],
  );

  if (!user) {
    return null;
  }

  const onSubmit = async (data: ProfileFormData) => {
    setFeedback(null);
    clearError();

    try {
      await updateUser({
        name: data.name || null,
        lastName: data.lastName || null,
        secondLastName: data.secondLastName || null,
        email: data.email,
        phone: data.phone || null,
        password: data.password || undefined,
      });

      setFeedback({ type: "success", message: "Perfil actualizado correctamente." });
      reset({ ...data, password: "", confirmPassword: "" });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "No se pudo actualizar el perfil",
      });
    }
  };

  const initials = [user.name?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || user.email[0].toUpperCase();

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="lg">Información de tu perfil</Heading>
      </Stack>

      {/* Avatar section */}
      <Stack direction="row" align="center" spacing={4}>
        <Box position="relative">
          <Avatar
            size="xl"
            name={initials}
            src={user.avatarUrl ?? undefined}
          />
          <IconButton
            aria-label="Cambiar avatar"
            icon={<EditIcon />}
            size="sm"
            rounded="full"
            position="absolute"
            bottom={0}
            right={0}
            colorScheme="yellow"
            isLoading={isUploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
          />
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleAvatarUpload(file);
            e.target.value = "";
          }}
        />
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

      <chakra.form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Nombre</FormLabel>
              <Input
                placeholder="Tu nombre"
                {...register("name")}
                autoComplete="given-name"
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.lastName}>
              <FormLabel>Apellido Paterno</FormLabel>
              <Input
                placeholder="Primer apellido"
                {...register("lastName")}
                autoComplete="family-name"
              />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.secondLastName}>
              <FormLabel>Apellido Materno</FormLabel>
              <Input
                placeholder="Segundo apellido"
                {...register("secondLastName")}
                autoComplete="family-name"
              />
              <FormErrorMessage>{errors.secondLastName?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Correo electrónico</FormLabel>
              <Input
                type="email"
                {...register("email")}
                autoComplete="email"
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Teléfono</FormLabel>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="55 1234 5678"
                {...register("phone")}
                autoComplete="tel"
              />
              <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Nueva contraseña</FormLabel>
              <Input
                type="password"
                placeholder="Actualiza tu contraseña"
                {...register("password")}
                autoComplete="new-password"
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel>Confirmar contraseña</FormLabel>
              <Input
                type="password"
                placeholder="Repite la nueva contraseña"
                {...register("confirmPassword")}
                autoComplete="new-password"
              />
              <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify="flex-start">
            <Button
              colorScheme="yellow"
              type="submit"
              isLoading={isLoading}
              loadingText="Guardando cambios"
              isDisabled={!isValid}
            >
              Guardar cambios
            </Button>
            <Button variant="outline" onClick={logout} isDisabled={isLoading}>
              Cerrar sesión
            </Button>
          </Stack>
        </Stack>
      </chakra.form>
    </Stack>
  );
}

"use client";

import {FormEvent, useEffect, useMemo, useState, type ReactNode} from "react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useUser} from "@/providers/user-provider";

type Feedback = {type: "success" | "error"; message: string};

export function ProfileForm() {
  const {user, updateUser, status, error, logout, clearError} = useUser();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: user.name ?? "",
      lastName: user.lastName ?? "",
      email: user.email,
    }));
  }, [user]);

  const alert = useMemo<Feedback | null>(
    () => feedback ?? (error ? {type: "error", message: error} : null),
    [feedback, error]
  );
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
        lastName: form.lastName ? form.lastName : null,
        email: form.email,
        password: form.password ? form.password : undefined,
      });

      setFeedback({type: "success", message: "Perfil actualizado correctamente."});
      setForm((prev) => ({...prev, password: "", confirmPassword: ""}));
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo actualizar el perfil",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Información de tu perfil</h2>
      </div>

      {alert ? (
        <div
          className={`rounded-lg border p-4 text-sm ${
            alert.type === "success"
              ? "border-accent/60 bg-accent/10 text-foreground"
              : "border-danger/60 bg-danger/10 text-danger-foreground"
          }`}
        >
          <div className="font-semibold">
            {alert.type === "success" ? "Cambios guardados" : "Error"}
          </div>
          <p>{alert.message}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Nombre">
            <Input
              placeholder="Tu nombre"
              value={form.name}
              onChange={(event) => setForm((prev) => ({...prev, name: event.target.value}))}
              autoComplete="given-name"
            />
          </FormField>
          <FormField label="Apellido">
            <Input
              placeholder="Tu apellido"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({...prev, lastName: event.target.value}))}
              autoComplete="family-name"
            />
          </FormField>
        </div>
        <FormField label="Correo electrónico" required>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({...prev, email: event.target.value}))}
            autoComplete="email"
            required
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Nueva contraseña">
            <Input
              type="password"
              placeholder="Actualiza tu contraseña"
              value={form.password}
              onChange={(event) => setForm((prev) => ({...prev, password: event.target.value}))}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirmar contraseña">
            <Input
              type="password"
              placeholder="Repite la nueva contraseña"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((prev) => ({...prev, confirmPassword: event.target.value}))
              }
              autoComplete="new-password"
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? <Spinner /> : null}
            {isLoading ? "Guardando cambios" : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={logout}
            disabled={isLoading}
            className="border-danger/50 text-danger hover:bg-danger/10"
          >
            Cerrar sesión
          </Button>
        </div>
      </form>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
};

function FormField({label, required, children}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

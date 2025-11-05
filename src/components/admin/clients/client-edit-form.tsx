"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {User, UserRole} from "@prisma/client";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useToast} from "@/hooks/use-toast";

const clientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(191, "El nombre es demasiado largo.")
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, "El apellido es obligatorio.")
    .max(191, "El apellido es demasiado largo.")
    .optional(),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({message: "Selecciona un rol válido."}),
  }),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

type ClientEditFormProps = {
  client: Pick<User, "id" | "name" | "lastName" | "role" | "email">;
  onSuccess?: (user: User) => void;
};

export function ClientEditForm({client, onSuccess}: ClientEditFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client.name ?? undefined,
      lastName: client.lastName ?? undefined,
      role: client.role,
    },
  });

  const {control, handleSubmit, reset, formState} = form;
  const {isSubmitting} = formState;

  useEffect(() => {
    reset({
      name: client.name ?? undefined,
      lastName: client.lastName ?? undefined,
      role: client.role,
    });
  }, [client.id, client.name, client.lastName, client.role, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    setServerError(null);

    const payload: Record<string, unknown> = {};

    if (typeof values.name === "string") {
      payload.name = values.name.trim();
    }

    if (typeof values.lastName === "string") {
      payload.lastName = values.lastName.trim();
    }

    if (values.role) {
      payload.role = values.role;
    }

    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          typeof errorBody?.error === "string"
            ? errorBody.error
            : "No se pudo actualizar al cliente.";
        throw new Error(message);
      }

      const data = (await response.json()) as {user: User};

      reset({
        name: data.user.name ?? undefined,
        lastName: data.user.lastName ?? undefined,
        role: data.user.role,
      });

      toast({title: "Cliente actualizado", status: "success"});
      onSuccess?.(data.user);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar al cliente.";

      setServerError(message);
      toast({
        title: "Error al actualizar",
        description: message,
        status: "error",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({field}) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? undefined : value);
                    }}
                    placeholder="Nombre del cliente"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="lastName"
            render={({field}) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? undefined : value);
                    }}
                    placeholder="Apellido del cliente"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="role"
            render={({field}) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>ADMIN</SelectItem>
                    <SelectItem value={UserRole.USER}>USER</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {serverError ? (
          <p className="text-sm text-red-400">{serverError}</p>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button disabled={isSubmitting} type="submit">
            Guardar cambios
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

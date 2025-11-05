"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {Store} from "@prisma/client";

import {storeSchema} from "@/lib/validations/store";
import type {StoreSchema} from "@/lib/validations/store";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {useToast} from "@/hooks/use-toast";

function normalizeInitialState(initialStore: Store | null): StoreSchema {
  if (!initialStore) {
    return {
      slug: "",
      name: "",
      address: "",
      hours: "",
      menuUrl: "",
      latitude: 0,
      longitude: 0,
      petFriendly: false,
      kitchen: false,
      events: false,
    };
  }

  return {
    slug: initialStore.slug,
    name: initialStore.name,
    address: initialStore.address,
    hours: initialStore.hours,
    menuUrl: initialStore.menuUrl ?? "",
    latitude: initialStore.latitude,
    longitude: initialStore.longitude,
    petFriendly: initialStore.petFriendly,
    kitchen: initialStore.kitchen,
    events: initialStore.events,
  };
}

type AdminStoreFormProps = {
  initialStore: Store | null;
};

export function AdminStoreForm({initialStore}: AdminStoreFormProps) {
  const router = useRouter();
  const toast = useToast();
  const initialState = useMemo(() => normalizeInitialState(initialStore), [initialStore]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isNew = !initialStore;

  const form = useForm<StoreSchema>({
    resolver: zodResolver(storeSchema),
    defaultValues: initialState,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: {isSubmitting},
  } = form;

  useEffect(() => {
    reset(initialState);
  }, [initialState, reset]);

  const onSubmit = async (data: StoreSchema) => {
    setServerError(null);
    try {
      const endpoint = isNew ? "/api/admin/stores" : `/api/admin/stores/${initialStore?.slug}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("La API no está implementada (Tarea 3.4).");
      }

      toast({title: "Tienda guardada", status: "success"});
      router.replace("/dashboard/stores");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No se pudo guardar la tienda.");
      toast({
        title: "Error al guardar",
        description: "La API aún no está implementada (Tarea 3.4).",
        status: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!initialStore) {
      return;
    }

    setIsDeleting(true);
    toast({
      title: "Funcionalidad no implementada",
      description: "La API de borrado aún no existe.",
      status: "error",
    });
    setIsDeleting(false);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl rounded-xl border border-white/10 bg-background/80 p-8 shadow-soft"
      >
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={control}
              name="slug"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="centro-historico" disabled={!isNew} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Arca Centro Histórico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="address"
            render={({field}) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Calle de la Amargura #123, Colonia..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={control}
              name="latitude"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Latitud</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="longitude"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Longitud</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="hours"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Horario</FormLabel>
                  <FormControl>
                    <Input placeholder="L-V 10am-10pm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="menuUrl"
              render={({field}) => (
                <FormItem>
                  <FormLabel>URL del Menú (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://menu.elarca.mx" {...field} />
                  </FormControl>
                  <FormDescription>
                    Puedes dejar este campo vacío si no tienes un menú en línea.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg border border-white/10 p-4 md:grid-cols-3">
            <FormField
              control={control}
              name="petFriendly"
              render={({field}) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Pet Friendly</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="kitchen"
              render={({field}) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Cocina</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="events"
              render={({field}) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Eventos</FormLabel>
                </FormItem>
              )}
            />
          </div>

          {serverError ? (
            <div className="rounded-lg border border-danger/60 bg-danger/10 p-4 text-sm text-danger-foreground">
              {serverError}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 md:flex-row">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
            {!isNew ? (
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-danger/50 text-danger hover:bg-danger/10"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar tienda"}
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

"use client";

import {useEffect, useMemo, useState, type ReactNode} from "react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useUser} from "@/providers/user-provider";
import type {AddressInput} from "@/types/user";

type Feedback = {type: "success" | "error"; message: string};

const emptyAddress: AddressInput = {
  label: "",
  street: "",
  city: "",
  country: "",
  postal: "",
};

export function AddressesManager() {
  const {user, updateUser, status, error, clearError} = useUser();
  const [addresses, setAddresses] = useState<AddressInput[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      return;
    }

    setAddresses(
      user.addresses.map(({label, street, city, country, postal}) => ({
        label,
        street,
        city,
        country,
        postal,
      }))
    );
  }, [user]);

  const alert = useMemo<Feedback | null>(
    () => feedback ?? (error ? {type: "error", message: error} : null),
    [feedback, error]
  );
  const isLoading = status === "loading";

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Tus direcciones</h2>
        <p className="text-sm text-foreground/70">
          Inicia sesión para gestionar tus direcciones de envío.
        </p>
      </div>
    );
  }

  const updateAddressField = (index: number, field: keyof AddressInput, value: string) => {
    setAddresses((current) =>
      current.map((address, currentIndex) =>
        currentIndex === index ? {...address, [field]: value} : address
      )
    );
  };

  const removeAddress = (index: number) => {
    setAddresses((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const addAddress = () => {
    setAddresses((current) => [...current, {...emptyAddress}]);
  };

  const handleSave = async () => {
    setFeedback(null);
    clearError();

    const sanitized = addresses.map((address) => ({
      label: address.label.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      country: address.country.trim(),
      postal: address.postal.trim(),
    }));

    const hasEmptyField = sanitized.some((address) =>
      Object.values(address).some((value) => value.length === 0)
    );

    if (hasEmptyField) {
      setFeedback({type: "error", message: "Completa todos los campos de tus direcciones."});
      return;
    }

    try {
      await updateUser({addresses: sanitized});
      setFeedback({type: "success", message: "Direcciones actualizadas correctamente."});
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudieron actualizar las direcciones",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Tus direcciones</h2>
        <p className="text-sm text-foreground/70">Administra tus ubicaciones de entrega habituales.</p>
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
            {alert.type === "success" ? "Direcciones guardadas" : "Error"}
          </div>
          <p>{alert.message}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-6 text-sm text-foreground/70">
            No tienes direcciones guardadas todavía.
          </div>
        ) : null}

        {addresses.map((address, index) => (
          <div key={`address-${index}`} className="rounded-2xl border border-white/10 p-6">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Etiqueta" required>
                  <Input
                    placeholder="Casa, oficina, etc."
                    value={address.label}
                    onChange={(event) => updateAddressField(index, "label", event.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Calle y número" required>
                  <Input
                    placeholder="Calle, número exterior e interior"
                    value={address.street}
                    onChange={(event) => updateAddressField(index, "street", event.target.value)}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField label="Ciudad" required>
                  <Input
                    placeholder="Ciudad"
                    value={address.city}
                    onChange={(event) => updateAddressField(index, "city", event.target.value)}
                    required
                  />
                </FormField>
                <FormField label="País" required>
                  <Input
                    placeholder="País"
                    value={address.country}
                    onChange={(event) => updateAddressField(index, "country", event.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Código postal" required>
                  <Input
                    placeholder="Código postal"
                    value={address.postal}
                    onChange={(event) => updateAddressField(index, "postal", event.target.value)}
                    required
                  />
                </FormField>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-fit border-danger/40 text-danger hover:bg-danger/10"
                onClick={() => removeAddress(index)}
                disabled={isLoading}
              >
                Eliminar dirección
              </Button>
            </div>
          </div>
        ))}

        <Button type="button" onClick={addAddress} disabled={isLoading} variant="outline" className="w-fit">
          Añadir dirección
        </Button>

        <Button type="button" onClick={handleSave} disabled={isLoading} className="w-fit gap-2">
          {isLoading ? <Spinner /> : null}
          {isLoading ? "Guardando..." : "Guardar direcciones"}
        </Button>
      </div>
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

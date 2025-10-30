"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Container} from "@/components/ui/container";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Price} from "@/components/ui/price";
import {products} from "@/data/products";
import {selectCartTotal, useCartStore} from "@/stores/cart-store";
import {useToast} from "@/hooks/use-toast";
import {useUser} from "@/providers/user-provider";
import type {Address, UserUpdatePayload} from "@/types/user";

import {loadStripe, type Stripe} from "@stripe/stripe-js";
import NextLink from "next/link";

let stripePromise: Promise<Stripe | null> | undefined;

function getStripe() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada.");
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

type CheckoutFormData = {
  name: string;
  email: string;
  label: string;
  street: string;
  city: string;
  country: string;
  postal: string;
};

export function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore(selectCartTotal);
  const currency = useCartStore((state) => state.currency);
  const {user, updateUser, status} = useUser();
  const toast = useToast();
  const methods = useForm<CheckoutFormData>({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      label: "",
      street: "",
      city: "",
      country: "",
      postal: "",
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: {isSubmitting, errors},
  } = methods;

  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveAddress, setSaveAddress] = useState(false);

  const addresses = useMemo(() => user?.addresses ?? [], [user]);

  const cartLines = useMemo(
    () =>
      items.map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        const name = product?.name ?? item.variant.name;
        return {
          id: `${item.productId}-${item.variant.id}`,
          name,
          variantName: item.variant.name,
          quantity: item.quantity,
          subtotal: item.variant.price * item.quantity,
        };
      }),
    [items],
  );

  const applyAddressToForm = useCallback(
    (address?: Address) => {
      setValue("label", address?.label ?? "");
      setValue("street", address?.street ?? "");
      setValue("city", address?.city ?? "");
      setValue("country", address?.country ?? "");
      setValue("postal", address?.postal ?? "");
    },
    [setValue],
  );

  useEffect(() => {
    if (user) {
      setValue("name", user.name ?? "");
      setValue("email", user.email);
      if (addresses.length > 0 && selectedAddressId === "new") {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [user, addresses, selectedAddressId, setValue]);

  useEffect(() => {
    if (selectedAddressId === "new") {
      applyAddressToForm();
      setSaveAddress(true);
      return;
    }
    const selected = addresses.find((address) => address.id === selectedAddressId);
    if (selected) {
      applyAddressToForm(selected);
      setSaveAddress(false);
    }
  }, [selectedAddressId, addresses, applyAddressToForm]);

  const hasItems = items.length > 0;
  const isLoading = isSubmitting || status === "loading";

  const onSubmit = useCallback(
    async (formData: CheckoutFormData) => {
      if (!user) {
        toast({title: "Inicia sesión para continuar", status: "warning"});
        return;
      }
      if (!hasItems) {
        toast({title: "Tu carrito está vacío", status: "info"});
        return;
      }

      const shippingAddress = {
        label: formData.label.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        postal: formData.postal.trim(),
      };

      try {
        const updatePayload: UserUpdatePayload = {};
        if (formData.name.trim() !== (user.name ?? "")) updatePayload.name = formData.name.trim() || null;
        if (formData.email !== user.email) updatePayload.email = formData.email;

        if (saveAddress) {
          const baseAddresses = addresses.map(({label, street, city, country, postal}) => ({label, street, city, country, postal}));
          let nextAddresses;
          const existingIndex = addresses.findIndex((address) => address.id === selectedAddressId);
          if (selectedAddressId === "new" || existingIndex === -1) {
            nextAddresses = [...baseAddresses, shippingAddress];
          } else {
            nextAddresses = baseAddresses.map((address, index) => (index === existingIndex ? shippingAddress : address));
          }
          updatePayload.addresses = nextAddresses;
        }

        if (Object.keys(updatePayload).length > 0) {
          const latestUser = await updateUser(updatePayload);
          if (saveAddress) {
            const persisted = latestUser.addresses.find(
              (a) => a.street === shippingAddress.street && a.city === shippingAddress.city,
            );
            if (persisted) setSelectedAddressId(persisted.id);
          }
        }

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            userId: user.id,
            items: items.map((item) => ({productId: item.productId, variantId: item.variant.id, quantity: item.quantity})),
            currency,
            customer: {email: formData.email, name: formData.name},
            shippingAddress,
          }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error ?? "No se pudo iniciar el proceso de pago.");

        const sessionId = payload?.sessionId;
        if (!sessionId) throw new Error("La pasarela de pagos no devolvió una sesión válida.");

        const stripe = await getStripe();
        if (!stripe) throw new Error("No se pudo inicializar Stripe.");

        const {error: stripeError} = await stripe.redirectToCheckout({sessionId});
        if (stripeError) throw new Error(stripeError.message ?? "No se pudo redirigir a Stripe.");
      } catch (error) {
        console.error(error);
        toast({
          title: "Error al procesar el checkout",
          description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
          status: "error",
        });
      }
    },
    [user, hasItems, toast, saveAddress, addresses, selectedAddressId, updateUser, items, currency],
  );

  return (
    <FormProvider {...methods}>
      <Container maxW="6xl" py={{base: 10, md: 16}}>
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-semibold md:text-4xl">Checkout</h1>
          <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-12">
            <div>
              <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="rounded-2xl border border-white/10 bg-background/60 p-6">
                  <h2 className="mb-4 text-xl font-semibold">Datos de envío</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        {...register("name", {required: "El nombre es obligatorio"})}
                      />
                      {errors.name ? (
                        <p className="text-sm text-red-400">{errors.name.message}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        placeholder="tu@email.com"
                        type="email"
                        {...register("email", {required: "El correo es obligatorio"})}
                      />
                      {errors.email ? (
                        <p className="text-sm text-red-400">{errors.email.message}</p>
                      ) : null}
                    </div>
                  </div>

                  {addresses.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-2">
                      <Label htmlFor="saved-address">Direcciones guardadas</Label>
                      <select
                        id="saved-address"
                        className="h-10 rounded-md border border-white/15 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        value={selectedAddressId}
                        onChange={(event) => setSelectedAddressId(event.target.value)}
                      >
                        <option value="new">Usar una nueva dirección</option>
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.label} · {address.street}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="label">Nombre para la dirección</Label>
                      <Input id="label" placeholder="Casa, oficina, etc." {...register("label")} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="street">Dirección</Label>
                      <Input
                        id="street"
                        placeholder="Calle, número, colonia"
                        {...register("street", {required: "La dirección es obligatoria"})}
                      />
                      {errors.street ? (
                        <p className="text-sm text-red-400">{errors.street.message}</p>
                      ) : null}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          placeholder="Ciudad"
                          {...register("city", {required: "La ciudad es obligatoria"})}
                        />
                        {errors.city ? (
                          <p className="text-sm text-red-400">{errors.city.message}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="country">País o estado</Label>
                        <Input
                          id="country"
                          placeholder="México, CDMX..."
                          {...register("country", {required: "El país es obligatorio"})}
                        />
                        {errors.country ? (
                          <p className="text-sm text-red-400">{errors.country.message}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="postal">Código postal</Label>
                        <Input
                          id="postal"
                          placeholder="00000"
                          {...register("postal", {required: "El código postal es obligatorio"})}
                        />
                        {errors.postal ? (
                          <p className="text-sm text-red-400">{errors.postal.message}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm text-white/80">
                    <Checkbox checked={saveAddress} onCheckedChange={(value) => setSaveAddress(Boolean(value))} />
                    {selectedAddressId === "new"
                      ? "Guardar esta dirección"
                      : "Actualizar la dirección guardada"}
                  </label>
                </div>

                <div className="rounded-2xl border border-white/10 bg-background/60 p-6">
                  <Button
                    className="w-full sm:w-auto"
                    disabled={!hasItems || !user || isLoading}
                    size="lg"
                    type="submit"
                  >
                    {hasItems ? "Confirmar y pagar con Stripe" : "Agrega productos para continuar"}
                  </Button>
                </div>
              </form>
            </div>
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-white/10 bg-background/60 p-6">
                <h2 className="mb-4 text-xl font-semibold">Resumen de compra</h2>
                {cartLines.length === 0 ? (
                  <div className="flex flex-col gap-3 text-sm text-white/70">
                    <p>Tu carrito está vacío.</p>
                    <Button asChild variant="outline">
                      <NextLink href="/shop">Descubrir cervezas</NextLink>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-sm">
                    {cartLines.map((line) => (
                      <div key={line.id} className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-white">{line.name}</span>
                          <span className="text-white/70">
                            {line.variantName} · Cantidad: {line.quantity}
                          </span>
                        </div>
                        <Price amount={line.subtotal} currency={currency} />
                      </div>
                    ))}
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center justify-between text-base font-semibold text-white">
                      <span>Total</span>
                      <Price amount={total} currency={currency} className="text-lg font-bold" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </FormProvider>
  );
}

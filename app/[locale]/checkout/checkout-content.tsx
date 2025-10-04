"use client";

import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  chakra,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

import { Price } from "@/components/ui/price";
import { products } from "@/data/products";
import { selectCartTotal, useCartStore } from "@/stores/cart-store";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n/client";
import { useUser } from "@/providers/user-provider";
import type { Address, UserUpdatePayload } from "@/types/user";

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
  const locale = useLocale();
  const items = useCartStore((state) => state.items);
  const total = useCartStore(selectCartTotal);
  const currency = useCartStore((state) => state.currency);
  const { user, updateUser, status } = useUser();
  const toast = useToast();
  const methods = useForm<CheckoutFormData>({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      label: "", street: "", city: "", country: "", postal: ""
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
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
    [items]
  );

  const applyAddressToForm = useCallback(
    (address?: Address) => {
      setValue("label", address?.label ?? "");
      setValue("street", address?.street ?? "");
      setValue("city", address?.city ?? "");
      setValue("country", address?.country ?? "");
      setValue("postal", address?.postal ?? "");
    },
    [setValue]
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
        toast({ title: "Inicia sesión para continuar", status: "warning", isClosable: true });
        return;
      }
      if (!hasItems) {
        toast({ title: "Tu carrito está vacío", status: "info", isClosable: true });
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
          const baseAddresses = addresses.map(({ label, street, city, country, postal }) => ({ label, street, city, country, postal }));
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
              (a) => a.street === shippingAddress.street && a.city === shippingAddress.city
            );
            if (persisted) setSelectedAddressId(persisted.id);
          }
        }

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            items: items.map((item) => ({ productId: item.productId, variantId: item.variant.id, quantity: item.quantity })),
            currency,
            customer: { email: formData.email, name: formData.name },
            shippingAddress,
            locale,
          }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error ?? "No se pudo iniciar el proceso de pago.");
        
        const sessionId = payload?.sessionId;
        if (!sessionId) throw new Error("La pasarela de pagos no devolvió una sesión válida.");

        const stripe = await getStripe();
        if (!stripe) throw new Error("No se pudo inicializar Stripe.");

        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
        if (stripeError) throw new Error(stripeError.message ?? "No se pudo redirigir a Stripe.");

      } catch (error) {
        console.error(error);
        toast({ title: "Error al procesar el checkout", description: error instanceof Error ? error.message : "Ocurrió un error inesperado.", status: "error", isClosable: true });
      }
    },
    [user, hasItems, toast, saveAddress, addresses, selectedAddressId, updateUser, items, currency, locale]
  );

  return (
    <FormProvider {...methods}>
      <Container maxW="6xl" py={{ base: 10, md: 16 }}>
        <Heading size="2xl" mb={8} textAlign={{ base: "center", lg: "left" }}>
          Checkout
        </Heading>
        <Grid gap={{ base: 10, lg: 12 }} templateColumns={{ base: "1fr", lg: "3fr 2fr" }}>
          <GridItem>
            <chakra.form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={6}>
                <Box borderRadius="2xl" borderWidth="1px" p={6}>
                  <Heading size="md" mb={4}>Datos de envío</Heading>
                  <Stack spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired isInvalid={!!errors.name}>
                        <FormLabel>Nombre completo</FormLabel>
                        <Input placeholder="Tu nombre" {...register("name", { required: "El nombre es obligatorio" })} />
                        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={!!errors.email}>
                        <FormLabel>Correo electrónico</FormLabel>
                        <Input placeholder="tu@email.com" type="email" {...register("email", { required: "El correo es obligatorio" })} />
                        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                      </FormControl>
                    </SimpleGrid>

                    {addresses.length > 0 && (
                      <FormControl>
                        <FormLabel>Direcciones guardadas</FormLabel>
                        <Select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                          <option value="new">Usar una nueva dirección</option>
                          {addresses.map((address) => (
                            <option key={address.id} value={address.id}>{address.label} · {address.street}</option>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <FormControl>
                      <FormLabel>Nombre para la dirección</FormLabel>
                      <Input placeholder="Casa, oficina, etc." {...register("label")} />
                    </FormControl>
                    <FormControl isRequired isInvalid={!!errors.street}>
                      <FormLabel>Dirección</FormLabel>
                      <Input placeholder="Calle, número, colonia" {...register("street", { required: "La dirección es obligatoria" })} />
                      <FormErrorMessage>{errors.street?.message}</FormErrorMessage>
                    </FormControl>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <FormControl isRequired isInvalid={!!errors.city}>
                        <FormLabel>Ciudad</FormLabel>
                        <Input placeholder="Ciudad" {...register("city", { required: "La ciudad es obligatoria" })} />
                        <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={!!errors.country}>
                        <FormLabel>País o estado</FormLabel>
                        <Input placeholder="México, CDMX..." {...register("country", { required: "El país es obligatorio" })} />
                        <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={!!errors.postal}>
                        <FormLabel>Código postal</FormLabel>
                        <Input placeholder="00000" {...register("postal", { required: "El código postal es obligatorio" })} />
                        <FormErrorMessage>{errors.postal?.message}</FormErrorMessage>
                      </FormControl>
                    </SimpleGrid>

                    <Checkbox isChecked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)}>
                      {selectedAddressId === "new" ? "Guardar esta dirección" : "Actualizar la dirección guardada"}
                    </Checkbox>
                  </Stack>
                </Box>
                <Box borderRadius="2xl" borderWidth="1px" p={6}>
                  <Button mt={2} size="lg" type="submit" w={{ base: "full", sm: "auto" }} isLoading={isLoading} isDisabled={!hasItems || !user}>
                    {hasItems ? "Confirmar y pagar con Stripe" : "Agrega productos para continuar"}
                  </Button>
                </Box>
              </Stack>
            </chakra.form>
          </GridItem>
          <GridItem>
            <Stack spacing={6}>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Heading size="md" mb={4}>Resumen de compra</Heading>
                <Stack spacing={4}>
                  {cartLines.length === 0 ? (
                    <Stack spacing={3}>
                      <Text color="whiteAlpha.700">Tu carrito está vacío.</Text>
                      <Button as={Link} href="/shop" variant="outline">Descubrir cervezas</Button>
                    </Stack>
                  ) : (
                    <Stack spacing={4}>
                      {cartLines.map((line) => (
                        <Stack key={line.id} direction="row" justify="space-between" spacing={4}>
                          <Stack spacing={1}>
                            <Text fontWeight="semibold">{line.name}</Text>
                            <Text color="whiteAlpha.700" fontSize="sm">{line.variantName} · Cantidad: {line.quantity}</Text>
                          </Stack>
                          <Price amount={line.subtotal} currency={currency} />
                        </Stack>
                      ))}
                      <Box borderTopWidth="1px" pt={4}>
                        <Stack direction="row" justify="space-between" spacing={4}>
                          <Text fontWeight="bold">Total</Text>
                          <Price amount={total} currency={currency} fontSize="lg" fontWeight="bold" />
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    </FormProvider>
  );
}

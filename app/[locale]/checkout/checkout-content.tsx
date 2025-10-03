"use client";

import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
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
  useToast
} from "@chakra-ui/react";

import {ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Price} from "@/components/ui/price";
import {products} from "@/data/products";
import {selectCartTotal, useCartStore} from "@/stores/cart-store";
import {formatCurrency} from "@/utils/currency";
import {Link} from "@/i18n/navigation";
import {useUser} from "@/providers/user-provider";
import type {Address} from "@/types/user";

const initialFormState = {
  name: "",
  email: "",
  label: "",
  street: "",
  city: "",
  country: "",
  postal: ""
};

export function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore(selectCartTotal);
  const currency = useCartStore((state) => state.currency);
  const {user, updateUser, status} = useUser();
  const toast = useToast();
  const [form, setForm] = useState(initialFormState);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitialized = useRef(false);

  const addresses = useMemo(() => user?.addresses ?? [], [user]);

  const applyAddressToForm = useCallback((address?: Address) => {
    setForm((current) => ({
      ...current,
      label: address?.label ?? "",
      street: address?.street ?? "",
      city: address?.city ?? "",
      country: address?.country ?? "",
      postal: address?.postal ?? ""
    }));
  }, []);

  useEffect(() => {
    if (!user) {
      setForm(initialFormState);
      setSelectedAddressId("new");
      setSaveAddress(false);
      hasInitialized.current = false;
      return;
    }

    setForm((current) => ({
      ...current,
      name: user.name ?? "",
      email: user.email
    }));

    if (!hasInitialized.current) {
      if (addresses.length > 0) {
        const defaultAddress = addresses[0];
        setSelectedAddressId(defaultAddress.id);
        applyAddressToForm(defaultAddress);
        setSaveAddress(false);
      } else {
        setSelectedAddressId("new");
        applyAddressToForm();
        setSaveAddress(true);
      }

      hasInitialized.current = true;
    }
  }, [user, addresses, applyAddressToForm]);

  useEffect(() => {
    if (selectedAddressId === "new") {
      if (hasInitialized.current) {
        applyAddressToForm();
      }
      return;
    }

    const selected = addresses.find((address) => address.id === selectedAddressId);

    if (selected) {
      applyAddressToForm(selected);
    }
  }, [selectedAddressId, addresses, applyAddressToForm]);

  useEffect(() => {
    if (addresses.length === 0) {
      setSelectedAddressId("new");
      return;
    }

    setSelectedAddressId((current) => {
      if (current === "new") {
        return current;
      }

      return addresses.some((address) => address.id === current) ? current : addresses[0].id;
    });
  }, [addresses]);

  const handleFormChange = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({...current, [field]: event.target.value}));
  };

  const handleAddressSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedAddressId(value);
    setSaveAddress(value === "new" ? true : false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields = ["name", "email", "street", "city", "country", "postal"] as const;
    const hasEmptyField = requiredFields.some((field) => form[field].trim().length === 0);

    if (hasEmptyField) {
      toast({
        title: "Completa tus datos",
        description: "Revisa que todos los campos obligatorios estén llenos.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
      return;
    }

    setIsSubmitting(true);
    let addressSaved = false;
    const previousSelection = selectedAddressId;
    const previousIndex = addresses.findIndex((address) => address.id === previousSelection);

    try {
      if (user && saveAddress) {
        const sanitizedAddress = {
          label:
            form.label.trim() ||
            (selectedAddressId === "new"
              ? "Dirección de envío"
              : addresses.find((address) => address.id === selectedAddressId)?.label ?? "Dirección de envío"),
          street: form.street.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
          postal: form.postal.trim()
        };

        const nextAddresses =
          selectedAddressId === "new"
            ? [
                ...addresses.map(({label, street, city, country, postal}) => ({
                  label,
                  street,
                  city,
                  country,
                  postal
                })),
                sanitizedAddress
              ]
            : addresses.map((address) =>
                address.id === selectedAddressId
                  ? sanitizedAddress
                  : {
                      label: address.label,
                      street: address.street,
                      city: address.city,
                      country: address.country,
                      postal: address.postal
                    }
              );

        const updatedUser = await updateUser({addresses: nextAddresses});
        addressSaved = true;
        if (selectedAddressId === "new") {
          const latestAddress = updatedUser.addresses[updatedUser.addresses.length - 1];
          if (latestAddress) {
            setSelectedAddressId(latestAddress.id);
          }
        } else if (previousIndex >= 0) {
          const replacement = updatedUser.addresses[previousIndex];
          if (replacement) {
            setSelectedAddressId(replacement.id);
          }
        }
        setSaveAddress(false);
      }

      toast({
        title: "¡Listo para pagar!",
        description: addressSaved
          ? previousSelection === "new"
            ? "Añadimos la dirección a tu libreta para futuras compras."
            : "Actualizamos tu dirección guardada con los datos más recientes."
          : "Tus datos están listos. Continúa con el pago para finalizar tu pedido.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: "No se pudo guardar la información",
        description: error instanceof Error ? error.message : "Intenta de nuevo en unos minutos.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || status === "loading";
  const hasItems = items.length > 0;

  return (
    <Container maxW="6xl" py={{base: 10, md: 16}}>
      <Heading size="2xl" mb={8} textAlign={{base: "center", lg: "left"}}>
        Checkout
      </Heading>
      <Grid gap={{base: 10, lg: 12}} templateColumns={{base: "1fr", lg: "3fr 2fr"}}>
        <GridItem>
          <chakra.form onSubmit={handleSubmit} noValidate>
            <Stack spacing={6}>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Heading size="md" mb={4}>
                  Datos de envío
                </Heading>
                <Stack spacing={4}>
                  {user ? (
                    <Text color="whiteAlpha.700">
                      Hola {user.name ?? user.email}, usa una dirección guardada o agrega una nueva para tu envío.
                    </Text>
                  ) : (
                    <Text color="whiteAlpha.700">
                      ¿Tienes cuenta? {""}
                      <chakra.span as={Link} href="/account" color="gold.300">
                        Inicia sesión
                      </chakra.span>{" "}
                      para guardar tus datos y acelerar tus próximas compras.
                    </Text>
                  )}
                  <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Nombre completo</FormLabel>
                      <Input
                        placeholder="Tu nombre"
                        value={form.name}
                        onChange={handleFormChange("name")}
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Correo electrónico</FormLabel>
                      <Input
                        placeholder="tu@email.com"
                        type="email"
                        value={form.email}
                        onChange={handleFormChange("email")}
                        autoComplete="email"
                      />
                    </FormControl>
                  </SimpleGrid>
                  {user && addresses.length > 0 ? (
                    <FormControl>
                      <FormLabel>Direcciones guardadas</FormLabel>
                      <Select value={selectedAddressId} onChange={handleAddressSelect}>
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.label} · {address.street}
                          </option>
                        ))}
                        <option value="new">Usar una nueva dirección</option>
                      </Select>
                      <FormHelperText color="whiteAlpha.600">
                        Selecciona una dirección existente o elige “Usar una nueva dirección” para capturarla.
                      </FormHelperText>
                    </FormControl>
                  ) : null}
                  {user ? (
                    <FormControl>
                      <FormLabel>Etiqueta de la dirección</FormLabel>
                      <Input
                        placeholder="Casa, oficina, etc."
                        value={form.label}
                        onChange={handleFormChange("label")}
                      />
                    </FormControl>
                  ) : null}
                  <FormControl isRequired>
                    <FormLabel>Dirección</FormLabel>
                    <Input
                      placeholder="Calle, número, colonia"
                      value={form.street}
                      onChange={handleFormChange("street")}
                      autoComplete="street-address"
                    />
                  </FormControl>
                  <SimpleGrid columns={{base: 1, md: 3}} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Ciudad</FormLabel>
                      <Input
                        placeholder="Ciudad"
                        value={form.city}
                        onChange={handleFormChange("city")}
                        autoComplete="address-level2"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>País</FormLabel>
                      <Input
                        placeholder="País"
                        value={form.country}
                        onChange={handleFormChange("country")}
                        autoComplete="country-name"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Código postal</FormLabel>
                      <Input
                        placeholder="Código postal"
                        value={form.postal}
                        onChange={handleFormChange("postal")}
                        autoComplete="postal-code"
                      />
                    </FormControl>
                  </SimpleGrid>
                  {user ? (
                    <Box>
                      <Checkbox
                        isChecked={saveAddress}
                        onChange={(event) => setSaveAddress(event.target.checked)}
                        isDisabled={status === "loading"}
                      >
                        Guardar esta dirección para futuras compras
                      </Checkbox>
                      <FormHelperText color="whiteAlpha.600">
                        {selectedAddressId === "new"
                          ? "La añadiremos a tu libreta de direcciones."
                          : "Actualizaremos la dirección seleccionada con estos datos."}
                      </FormHelperText>
                    </Box>
                  ) : (
                    <Text color="whiteAlpha.600">
                      Crea una cuenta o inicia sesión para guardar tus direcciones y agilizar tu checkout.
                    </Text>
                  )}
                </Stack>
              </Box>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Heading size="md" mb={4}>
                  Métodos de pago
                </Heading>
                <Text color="whiteAlpha.700">
                  Integración con Stripe lista. Configura STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET para habilitar pagos reales.
                </Text>
                <Button
                  mt={6}
                  size="lg"
                  type="submit"
                  w={{base: "full", sm: "auto"}}
                  isLoading={isLoading}
                  isDisabled={!hasItems}
                >
                  {hasItems ? "Confirmar y pagar con Stripe" : "Agrega productos para continuar"}
                </Button>
              </Box>
            </Stack>
          </chakra.form>
        </GridItem>
        <GridItem>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md" mb={4}>
              Resumen de compra
            </Heading>
            <Stack spacing={4}>
              {items.map((item) => {
                const product = products.find((productItem) => productItem.id === item.productId);

                if (!product) return null;

                return (
                  <Box key={`${item.productId}-${item.variant.id}`}>
                    <Text fontWeight="semibold">{product.name}</Text>
                    <Text color="whiteAlpha.700">{item.variant.name}</Text>
                    <Text>{item.quantity} unidades</Text>
                    <Price amount={item.variant.price} />
                  </Box>
                );
              })}
            </Stack>
            <Stack mt={6} spacing={2}>
              <Text color="whiteAlpha.600">Total</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {formatCurrency(total, currency)}
              </Text>
            </Stack>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}

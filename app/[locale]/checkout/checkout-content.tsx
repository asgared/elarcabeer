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
  useToast,
} from "@chakra-ui/react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

import { Price } from "@/components/ui/price";
import { products } from "@/data/products";
import { selectCartTotal, useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/utils/currency";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/providers/user-provider";
import type { Address } from "@/types/user";

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
  const { user, updateUser, status } = useUser();
  const toast = useToast();
  const methods = useForm<CheckoutFormData>({
    defaultValues: {
      name: "",
      email: "",
      label: "",
      street: "",
      city: "",
      country: "",
      postal: "",
    },
  });
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;

  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveAddress, setSaveAddress] = useState(false);

  const addresses = useMemo(() => user?.addresses ?? [], [user]);

  const applyAddressToForm = useCallback((address?: Address) => {
    setValue("label", address?.label ?? "");
    setValue("street", address?.street ?? "");
    setValue("city", address?.city ?? "");
    setValue("country", address?.country ?? "");
    setValue("postal", address?.postal ?? "");
  }, [setValue]);

  useEffect(() => {
    if (user) {
      setValue("name", user.name ?? "");
      setValue("email", user.email);
      if (addresses.length > 0 && selectedAddressId === "new") {
          const defaultAddress = addresses[0];
          setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [user, addresses, setValue, selectedAddressId]);

  useEffect(() => {
    if (selectedAddressId === "new") {
      applyAddressToForm();
      setSaveAddress(true);
    } else {
      const selected = addresses.find((address) => address.id === selectedAddressId);
      if (selected) {
        applyAddressToForm(selected);
        setSaveAddress(false);
      }
    }
  }, [selectedAddressId, addresses, applyAddressToForm]);


  const onSubmit = async (formData: CheckoutFormData) => {
    try {
        if (user && saveAddress) {
            console.log("Guardando dirección:", formData);
            await updateUser({ addresses: [ /* ... tu lógica de `nextAddresses` ... */ ] });
        }
        toast({
            title: "¡Listo para pagar!",
            description: "Tus datos están listos. Continúa con el pago.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Ocurrió un error",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    }
  };

  const isLoading = isSubmitting || status === "loading";
  const hasItems = items.length > 0;

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
                  <Heading size="md" mb={4}>
                    Datos de envío
                  </Heading>
                  <Stack spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Nombre completo</FormLabel>
                        <Input placeholder="Tu nombre" {...register("name")} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Correo electrónico</FormLabel>
                        <Input placeholder="tu@email.com" type="email" {...register("email")} />
                      </FormControl>
                    </SimpleGrid>
                    <FormControl isRequired>
                        <FormLabel>Dirección</FormLabel>
                        <Input placeholder="Calle, número, colonia" {...register("street")} />
                    </FormControl>
                  </Stack>
                </Box>
                <Box borderRadius="2xl" borderWidth="1px" p={6}>
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
            {/* ... Tu GridItem del resumen de compra se queda igual ... */}
          </GridItem>
        </Grid>
      </Container>
    </FormProvider>
  );
}

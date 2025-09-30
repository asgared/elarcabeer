"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react";
import type {AlertStatus} from "@chakra-ui/react";
import {useEffect, useMemo, useState} from "react";

import {useUser} from "@/providers/user-provider";
import type {AddressInput} from "@/types/user";

type Feedback = {type: Extract<AlertStatus, "success" | "error">; message: string};

const emptyAddress: AddressInput = {
  label: "",
  street: "",
  city: "",
  country: "",
  postal: ""
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
        postal
      }))
    );
  }, [user]);

  const alert = useMemo(() => feedback ?? (error ? {type: "error", message: error} : null), [feedback, error]);
  const isLoading = status === "loading";

  if (!user) {
    return (
      <Stack spacing={4}>
        <Heading size="lg">Tus direcciones</Heading>
        <Text color="whiteAlpha.700">Inicia sesión para gestionar tus direcciones de envío.</Text>
      </Stack>
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
      postal: address.postal.trim()
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
        message: error instanceof Error ? error.message : "No se pudieron actualizar las direcciones"
      });
    }
  };

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="lg">Tus direcciones</Heading>
        <Text color="whiteAlpha.700">Administra tus ubicaciones de entrega habituales.</Text>
      </Stack>

      {alert && (
        <Alert status={alert.type} borderRadius="md">
          <AlertIcon />
          <Stack spacing={1}>
            <AlertTitle>{alert.type === "success" ? "Direcciones guardadas" : "Error"}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Stack>
        </Alert>
      )}

      <Stack spacing={4}>
        {addresses.length === 0 && (
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Text color="whiteAlpha.700">No tienes direcciones guardadas todavía.</Text>
          </Box>
        )}

        {addresses.map((address, index) => (
          <Box key={`address-${index}`} borderRadius="2xl" borderWidth="1px" p={6}>
            <Stack spacing={4}>
              <SimpleGrid columns={{base: 1, md: 2}} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Etiqueta</FormLabel>
                  <Input
                    placeholder="Casa, oficina, etc."
                    value={address.label}
                    onChange={(event) => updateAddressField(index, "label", event.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Calle y número</FormLabel>
                  <Input
                    placeholder="Calle, número exterior e interior"
                    value={address.street}
                    onChange={(event) => updateAddressField(index, "street", event.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{base: 1, md: 3}} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Ciudad</FormLabel>
                  <Input
                    placeholder="Ciudad"
                    value={address.city}
                    onChange={(event) => updateAddressField(index, "city", event.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>País</FormLabel>
                  <Input
                    placeholder="País"
                    value={address.country}
                    onChange={(event) => updateAddressField(index, "country", event.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Código postal</FormLabel>
                  <Input
                    placeholder="Código postal"
                    value={address.postal}
                    onChange={(event) => updateAddressField(index, "postal", event.target.value)}
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                variant="ghost"
                colorScheme="red"
                alignSelf="flex-start"
                onClick={() => removeAddress(index)}
                isDisabled={isLoading}
              >
                Eliminar dirección
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Stack direction={{base: "column", sm: "row"}} spacing={4}>
        <Button variant="outline" onClick={addAddress} isDisabled={isLoading}>
          Agregar dirección
        </Button>
        <Button colorScheme="yellow" onClick={handleSave} isLoading={isLoading} loadingText="Guardando">
          Guardar direcciones
        </Button>
      </Stack>
    </Stack>
  );
}

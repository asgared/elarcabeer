"use client";

import {useState} from "react";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";
import {useRouter} from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "No se pudo iniciar sesión.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={24}>
      <Stack spacing={8}>
        <Stack spacing={3} textAlign="center">
          <Heading size="xl">Panel administrativo</Heading>
          <Text color="whiteAlpha.700">Ingresa tus credenciales de administrador para gestionar el contenido.</Text>
        </Stack>
        <Box as="form" onSubmit={handleSubmit} borderWidth="1px" borderRadius="xl" p={8} bg="background.800">
          <Stack spacing={6}>
            <FormControl id="email" isRequired>
              <FormLabel>Correo electrónico</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@elarca.mx"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
            </FormControl>
            {error ? (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" colorScheme="teal" isLoading={isLoading} loadingText="Ingresando">
              Ingresar
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Box, Heading, Text, VStack, Container } from "@chakra-ui/react";

function ConfirmContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [code, setCode] = useState<string | null>(null);
    const [errorInfo, setErrorInfo] = useState<{ code: string; message: string } | null>(null);

    useEffect(() => {
        const error = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");

        if (error || errorCode) {
            setErrorInfo({
                code: errorCode || (error as string),
                message: errorDescription || "El enlace es inválido o ha expirado."
            });
            return;
        }

        const codeParam = searchParams.get("code");
        if (codeParam) {
            setCode(codeParam);
        }
    }, [searchParams]);

    const handleConfirm = () => {
        if (code) {
            // Redirigir al callback real con el código
            router.push(`/auth/callback?code=${code}`);
        } else {
            router.push("/");
        }
    };

    if (errorInfo) {
        return (
            <Container maxW="md" py={20}>
                <VStack spacing={8} textAlign="center" bg="neutral.900" p={10} borderRadius="xl" border="1px" borderColor="red.900/30">
                    <Heading color="red.500">Error de Activación</Heading>
                    <Text color="whiteAlpha.800">
                        {errorInfo.message}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                        Error: {errorInfo.code}
                    </Text>
                    <Button
                        colorScheme="amber"
                        variant="outline"
                        size="lg"
                        width="full"
                        onClick={() => router.push("/account")}
                    >
                        Volver a intentar registro
                    </Button>
                </VStack>
            </Container>
        );
    }

    return (
        <Container maxW="md" py={20}>
            <VStack spacing={8} textAlign="center" bg="neutral.900" p={10} borderRadius="xl" border="1px" borderColor="whiteAlpha.200">
                <Heading color="amber.500">Confirmar Cuenta</Heading>
                <Text color="whiteAlpha.800">
                    Haz clic en el botón de abajo para completar la activación de tu cuenta.
                    Asegúrate de estar usando el mismo navegador donde iniciaste el registro.
                </Text>
                <Button
                    colorScheme="amber"
                    size="lg"
                    width="full"
                    onClick={handleConfirm}
                    isDisabled={!code}
                >
                    Confirmar y Activar
                </Button>
            </VStack>
        </Container>
    );
}

export default function ConfirmPage() {
    return (
        <Box bg="neutral.950" minH="screen">
            <Suspense fallback={<Text color="white">Cargando...</Text>}>
                <ConfirmContent />
            </Suspense>
        </Box>
    );
}

"use client";

import { Button, Stack, useToast } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "facebook" | "apple";

type ProviderConfig = {
  provider: OAuthProvider;
  label: string;
  icon: IconType;
};

const providers: ProviderConfig[] = [
  { provider: "google", label: "Continuar con Google", icon: FaGoogle },
  // {provider: "facebook", label: "Continuar con Facebook", icon: FaFacebook},
  // {provider: "apple", label: "Continuar con Apple", icon: FaApple}
];

export function OAuthButtons() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const toast = useToast();
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleSignIn = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider);
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      console.error(error);
      toast({
        status: "error",
        title: "No se pudo continuar",
        description:
          error instanceof Error ? error.message : "Inténtalo de nuevo más tarde."
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <Stack spacing={3}>
      {providers.map(({ provider, label, icon: Icon }) => (
        <Button
          key={provider}
          variant="outline"
          leftIcon={<Icon />}
          onClick={() => handleSignIn(provider)}
          isLoading={loadingProvider === provider}
          loadingText="Conectando"
          isDisabled={loadingProvider !== null && loadingProvider !== provider}
          width="full"
        >
          {label}
        </Button>
      ))}
    </Stack>
  );
}

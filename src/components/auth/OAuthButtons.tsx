"use client";

import {useMemo, useState} from "react";
import type {IconType} from "react-icons";
import {FaApple, FaFacebook, FaGoogle} from "react-icons/fa";

import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";

type OAuthProvider = "google" | "facebook" | "apple";

type ProviderConfig = {
  provider: OAuthProvider;
  label: string;
  icon: IconType;
};

const providers: ProviderConfig[] = [
  {provider: "google", label: "Continuar con Google", icon: FaGoogle},
  {provider: "facebook", label: "Continuar con Facebook", icon: FaFacebook},
  {provider: "apple", label: "Continuar con Apple", icon: FaApple}
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
    <div className="flex flex-col gap-3">
      {providers.map(({provider, label, icon: Icon}) => {
        const isLoading = loadingProvider === provider;
        const isDisabled = loadingProvider !== null && loadingProvider !== provider;

        return (
          <Button
            key={provider}
            variant="outline"
            className="flex items-center justify-between gap-3"
            onClick={() => handleSignIn(provider)}
            disabled={isDisabled || isLoading}
            aria-busy={isLoading}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </span>
            {isLoading ? (
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <LoadingSpinner />
                Conectando
              </span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

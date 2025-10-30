"use client";

import {Container} from "@/components/ui/container";
import {AddressesManager} from "@/components/account/addresses-manager";
import {useUser} from "@/providers/user-provider";

export const dynamic = "force-dynamic";

export default function AddressesPage() {
  const {user, status} = useUser();

  const isLoading = status === "initializing" || (status === "loading" && !user);

  return (
    <Container className="max-w-4xl">
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            <p className="text-white/70">Cargando direcciones...</p>
          </div>
        ) : (
          <AddressesManager />
        )}
      </div>
    </Container>
  );
}

"use client";

import {ReactNode, useState} from "react";
import {useRouter} from "next/navigation";
import {FaPowerOff} from "react-icons/fa6";

import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import type {User} from "@prisma/client";

type AdminShellProps = {
  user: User;
  children: ReactNode;
  sidebar: ReactNode; // <-- 1. AÑADIMOS EL NUEVO PROP
};

export function AdminShell({user, children, sidebar}: AdminShellProps) {
  const router = useRouter();
  const toast = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) {
        throw new Error("No se pudo cerrar sesión");
      }
      toast({title: "Sesión finalizada", status: "success"});
      router.replace("/dashboard/login");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error instanceof Error ? error.message : "Intenta de nuevo",
        status: "error",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 3. AJUSTAMOS LA ESTRUCTURA PARA INCLUIR LA BARRA LATERAL
  return (
    <div className="flex min-h-screen bg-background">
      {sidebar}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-background/80 px-8 py-4 backdrop-blur">
          <h1 className="text-lg font-semibold">El Arca · Admin</h1>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="font-semibold">{user.name ?? user.email}</p>
              <p className="text-foreground/60">Administrador</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <LoadingSpinner /> : <FaPowerOff className="h-4 w-4" />}
              {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
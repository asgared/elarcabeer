"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

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

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={24}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-3xl font-semibold">Panel administrativo</h1>
          <p className="text-white/70">Ingresa tus credenciales de administrador para gestionar el contenido.</p>
        </div>
        <form
          className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-background/60 p-8"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              placeholder="admin@elarca.mx"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              placeholder="********"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </Container>
  );
}

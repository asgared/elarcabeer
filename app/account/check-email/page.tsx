"use client";

import NextLink from "next/link";
import {Suspense} from "react";
import {useSearchParams} from "next/navigation";

import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";

function AccountCheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Container className="flex max-w-2xl flex-col items-center py-16 md:py-24">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-semibold">Revisa tu correo electrónico</h1>
        <p className="max-w-xl text-white/70">
          {email
            ? `Hemos enviado un enlace de confirmación a ${email}. Sigue las instrucciones que encontrarás en tu bandeja de entrada.`
            : "Hemos enviado un enlace de confirmación a tu correo. Sigue las instrucciones que encontrarás en tu bandeja de entrada."}
        </p>
        <p className="max-w-xl text-white/70">
          Si no ves el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo envío desde la página de acceso.
        </p>
        <Button asChild>
          <NextLink href="/account">Volver a iniciar sesión</NextLink>
        </Button>
      </div>
    </Container>
  );
}

function AccountCheckEmailFallback() {
  return (
    <Container className="flex max-w-2xl flex-col items-center py-16 md:py-24">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-semibold">Revisa tu correo electrónico</h1>
        <p className="max-w-xl text-white/70">
          Hemos enviado un enlace de confirmación a tu correo. Sigue las instrucciones que encontrarás en tu bandeja de entrada.
        </p>
      </div>
    </Container>
  );
}

export default function AccountCheckEmailPage() {
  return (
    <Suspense fallback={<AccountCheckEmailFallback />}>
      <AccountCheckEmailContent />
    </Suspense>
  );
}

import {Container} from "@/components/ui/container";

export default function PrivacyPage() {
  return (
    <Container maxW="4xl">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Aviso de privacidad
        </h1>
        <p className="text-base text-white/70">
          Resguardamos tus datos conforme a la legislación mexicana. Utilizamos tu información únicamente para
          procesar pedidos, enviar comunicaciones del Arca Crew y mejorar nuestra experiencia digital.
        </p>
      </div>
    </Container>
  );
}

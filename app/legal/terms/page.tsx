import {Container} from "@/components/ui/container";

export default function TermsPage() {
  return (
    <Container maxW="4xl">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Términos y condiciones
        </h1>
        <p className="text-base text-white/70">
          Todas las compras se procesan en MXN. Los precios incluyen IVA. El consumo de alcohol es para mayores de 18 años.
          Consulta políticas de cancelación y devoluciones antes de confirmar tu pedido.
        </p>
      </div>
    </Container>
  );
}

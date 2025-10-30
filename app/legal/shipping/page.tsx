import {Container} from "@/components/ui/container";

export default function ShippingPage() {
  return (
    <Container className="max-w-4xl">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Política de envíos
        </h1>
        <p className="text-base text-white/70">
          Enviamos a todo México desde CDMX. Calculamos tarifas de envío según peso y destino. Los pedidos se procesan en 24h
          y se entregan en 2-5 días hábiles.
        </p>
      </div>
    </Container>
  );
}

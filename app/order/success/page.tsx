import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<p>Cargando confirmación de tu pedido...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
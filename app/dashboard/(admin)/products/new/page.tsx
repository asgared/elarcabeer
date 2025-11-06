import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/products/product-form";

export default function NewProductPage() {
  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title="Crear producto"
        description="Completa el formulario para añadir un nuevo producto al catálogo."
      />
      <ProductForm />
    </div>
  );
}

// En app/dashboard/(admin)/products/new/page.tsx

import ProductForm from "@/components/admin/products/product-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function NewProductPage() {
  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title="Crear Nuevo Producto"
        description="Agrega la información detallada del nuevo producto."
      />
      
      {/* Usamos un layout simple consistente con el dashboard */}
      <Card>
        <CardContent className="p-6">
           {/* Pasar initialProduct=null para activar el modo CREACIÓN */}
           <ProductForm initialProduct={null} /> 
        </CardContent>
      </Card>

    </div>
  );
}

import {notFound} from "next/navigation";

import {prisma} from "@/lib/prisma";
import {AdminStoreForm} from "@/components/admin/admin-store-form";
import {AdminPageHeader} from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

type PageProps = {
  params: {slug: string};
};

async function getStore(slug: string) {
  if (slug === "new") {
    return null;
  }

  return prisma.store.findUnique({where: {slug}});
}

export default async function AdminStoreEditPage({params}: PageProps) {
  const {slug} = params;
  const store = await getStore(slug);

  if (!store && slug !== "new") {
    notFound();
  }

  const title = store ? "Editar Tienda" : "Crear Nueva Tienda";
  const description = store
    ? "Actualiza la información de la tienda seleccionada."
    : "Completa el formulario para registrar una nueva tienda.";

  return (
    <div className="space-y-8">
      <AdminPageHeader title={title} description={description} />
      <AdminStoreForm initialStore={store} />
    </div>
  );
}

import {notFound} from "next/navigation";

import {prisma} from "@/lib/prisma";
import {AdminBlogForm} from "@/components/admin/admin-blog-form";
import {AdminPageHeader} from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

type PageProps = {
  params: {slug: string};
};

async function getPost(slug: string) {
  if (slug === "new") {
    return null;
  }
  const post = await prisma.contentPost.findUnique({
    where: {slug}
  });
  return post;
}

export default async function AdminBlogEditPage({params}: PageProps) {
  const {slug} = params;
  const post = await getPost(slug);

  if (!post && slug !== "new") {
    notFound();
  }

  const title = post ? "Editar Post" : "Crear Nuevo Post";

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title={title}
        description="Gestiona el contenido del blog y mantén informados a tus lectores."
      />
      <AdminBlogForm initialPost={post} />
    </div>
  );
}

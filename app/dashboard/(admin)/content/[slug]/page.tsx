import {notFound} from "next/navigation";

import {AdminContentForm} from "@/components/admin/admin-content-form";
import {getCmsContent} from "@/lib/cms";

export const dynamic = "force-dynamic";

type PageProps = {
  params: {slug: string};
};

export default async function AdminContentDetailPage({params}: PageProps) {
  const {slug} = params;
  const isNew = slug === "new";
  const content = isNew ? null : await getCmsContent(slug);

  if (!isNew && !content) {
    notFound();
  }

  return <AdminContentForm initialContent={content} />;
}

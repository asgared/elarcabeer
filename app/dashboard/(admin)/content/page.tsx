import Link from "next/link";
import {FaPlus, FaRegPenToSquare} from "react-icons/fa6";

import {Button} from "@/components/ui/button";
import {getAllCmsContent} from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const entries = await getAllCmsContent();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Gestión de contenido</h1>
        <Button asChild className="w-full md:w-auto">
          <Link href="/dashboard/content/new">
            <FaPlus className="mr-2 h-4 w-4" /> Nueva sección
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/60">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-left uppercase tracking-wide text-white/70">
            <tr>
              <th className="px-6 py-4 font-semibold">Slug</th>
              <th className="px-6 py-4 font-semibold">Título</th>
              <th className="px-6 py-4 font-semibold">Actualizado</th>
              <th className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-white/5">
                <td className="px-6 py-4 font-mono text-xs uppercase tracking-wide text-white/70">{entry.slug}</td>
                <td className="px-6 py-4 text-white">{entry.title}</td>
                <td className="px-6 py-4 text-white/70">{new Date(entry.updatedAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <Button asChild size="sm" variant="ghost">
                    <Link className="inline-flex items-center gap-2" href={`/dashboard/content/${entry.slug}`}>
                      <FaRegPenToSquare className="h-4 w-4" /> Editar
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

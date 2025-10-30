"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {FaPlus, FaTrashCan} from "react-icons/fa6";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import type {CmsContent, SocialLink} from "@/types/cms";

const EMPTY_LINK: SocialLink = {platform: "", url: ""};

type AdminContentFormProps = {
  initialContent: CmsContent | null;
};

type FormState = {
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  socialLinks: SocialLink[];
};

function normalizeInitialState(initialContent: CmsContent | null): FormState {
  if (!initialContent) {
    return {
      slug: "",
      title: "",
      subtitle: "",
      body: "",
      imageUrl: "",
      socialLinks: []
    };
  }

  return {
    slug: initialContent.slug,
    title: initialContent.title,
    subtitle: initialContent.subtitle ?? "",
    body: initialContent.body ?? "",
    imageUrl: initialContent.imageUrl ?? "",
    socialLinks: initialContent.socialLinks ?? []
  };
}

export function AdminContentForm({initialContent}: AdminContentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const initialState = useMemo(() => normalizeInitialState(initialContent), [initialContent]);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isNew = !initialContent;

  const handleFieldChange = (key: keyof FormState, value: string | SocialLink[]) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleLinkChange = (index: number, key: keyof SocialLink, value: string) => {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, linkIndex) =>
        linkIndex === index
          ? {
              ...link,
              [key]: value
            }
          : link
      )
    }));
  };

  const handleAddLink = () => {
    setForm((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, {...EMPTY_LINK}]
    }));
  };

  const handleRemoveLink = (index: number) => {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((_, linkIndex) => linkIndex !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        subtitle: form.subtitle.trim() || undefined,
        body: form.body.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        socialLinks: form.socialLinks.filter((link) => link.platform && link.url)
      };

      const endpoint = isNew ? "/api/admin/content" : `/api/admin/content/${initialContent?.slug}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar el contenido.");
      }

      toast({title: "Contenido guardado", status: "success"});
      router.replace("/dashboard/content");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar el contenido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialContent) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/content/${initialContent.slug}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo eliminar la sección.");
      }

      toast({title: "Contenido eliminado", status: "success"});
      router.replace("/dashboard/content");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo eliminar la sección.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl rounded-xl border border-white/10 bg-background/80 p-8 shadow-soft"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">
          {isNew ? "Crear sección" : `Editar ${initialContent?.title}`}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(event) => handleFieldChange("slug", event.target.value)}
              placeholder="home-hero"
              disabled={!isNew}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(event) => handleFieldChange("subtitle", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="imageUrl">Imagen destacada (URL)</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl}
              onChange={(event) => handleFieldChange("imageUrl", event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">Descripción</Label>
          <Textarea
            id="body"
            value={form.body}
            onChange={(event) => handleFieldChange("body", event.target.value)}
            rows={6}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Redes sociales</h3>
          <div className="flex flex-col gap-3">
            {form.socialLinks.map((link, index) => (
              <div
                key={`link-${index}`}
                className="grid grid-cols-1 items-center gap-3 rounded-lg border border-white/10 p-3 md:grid-cols-7"
              >
                <div className="flex flex-col gap-2 md:col-span-3">
                  <Label htmlFor={`platform-${index}`} className="text-xs uppercase tracking-wide text-foreground/60">
                    Plataforma
                  </Label>
                  <Input
                    id={`platform-${index}`}
                    value={link.platform}
                    onChange={(event) => handleLinkChange(index, "platform", event.target.value)}
                    placeholder="Instagram"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-3">
                  <Label htmlFor={`url-${index}`} className="text-xs uppercase tracking-wide text-foreground/60">
                    URL
                  </Label>
                  <Input
                    id={`url-${index}`}
                    value={link.url}
                    onChange={(event) => handleLinkChange(index, "url", event.target.value)}
                    placeholder="https://instagram.com/elarca"
                  />
                </div>
                <div className="flex justify-end md:col-span-1">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-danger/40 text-danger transition hover:bg-danger/10"
                    onClick={() => handleRemoveLink(index)}
                    aria-label="Eliminar"
                  >
                    <FaTrashCan className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-fit gap-2" type="button" onClick={handleAddLink}>
              <FaPlus className="h-4 w-4" />
              Agregar red social
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-danger/60 bg-danger/10 p-4 text-sm text-danger-foreground">
            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-danger-foreground">
              !
            </span>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <SmallSpinner /> : null}
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
          {!isNew ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-danger/50 text-danger hover:bg-danger/10"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <SmallSpinner /> : null}
              {isDeleting ? "Eliminando..." : "Eliminar sección"}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function SmallSpinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

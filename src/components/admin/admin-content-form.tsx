"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {FaPlus, FaTrashCan} from "react-icons/fa6";
import {useForm, useFieldArray} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import type {CmsContent, SocialLink} from "@/types/cms";

const socialLinkSchema = z.object({
  platform: z.string().min(1, "Plataforma requerida"),
  url: z.string().url("URL no válida")
});

const contentFormSchema = z.object({
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido (solo minúsculas y guiones)"),
  title: z.string().min(1, "El título es requerido"),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  imageUrl: z
    .string()
    .url("URL de imagen no válida")
    .optional()
    .or(z.literal("")),
  socialLinks: z.array(socialLinkSchema).optional()
});

type ContentFormSchema = z.infer<typeof contentFormSchema>;

const EMPTY_LINK: SocialLink = {platform: "", url: ""};

function normalizeInitialState(initialContent: CmsContent | null): ContentFormSchema {
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

type AdminContentFormProps = {
  initialContent: CmsContent | null;
};

export function AdminContentForm({initialContent}: AdminContentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const initialState = useMemo(() => normalizeInitialState(initialContent), [initialContent]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isNew = !initialContent;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting}
  } = useForm<ContentFormSchema>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: initialState
  });

  const {fields, append, remove} = useFieldArray({
    control,
    name: "socialLinks"
  });

  useEffect(() => {
    reset(initialState);
  }, [initialState, reset]);

  const onSubmit = async (data: ContentFormSchema) => {
    setServerError(null);

    try {
      const payload = {
        slug: data.slug.trim(),
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || undefined,
        body: data.body?.trim() || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
        socialLinks: data.socialLinks?.filter((link) => link.platform && link.url) ?? []
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
      setServerError(error instanceof Error ? error.message : "No se pudo guardar el contenido.");
    }
  };

  const handleDelete = async () => {
    if (!initialContent) {
      return;
    }
    setIsDeleting(true);
    setServerError(null);
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
      setServerError(error instanceof Error ? error.message : "No se pudo eliminar la sección.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
              placeholder="home-hero"
              disabled={!isNew}
              {...register("slug")}
            />
            {errors.slug ? <p className="text-sm text-danger">{errors.slug.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title ? <p className="text-sm text-danger">{errors.title.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input id="subtitle" {...register("subtitle")} />
            {errors.subtitle ? <p className="text-sm text-danger">{errors.subtitle.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="imageUrl">Imagen destacada (URL)</Label>
            <Input id="imageUrl" {...register("imageUrl")} />
            {errors.imageUrl ? <p className="text-sm text-danger">{errors.imageUrl.message}</p> : null}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">Descripción</Label>
          <Textarea id="body" rows={6} {...register("body")} />
          {errors.body ? <p className="text-sm text-danger">{errors.body.message}</p> : null}
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Redes sociales</h3>
          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 items-start gap-3 rounded-lg border border-white/10 p-3 md:grid-cols-7"
              >
                <div className="flex flex-col gap-2 md:col-span-3">
                  <Label htmlFor={`platform-${index}`} className="text-xs uppercase tracking-wide text-foreground/60">
                    Plataforma
                  </Label>
                  <Input
                    id={`platform-${index}`}
                    placeholder="Instagram"
                    {...register(`socialLinks.${index}.platform` as const)}
                  />
                  {errors.socialLinks?.[index]?.platform ? (
                    <p className="text-sm text-danger">{errors.socialLinks[index]?.platform?.message}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 md:col-span-3">
                  <Label htmlFor={`url-${index}`} className="text-xs uppercase tracking-wide text-foreground/60">
                    URL
                  </Label>
                  <Input
                    id={`url-${index}`}
                    placeholder="https://instagram.com/elarca"
                    {...register(`socialLinks.${index}.url` as const)}
                  />
                  {errors.socialLinks?.[index]?.url ? (
                    <p className="text-sm text-danger">{errors.socialLinks[index]?.url?.message}</p>
                  ) : null}
                </div>
                <div className="flex justify-end md:col-span-1 md:pt-6">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-danger/40 text-danger transition hover:bg-danger/10"
                    onClick={() => remove(index)}
                    aria-label="Eliminar"
                  >
                    <FaTrashCan className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-fit gap-2" type="button" onClick={() => append({...EMPTY_LINK})}>
              <FaPlus className="h-4 w-4" />
              Agregar red social
            </Button>
          </div>
        </div>
        {serverError ? (
          <div className="flex items-start gap-3 rounded-lg border border-danger/60 bg-danger/10 p-4 text-sm text-danger-foreground">
            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-danger-foreground">
              !
            </span>
            <span>{serverError}</span>
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

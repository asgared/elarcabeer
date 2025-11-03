"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {ContentPost} from "@prisma/client";

import {blogPostSchema} from "@/lib/validations/blog";
import type {BlogPostSchema} from "@/lib/validations/blog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";

const formatDateForInput = (date: Date | string): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    return "";
  }
};

function normalizeInitialState(initialPost: ContentPost | null): BlogPostSchema {
  if (!initialPost) {
    return {
      slug: "",
      title: "",
      excerpt: "",
      body: "",
      tags: "",
      category: "",
      published: formatDateForInput(new Date())
    };
  }

  return {
    slug: initialPost.slug,
    title: initialPost.title,
    excerpt: initialPost.excerpt,
    body: initialPost.body,
    tags: initialPost.tags ?? "",
    category: initialPost.category ?? "",
    published: formatDateForInput(initialPost.published)
  };
}

type AdminBlogFormProps = {
  initialPost: ContentPost | null;
};

export function AdminBlogForm({initialPost}: AdminBlogFormProps) {
  const router = useRouter();
  const toast = useToast();
  const initialState = useMemo(() => normalizeInitialState(initialPost), [initialPost]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isNew = !initialPost;

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting}
  } = useForm<BlogPostSchema>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: initialState
  });

  useEffect(() => {
    reset(initialState);
  }, [initialState, reset]);

  const onSubmit = async (data: BlogPostSchema) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        published: new Date(data.published)
      };

      const endpoint = isNew ? "/api/admin/blog" : `/api/admin/blog/${initialPost?.slug}`;
      const method = isNew ? "POST" : "PUT";
      const response = await fetch(endpoint, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw new Error(responseData.error ?? "No se pudo guardar el post.");
      }
      toast({title: "Post guardado", status: "success"});
      router.replace("/dashboard/blog");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No se pudo guardar el post.");
      toast({
        title: "Error al guardar",
        description: "La API aún no está implementada (Tarea 2.4).",
        status: "error"
      });
    }
  };

  const handleDelete = async () => {
    if (!initialPost) {
      return;
    }
    setIsDeleting(true);
    toast({
      title: "Funcionalidad no implementada",
      description: "La API de borrado aún no existe.",
      status: "error"
    });
    setIsDeleting(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl rounded-xl border border-white/10 bg-background/80 p-8 shadow-soft"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">{isNew ? "Crear Post" : `Editar ${initialPost?.title}`}</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="mi-nuevo-post"
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
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="excerpt">Extracto (Excerpt)</Label>
          <Textarea id="excerpt" rows={3} {...register("excerpt")} />
          {errors.excerpt ? <p className="text-sm text-danger">{errors.excerpt.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">Cuerpo del Post (Markdown/Body)</Label>
          <Textarea id="body" rows={10} {...register("body")} />
          {errors.body ? <p className="text-sm text-danger">{errors.body.message}</p> : null}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Input id="category" placeholder="Cervezas" {...register("category")} />
            {errors.category ? <p className="text-sm text-danger">{errors.category.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tags (separados por coma)</Label>
            <Input id="tags" placeholder="artesanal, ipa" {...register("tags")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="published">Fecha de Publicación</Label>
            <Input id="published" type="date" {...register("published")} />
            {errors.published ? <p className="text-sm text-danger">{errors.published.message}</p> : null}
          </div>
        </div>
        {serverError ? (
          <div className="rounded-lg border border-danger/60 bg-danger/10 p-4 text-sm text-danger-foreground">
            {serverError}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 md:flex-row">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
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
              {isDeleting ? "Eliminando..." : "Eliminar post"}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

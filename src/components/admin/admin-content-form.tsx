"use client";

import {useMemo, useState} from "react";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
  Textarea,
  useToast
} from "@chakra-ui/react";
import {useRouter} from "next/navigation";
import {FaPlus, FaTrashCan} from "react-icons/fa6";

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
      router.replace("/admin/content");
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
      router.replace("/admin/content");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo eliminar la sección.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} maxW="4xl" bg="background.800" borderRadius="xl" borderWidth="1px" p={8}>
      <Stack spacing={6}>
        <Heading size="lg">{isNew ? "Crear sección" : `Editar ${initialContent?.title}`}</Heading>
        <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
          <FormControl isRequired>
            <FormLabel>Slug</FormLabel>
            <Input
              value={form.slug}
              onChange={(event) => handleFieldChange("slug", event.target.value)}
              placeholder="home-hero"
              disabled={!isNew}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Título</FormLabel>
            <Input value={form.title} onChange={(event) => handleFieldChange("title", event.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Subtítulo</FormLabel>
            <Input value={form.subtitle} onChange={(event) => handleFieldChange("subtitle", event.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Imagen destacada (URL)</FormLabel>
            <Input value={form.imageUrl} onChange={(event) => handleFieldChange("imageUrl", event.target.value)} />
          </FormControl>
        </SimpleGrid>
        <FormControl>
          <FormLabel>Descripción</FormLabel>
          <Textarea
            value={form.body}
            onChange={(event) => handleFieldChange("body", event.target.value)}
            rows={6}
          />
        </FormControl>

        <Stack spacing={4}>
          <Heading size="md">Redes sociales</Heading>
          <Stack spacing={3}>
            {form.socialLinks.map((link, index) => (
              <SimpleGrid key={`link-${index}`} columns={{base: 1, md: 7}} spacing={3} alignItems="center">
                <FormControl gridColumn={{base: "1 / -1", md: "span 3"}}>
                  <FormLabel fontSize="sm">Plataforma</FormLabel>
                  <Input
                    value={link.platform}
                    onChange={(event) => handleLinkChange(index, "platform", event.target.value)}
                    placeholder="Instagram"
                  />
                </FormControl>
                <FormControl gridColumn={{base: "1 / -1", md: "span 3"}}>
                  <FormLabel fontSize="sm">URL</FormLabel>
                  <Input
                    value={link.url}
                    onChange={(event) => handleLinkChange(index, "url", event.target.value)}
                    placeholder="https://instagram.com/elarca"
                  />
                </FormControl>
                <IconButton
                  aria-label="Eliminar"
                  icon={<FaTrashCan />}
                  onClick={() => handleRemoveLink(index)}
                  variant="ghost"
                  colorScheme="red"
                />
              </SimpleGrid>
            ))}
            <Button leftIcon={<FaPlus />} variant="outline" onClick={handleAddLink} alignSelf="flex-start">
              Agregar red social
            </Button>
          </Stack>
        </Stack>

        {error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Stack direction={{base: "column", md: "row"}} spacing={4}>
          <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
            Guardar cambios
          </Button>
          {!isNew ? (
            <Button variant="outline" colorScheme="red" onClick={handleDelete} isLoading={isDeleting}>
              Eliminar sección
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}

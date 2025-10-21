import type {Prisma} from "@prisma/client";

import {prisma} from "@/lib/prisma";
import type {CmsContent, SocialLink} from "@/types/cms";

const databaseUrl = process.env.DATABASE_URL;
let hasLoggedDatabaseWarning = false;

function isDatabaseConfigured() {
  if (databaseUrl) {
    return true;
  }

  if (!hasLoggedDatabaseWarning) {
    console.warn("[cms] DATABASE_URL no está configurado. Se omite la carga de contenido.");
    hasLoggedDatabaseWarning = true;
  }

  return false;
}

function normalizeSocialLinks(value: Prisma.JsonValue | null): SocialLink[] | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value as SocialLink[];
  }

  return null;
}

function serializeCmsContent(entry: Awaited<ReturnType<typeof prisma.cmsContent.findUnique>>): CmsContent | null {
  if (!entry) {
    return null;
  }

  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    subtitle: entry.subtitle,
    body: entry.body,
    imageUrl: entry.imageUrl,
    socialLinks: normalizeSocialLinks(entry.socialLinks),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

export async function getCmsContent(slug: string): Promise<CmsContent | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const entry = await prisma.cmsContent.findUnique({where: {slug}});

    return serializeCmsContent(entry);
  } catch (error) {
    console.error("[cms] Error al obtener el contenido", slug, error);
    return null;
  }
}

export async function getAllCmsContent(): Promise<CmsContent[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    const entries = await prisma.cmsContent.findMany({orderBy: {updatedAt: "desc"}});

    return entries.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      subtitle: entry.subtitle,
      body: entry.body,
      imageUrl: entry.imageUrl,
      socialLinks: normalizeSocialLinks(entry.socialLinks),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error("[cms] Error al listar el contenido", error);
    return [];
  }
}

import type {Prisma} from "@prisma/client";

import {prisma} from "@/lib/prisma";
import type {CmsContent, SocialLink} from "@/types/cms";

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
  const entry = await prisma.cmsContent.findUnique({where: {slug}});

  return serializeCmsContent(entry);
}

export async function getAllCmsContent(): Promise<CmsContent[]> {
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
}

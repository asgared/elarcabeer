export type SocialLink = {
  platform: string;
  url: string;
};

export type CmsContent = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  socialLinks?: SocialLink[] | null;
  createdAt: string;
  updatedAt: string;
};

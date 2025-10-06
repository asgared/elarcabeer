export type Variant = {
  id: string;
  name: string;
  abv: number;
  ibu: number;
  packSize: number;
  price: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  style: string;
  description: string;
  tastingNotes: string[];
  pairings: string[];
  ingredients: string[];
  rating: number;
  limitedEdition?: boolean;
  heroImage: string;
  imageUrl?: string;
  gallery: string[];
  variants: Variant[];
};

export type Bundle = {
  id: string;
  slug: string;
  name: string;
  description: string;
  products: Array<{productId: string; quantity: number}>;
  price: number;
  savingsPercentage: number;
  image: string;
};

export type Store = {
  id: string;
  slug: string;
  name: string;
  address: string;
  coordinates: [number, number];
  petFriendly: boolean;
  kitchen: boolean;
  events: boolean;
  hours: string;
  menuUrl?: string;
  upcomingEvents: string[];
};

export type ContentPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  publishedAt: string;
  heroImage: string;
  category: "article" | "recipe" | "news" | "school";
};

export type LoyaltyTier = "Sailor" | "Navigator" | "Captain";

export type LoyaltyProgress = {
  tier: LoyaltyTier;
  points: number;
  nextTierPoints: number;
};

export type GiftCard = {
  id: string;
  amount: number;
  description: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  cadence: "monthly" | "quarterly";
  perks: string[];
};

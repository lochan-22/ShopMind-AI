export type ProductBadgeType =
  | "sale"
  | "new"
  | "bestseller"
  | "limited"
  | "out-of-stock";

export type ProductImageAspect = "square" | "portrait" | "landscape";

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  rating: number;
  reviewCount: number;
  imageColor?: string;
  imageLabel?: string;
  badge?: ProductBadgeType;
  badgeLabel?: string;
  inStock?: boolean;
}

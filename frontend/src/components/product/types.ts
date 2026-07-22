export type ProductBadgeType =
  | "sale"
  | "new"
  | "bestseller"
  | "limited"
  | "out-of-stock";

export type ProductImageAspect = "square" | "portrait" | "landscape";

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  review_count: number;
  description: string;
  stock: boolean;
  image: string;
}

export type ProductBadgeType =
  | "sale"
  | "new"
  | "bestseller"
  | "limited"
  | "out-of-stock";

export type ProductImageAspect = "square" | "portrait" | "landscape";

export type { Product } from "@/services/productService";

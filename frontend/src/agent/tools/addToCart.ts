import type { Product } from "../../services/productService";
import type { ToolHandler } from "../types/tool";

const isProduct = (value: unknown): value is Product => {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<Product>;
  return typeof product.id === "number" && typeof product.name === "string" && typeof product.price === "number";
};

export const createAddToCartTool = (addProductToCart: (product: Product) => void): ToolHandler => (args) => {
  const product = args.product;
  if (!isProduct(product)) {
    throw new Error("Missing required product argument");
  }
  addProductToCart(product);
  return { productId: product.id };
};

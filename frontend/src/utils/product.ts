import { getProductComparisonId, type Product } from "../services/productService";

/** Stable identity for a product across search, cart and compare state. */
export const productKey = (product: Pick<Product, "product_id" | "id" | "name">): string =>
  getProductComparisonId(product) || product.name;

/** Route to the ShopMind details page for a live or catalog product. */
export const productPath = (product: Pick<Product, "product_id" | "id" | "shopmind_url">): string => {
  if (product.product_id) return `/products/external/${encodeURIComponent(product.product_id)}`;
  if (product.shopmind_url?.startsWith("/")) return product.shopmind_url;
  return `/products/${encodeURIComponent(String(product.id))}`;
};

/** Only live products (with a provider id) can be compared by the backend. */
export const isComparable = (product: Pick<Product, "product_id">): boolean =>
  Boolean(product.product_id && String(product.product_id).trim());

export const isInStock = (product: Pick<Product, "stock">): boolean | null => {
  if (typeof product.stock === "boolean") return product.stock;
  if (typeof product.stock === "string") {
    const status = product.stock.toLowerCase().replace(/\s+/g, "_");
    if (["in_stock", "available", "instock"].includes(status)) return true;
    if (["out_of_stock", "unavailable", "sold_out", "outofstock"].includes(status)) return false;
  }
  return null;
};

/** The retailer to show for a product: primary retailer, else the first named offer. */
export const productRetailer = (product: Product): string | null =>
  product.retailer || product.offers?.find((offer) => offer.source_name)?.source_name || null;

/** Lowest-priced offer that has a working link, falling back to the primary link. */
export const bestOfferUrl = (product: Product): string | null => {
  const withLinks = (product.offers ?? [])
    .filter((offer) => offer.product_url?.trim() && offer.price != null)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  return withLinks[0]?.product_url?.trim() || product.product_url?.trim() || null;
};

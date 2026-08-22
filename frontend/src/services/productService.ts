import api from "./api";

const inFlightProductSearches = new Map<string, Promise<Product[]>>();
const inFlightExternalProducts = new Map<string, Promise<Product>>();

export interface ProductOffer {
  price: number | null;
  currency: string | null;
  stock_status: string | null;
  source_name: string | null;
  product_url: string | null;
  is_best_price: boolean;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  review_count: number;
  description: string;
  stock: boolean | null;
  image: string | null;
  product_id?: string;
  retailer?: string | null;
  product_url?: string | null;
  offers?: ProductOffer[];
}

export interface ComparisonOffer {
  retailer: string | null;
  price: number | null;
  currency: string | null;
  availability: boolean | null;
  product_url: string | null;
  is_best_price: boolean;
}

export interface ComparisonProduct {
  product_id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image: string | null;
  current_price: number | null;
  best_price: number | null;
  rating: number | null;
  review_count: number | null;
  availability: boolean | null;
  offer_count: number;
  best_retailer: string | null;
  product_url: string | null;
  offers: ComparisonOffer[];
  specifications: Record<string, string>;
}

export interface ComparisonInsight {
  label: string;
  winner_product_id: string | null;
  message: string;
}

export interface ProductComparison {
  product_a: ComparisonProduct;
  product_b: ComparisonProduct;
  price_difference: number | null;
  insights: ComparisonInsight[];
  recommendation: string;
  shopmind_pick_product_id: string | null;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products");
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const existingRequest = inFlightProductSearches.get(normalizedQuery);
  if (existingRequest) return existingRequest;

  const request = api.get<Product[]>("/products/search", {
    params: { q: normalizedQuery },
  }).then((response) => response.data);
  inFlightProductSearches.set(normalizedQuery, request);

  try {
    return await request;
  } finally {
    inFlightProductSearches.delete(normalizedQuery);
  }
};

export const getExternalProduct = async (
  productId: string,
): Promise<Product> => {
  const existingRequest = inFlightExternalProducts.get(productId);
  if (existingRequest) return existingRequest;

  const request = api.get<Product>(
    `/products/external/${encodeURIComponent(productId)}`,
  ).then((response) => response.data);
  inFlightExternalProducts.set(productId, request);

  try {
    return await request;
  } finally {
    inFlightExternalProducts.delete(productId);
  }
};

export const compareProducts = async (
  productA: string,
  productB: string,
): Promise<ProductComparison> => {
  const response = await api.get<ProductComparison>("/products/compare", {
    params: { product_a: productA, product_b: productB },
  });
  return response.data;
};

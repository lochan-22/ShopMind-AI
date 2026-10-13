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

export const getProductComparisonId = (product: { product_id?: string; id?: number | string }): string => {
  if (product.product_id && String(product.product_id).trim()) {
    return String(product.product_id).trim();
  }
  if (product.id != null) {
    return String(product.id);
  }
  return "";
};

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
  shopmind_url?: string;
  retailer?: string | null;
  product_url?: string | null;
  offers?: ProductOffer[];
  recommendation_badge?: string;
  why_recommended?: string;
  limitation?: string;
  verified_specs?: Record<string, string>;
  score?: number;
  score_breakdown?: Record<string, number>;
}

export interface AIAnalysis {
  direct_answer?: string;
  summary: string;
  key_criteria: string[];
  trade_offs?: string;
  final_recommendation?: string;
  budget_verdict: string;
  top_pick_reason: string;
  limitations?: string;
  missing_information?: string | null;
  analysis_source?: "openrouter" | "deterministic_fallback";
  model?: string | null;
}

export interface ExtractedIntent {
  intent: string;
  category: string | null;
  brand: string | null;
  budget: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  currency?: string | null;
  use_case?: string | null;
  features: string[];
  required_features?: string[];
  preferred_features?: string[];
  excluded_features?: string[];
  preferred_brands?: string[];
  ranking_priorities?: string[];
  explicit_priorities?: string[];
  unrequested_features?: string[];
  missing_information?: string | null;
  search_queries?: string[];
}

export interface ShoppingDecision {
  query: string;
  intent: ExtractedIntent;
  search_query: string;
  ai_analysis: AIAnalysis;
  top_recommendations: Product[];
  all_products: Product[];
  total_found: number;
  qualifying_count?: number;
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

export const getShoppingDecision = async (
  query: string,
): Promise<ShoppingDecision> => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    throw new Error("Query cannot be empty.");
  }

  try {
    const response = await api.get<ShoppingDecision>("/products/decision", {
      params: { q: normalizedQuery },
    });
    return response.data;
  } catch (err) {
    // Graceful fallback: if decision endpoint has a network/server issue, fall back to searchProducts
    const products = await searchProducts(normalizedQuery);
    return {
      query: normalizedQuery,
      intent: {
        intent: "search",
        category: null,
        brand: null,
        budget: null,
        features: [],
      },
      search_query: normalizedQuery,
      ai_analysis: {
        summary: `Showing live shopping results for "${normalizedQuery}".`,
        key_criteria: [
          "Verified seller offers and live Google Shopping availability",
          "Competitive pricing across multiple retail stores",
          "Real customer review scores and rating distributions",
        ],
        budget_verdict: "Live pricing from Google Shopping.",
        top_pick_reason: products[0]?.name
          ? `"${products[0].name}" is the top match from live results.`
          : "",
      },
      top_recommendations: products.slice(0, 5),
      all_products: products,
      total_found: products.length,
    };
  }
};


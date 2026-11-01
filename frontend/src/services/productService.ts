import { isAxiosError } from "axios";
import api from "./api";

const inFlightProductSearches = new Map<string, Promise<Product[]>>();
const inFlightExternalProducts = new Map<string, Promise<Product>>();
const inFlightDecisions = new Map<string, Promise<ShoppingDecision>>();

export interface ProductOffer {
  price: number | null;
  currency: string | null;
  stock_status: string | null;
  source_name: string | null;
  product_url: string | null;
  is_best_price: boolean;
  condition?: string | null;
  merchant_normalized?: string | null;
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

/**
 * Product shape shared by the search, decision, details and agent endpoints.
 * Live (SerpApi) products carry a string `product_id`; catalog products use a
 * numeric `id`. Every factual field may be missing from a live listing.
 */
export interface Product {
  id: number | string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  /** Boolean on search/details responses; the agent stream sends the raw status string. */
  stock: boolean | string | null;
  image: string | null;
  currency?: string | null;
  condition?: string | null;
  model?: string | null;
  model_number?: string | null;
  specifications?: Record<string, string> | null;
  product_id?: string;
  shopmind_url?: string;
  retailer?: string | null;
  product_url?: string | null;
  offers?: ProductOffer[];
  recommendation_badge?: string;
  why_recommended?: string;
  limitation?: string;
  verified_specs?: Record<string, string | number | boolean | null>;
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
  /**
   * "openrouter": model-written analysis. "deterministic_fallback": the
   * backend's rule-based market evaluation. "search_only": the decision
   * endpoint failed and the client fell back to unranked live listings.
   */
  analysis_source?: "openrouter" | "deterministic_fallback" | "search_only";
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
  diagnostics?: {
    total_retrieved: number;
    qualifying_count: number;
    disqualified_count: number;
  };
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

  // Share one live request between concurrent callers (e.g. StrictMode remounts).
  const existingRequest = inFlightDecisions.get(normalizedQuery);
  if (existingRequest) return existingRequest;
  const request = fetchShoppingDecision(normalizedQuery);
  inFlightDecisions.set(normalizedQuery, request);
  try {
    return await request;
  } finally {
    inFlightDecisions.delete(normalizedQuery);
  }
};

const fetchShoppingDecision = async (
  normalizedQuery: string,
): Promise<ShoppingDecision> => {
  try {
    const response = await api.get<ShoppingDecision>("/products/decision", {
      params: { q: normalizedQuery },
    });
    return response.data;
  } catch (error) {
    // Invalid requests and an unavailable search provider would fail the plain
    // search too, so surface those errors directly.
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 400 || status === 503) throw error;

    // The decision engine failed but live search may still work. Return the
    // unranked listings and say so plainly; never fabricate analysis.
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
        summary: "",
        key_criteria: [],
        budget_verdict: "",
        top_pick_reason: "",
        analysis_source: "search_only",
      },
      top_recommendations: [],
      all_products: products,
      total_found: products.length,
    };
  }
};


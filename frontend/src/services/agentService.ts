import api from "./api";
import type { Product } from "./productService";

export interface ChatResponse {
  reply: string;
}

export interface SearchResponse {
  query: string;
  parsed: {
    intent: string;
    brand: string | null;
    category: string | null;
    budget: number | null;
  };
  matching_products: Product[];
  recommended_product: Product | null;
  confidence_score: number;
  reasoning: string;
  error?: string;
}

export interface RecommendResponse {
  recommended_product: Product | null;
  reason: string;
}

export const chat = async (message: string): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>("/agent/chat", { message });
  return response.data;
};

export const search = async (query: string): Promise<SearchResponse> => {
  const response = await api.post<SearchResponse>("/agent/search", { query });
  return response.data;
};

export const recommend = async (): Promise<RecommendResponse> => {
  const response = await api.post<RecommendResponse>("/agent/recommend");
  return response.data;
};

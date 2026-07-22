import api from "./api";

export interface ChatResponse {
  reply: string;
}

export interface RecommendedProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
}

export interface SearchResponse {
  intent: string;
  brand: string | null;
  category: string | null;
  budget: number | null;
  products_found: number;
  recommended_product: RecommendedProduct;
}

export interface RecommendResponse {
  top_product: RecommendedProduct;
  confidence: number;
  reason: string;
  score: number;
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
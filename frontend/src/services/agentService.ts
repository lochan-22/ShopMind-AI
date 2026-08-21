import api from "./api";
import type { Product } from "./productService";

export interface ChatResponse {
  reply: string;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export type StreamEvent =
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export const streamChat = async (
  message: string,
  history: ChatHistoryMessage[],
  onEvent: (event: StreamEvent) => void,
): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/agent/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    let message = "I couldn't connect to the AI assistant. Please try again.";
    try {
      const error = await response.json() as { detail?: string };
      message = error.detail ?? message;
    } catch {
      // Use the friendly fallback when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (!response.body) throw new Error("The AI assistant did not return a response stream.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const consumeEvent = (block: string) => {
    const eventType = block.match(/^event: (.+)$/m)?.[1];
    const data = block.match(/^data: (.+)$/m)?.[1] ?? "{}";
    if (!eventType) return;

    try {
      const payload = JSON.parse(data) as { content?: string; message?: string };
      if (eventType === "token" && payload.content) onEvent({ type: "token", content: payload.content });
      if (eventType === "done") onEvent({ type: "done" });
      if (eventType === "error") onEvent({ type: "error", message: payload.message ?? "The AI assistant could not respond." });
    } catch {
      onEvent({ type: "error", message: "The AI assistant returned an invalid response." });
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      consumeEvent(buffer.slice(0, separatorIndex));
      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf("\n\n");
    }

    if (done) break;
  }
};

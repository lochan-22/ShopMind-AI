import api, { getApiBaseUrl } from "./api";
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
  | { type: "products"; products: Product[] }
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

const STREAM_TIMEOUT_MS = 120_000;
const UNREACHABLE_MESSAGE =
  "I couldn't reach the ShopMind service. If it has been idle it can take up to a minute to wake up — please try again.";

const postStream = (baseUrl: string, body: string, signal: AbortSignal) =>
  fetch(`${baseUrl}/agent/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body,
    signal,
  });

const readErrorDetail = async (response: Response): Promise<string> => {
  const fallback =
    response.status >= 500
      ? "The ShopMind service hit a problem answering that. Please try again shortly."
      : "I couldn't send that message. Please try again.";
  try {
    const error = (await response.json()) as { detail?: unknown };
    // FastAPI validation errors arrive as a list of objects rather than a string.
    return typeof error.detail === "string" ? error.detail : fallback;
  } catch {
    return fallback;
  }
};

export const streamChat = async (
  message: string,
  history: ChatHistoryMessage[],
  onEvent: (event: StreamEvent) => void,
): Promise<void> => {
  const body = JSON.stringify({ message, history });
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const currentBaseUrl = getApiBaseUrl();
    let response: Response;
    try {
      response = await postStream(currentBaseUrl, body, controller.signal);
    } catch (err) {
      // In development only, try the other local backend port (8000 <-> 8001).
      if (controller.signal.aborted || import.meta.env.PROD || !/:800[01]\b/.test(currentBaseUrl)) throw err;
      const altBaseUrl = currentBaseUrl.includes(":8001") ? currentBaseUrl.replace(":8001", ":8000") : currentBaseUrl.replace(":8000", ":8001");
      response = await postStream(altBaseUrl, body, controller.signal);
    }

    if (!response.ok) throw new Error(await readErrorDetail(response));
    if (!response.body) throw new Error("The AI assistant did not return a response stream.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const consumeEvent = (block: string) => {
      const eventType = block.match(/^event: (.+)$/m)?.[1]?.trim();
      const data = block.match(/^data: (.+)$/m)?.[1] ?? "{}";
      if (!eventType) return;

      try {
        const payload = JSON.parse(data) as { content?: string; message?: string; products?: Product[] };
        if (eventType === "token" && payload.content) onEvent({ type: "token", content: payload.content });
        if (eventType === "products" && Array.isArray(payload.products)) onEvent({ type: "products", products: payload.products });
        if (eventType === "done") onEvent({ type: "done" });
        if (eventType === "error") onEvent({ type: "error", message: payload.message ?? "The AI assistant could not respond." });
      } catch {
        onEvent({ type: "error", message: "The AI assistant returned an invalid response." });
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      // Normalise CRLF so proxies that rewrite line endings don't break event framing.
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n");

      let separatorIndex = buffer.indexOf("\n\n");
      while (separatorIndex !== -1) {
        consumeEvent(buffer.slice(0, separatorIndex));
        buffer = buffer.slice(separatorIndex + 2);
        separatorIndex = buffer.indexOf("\n\n");
      }

      if (done) {
        if (buffer.trim()) consumeEvent(buffer);
        break;
      }
    }
  } catch (err) {
    if (controller.signal.aborted) throw new Error("The answer took too long to arrive. Please try again.");
    // fetch() and stream reads reject with a TypeError on network failures
    // ("Failed to fetch", "Load failed", "NetworkError…") across browsers.
    if (err instanceof TypeError) throw new Error(UNREACHABLE_MESSAGE);
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
};

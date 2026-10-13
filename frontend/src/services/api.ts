import axios, { type AxiosRequestConfig } from "axios";

const isProduction = import.meta.env.PROD;
const rawEnvBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// Production default backend on Render
const DEFAULT_PRODUCTION_BACKEND = "https://shopmind-ai-backend-1mlr.onrender.com/api";

function normalizeBaseUrl(url?: string): string {
  if (!url) return "";
  let clean = url.trim().replace(/\/+$/, "");
  if (!clean.endsWith("/api")) {
    clean = `${clean}/api`;
  }
  return clean;
}

const configuredBaseUrl = normalizeBaseUrl(rawEnvBaseUrl);

// Available backend base URLs in order of priority:
// 1. Explicit normalized VITE_API_BASE_URL if provided
// 2. In production: DEFAULT_PRODUCTION_BACKEND, followed by relative "/api"
// 3. In development: active local backend dev ports (8001, 8000), followed by "/api"
const CANDIDATE_BASE_URLS: string[] = (
  configuredBaseUrl
    ? [configuredBaseUrl, "/api"]
    : isProduction
      ? [DEFAULT_PRODUCTION_BACKEND, "/api"]
      : ["http://127.0.0.1:8001/api", "http://127.0.0.1:8000/api", "/api"]
).filter(Boolean);

const candidateUrls: string[] = Array.from(new Set(CANDIDATE_BASE_URLS));

let activeBaseUrl = candidateUrls[0] || (isProduction ? DEFAULT_PRODUCTION_BACKEND : "http://127.0.0.1:8001/api");

const api = axios.create({
  baseURL: activeBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000, // 45 seconds to accommodate live SerpApi retrieval and multi-step reasoning
});

export const getApiBaseUrl = (): string => activeBaseUrl;

// Failover interceptor: In development or multi-candidate configs, retry on alternate candidate
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError =
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch"));

    const config = error.config as
      | (AxiosRequestConfig & { _retryCandidateIndex?: number })
      | undefined;

    if (isNetworkError && config && candidateUrls.length > 1) {
      const nextIndex =
        (config._retryCandidateIndex ?? candidateUrls.indexOf(activeBaseUrl)) + 1;
      if (nextIndex < candidateUrls.length) {
        const nextUrl = candidateUrls[nextIndex];
        activeBaseUrl = nextUrl;
        api.defaults.baseURL = nextUrl;
        config.baseURL = nextUrl;
        config._retryCandidateIndex = nextIndex;
        return api(config);
      }
    }
    return Promise.reject(error);
  },
);

export default api;

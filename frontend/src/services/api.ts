import axios, { type AxiosRequestConfig } from "axios";

// Available backend base URLs in order of priority:
// 1. Explicit environment variable if provided
// 2. Port 8001 (active backend port)
// 3. Port 8000 (standard alternative)
// 4. Relative /api for Vite dev proxy or production reverse proxy
const CANDIDATE_BASE_URLS: string[] = [
  import.meta.env.VITE_API_BASE_URL,
  "http://127.0.0.1:8001/api",
  "http://127.0.0.1:8000/api",
  "/api",
].filter(Boolean) as string[];

const candidateUrls: string[] = Array.from(new Set(CANDIDATE_BASE_URLS));

let activeBaseUrl = candidateUrls[0] || "http://127.0.0.1:8001/api";

const api = axios.create({
  baseURL: activeBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

export const getApiBaseUrl = (): string => activeBaseUrl;

// Failover interceptor: If a connection error occurs on the active port (e.g. ECONNREFUSED),
// automatically retry the request on the alternative candidate port and remember the working one.
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

    if (isNetworkError && config) {
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

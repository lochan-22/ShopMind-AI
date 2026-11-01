import { isAxiosError } from "axios";

/**
 * Turn an API failure into a message a shopper can act on. Backend `detail`
 * strings are already written for end users, so prefer them.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "The request took too long. Live retrieval can be slow — please try again."
        : "We couldn't reach the ShopMind service. Check your connection and try again.";
    }
  }
  return fallback;
};

export const getErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

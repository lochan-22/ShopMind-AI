const formatters = new Map<string, Intl.NumberFormat>();

const currencyFormatter = (currency: string): Intl.NumberFormat => {
  let formatter = formatters.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      });
    } catch {
      formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      });
    }
    formatters.set(currency, formatter);
  }
  return formatter;
};

/** Format a listing price. Returns null when the listing has no usable price. */
export const formatPrice = (
  value: number | null | undefined,
  currency?: string | null,
): string | null => {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  return currencyFormatter((currency || "INR").toUpperCase()).format(value);
};

/** Parse a numeric price from a number or a price string such as "₹1,499". */
export const parsePrice = (value: number | string | null | undefined): number | null => {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  const match = String(value).match(/[\d,]+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = parseFloat(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

export const formatCount = (value: number | null | undefined): string | null =>
  value == null || !Number.isFinite(value) ? null : compact.format(value);

/** Turn a snake_case spec key into a readable label ("refresh_rate" → "Refresh rate"). */
export const humanizeKey = (key: string): string => {
  const special: Record<string, string> = {
    anc: "ANC",
    gpu: "GPU",
    vram: "VRAM",
    ram: "RAM",
    dpi: "DPI",
  };
  if (special[key.toLowerCase()]) return special[key.toLowerCase()];
  const words = key.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const formatSpecValue = (value: string | number | boolean | null | undefined): string | null => {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

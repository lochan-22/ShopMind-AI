import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

export interface ProductSearchFormProps {
  /** The intentionally displayed query, such as the current search route query. */
  initialQuery?: string;
  /** Receives a trimmed, non-empty query when the form is submitted. */
  onSearch: (query: string) => void;
}

/** Reusable product-search input that delegates result loading to its page. */
export const ProductSearchForm: React.FC<ProductSearchFormProps> = ({
  initialQuery = "",
  onSearch,
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    onSearch(trimmedQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#A89F95" }} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for products..."
          autoComplete="off"
          enterKeyHint="search"
          className="w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-[#A89F95]"
          style={{
            borderColor: "#E8E2D9",
            color: "#0D0B1E",
            boxShadow: "inset 0 1px 2px rgba(13, 11, 30, 0.03)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#7C3AED";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E8E2D9";
            e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(13, 11, 30, 0.03)";
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
          boxShadow: "0 3px 10px rgba(124, 58, 237, 0.30)",
        }}
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  );
};

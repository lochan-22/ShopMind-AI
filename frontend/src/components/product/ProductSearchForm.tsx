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
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for products..."
          autoComplete="off"
          enterKeyHint="search"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-medium text-white shadow-md shadow-indigo-300/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  );
};

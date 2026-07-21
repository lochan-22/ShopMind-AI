import { forwardRef, type HTMLAttributes } from "react";

import {
  MOCK_RESULT_COUNT,
  MOCK_SEARCH_QUERY,
  MOCK_SORT_OPTIONS,
} from "@/components/search/mock";
import type { SortOption } from "@/components/search/types";
import { cn } from "@/utils/cn";

export interface SearchResultsHeaderProps extends HTMLAttributes<HTMLDivElement> {
  query?: string;
  totalResults?: number;
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  loading?: boolean;
}

export const SearchResultsHeader = forwardRef<
  HTMLDivElement,
  SearchResultsHeaderProps
>(
  (
    {
      query = MOCK_SEARCH_QUERY,
      totalResults = MOCK_RESULT_COUNT,
      sortOptions = MOCK_SORT_OPTIONS,
      selectedSort = "relevance",
      onSortChange,
      loading = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <header
        ref={ref}
        className={cn("search-results-header", className)}
        {...props}
      >
        <div className="search-results-header-info">
          <h2 className="search-results-header-title">
            {loading ? (
              <span className="search-results-header-loading">
                Searching…
              </span>
            ) : (
              <>
                Results for{" "}
                <span className="search-results-header-query">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </h2>
          {!loading && (
            <p className="search-results-header-count" aria-live="polite">
              {totalResults.toLocaleString()}{" "}
              {totalResults === 1 ? "result" : "results"}
            </p>
          )}
        </div>

        <div className="search-results-header-sort">
          <label htmlFor="search-sort" className="search-results-header-sort-label">
            Sort by
          </label>
          <select
            id="search-sort"
            value={selectedSort}
            onChange={(event) => onSortChange?.(event.target.value)}
            disabled={loading}
            className="search-results-header-sort-select"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>
    );
  },
);

SearchResultsHeader.displayName = "SearchResultsHeader";

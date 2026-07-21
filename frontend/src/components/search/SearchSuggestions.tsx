import { forwardRef, type HTMLAttributes } from "react";

import { MOCK_SUGGESTIONS } from "@/components/search/mock";
import type { SearchSuggestion } from "@/components/search/types";
import { cn } from "@/utils/cn";

export interface SearchSuggestionsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  suggestions?: SearchSuggestion[];
  query?: string;
  visible?: boolean;
  highlightedIndex?: number;
  onSelect?: (suggestion: SearchSuggestion) => void;
  emptyMessage?: string;
}

export const SearchSuggestions = forwardRef<
  HTMLDivElement,
  SearchSuggestionsProps
>(
  (
    {
      suggestions = MOCK_SUGGESTIONS,
      query,
      visible = true,
      highlightedIndex = -1,
      onSelect,
      emptyMessage = "No suggestions found",
      className,
      ...props
    },
    ref,
  ) => {
    if (!visible) return null;

    const filtered = query
      ? suggestions.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        )
      : suggestions;

    const grouped = filtered.reduce<Record<string, SearchSuggestion[]>>(
      (acc, item) => {
        const group = item.category ?? "Suggestions";
        acc[group] = acc[group] ? [...acc[group], item] : [item];
        return acc;
      },
      {},
    );

    let globalIndex = -1;

    return (
      <div
        ref={ref}
        role="listbox"
        aria-label="Search suggestions"
        className={cn("search-suggestions", className)}
        {...props}
      >
        {filtered.length === 0 ? (
          <p className="search-suggestions-empty" role="status">
            {emptyMessage}
          </p>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="search-suggestions-group">
              <p className="search-suggestions-group-label">{group}</p>
              <ul className="search-suggestions-list">
                {items.map((item) => {
                  globalIndex += 1;
                  const isHighlighted = globalIndex === highlightedIndex;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        className={cn(
                          "search-suggestions-item",
                          isHighlighted && "search-suggestions-item-highlighted",
                        )}
                        onClick={() => onSelect?.(item)}
                      >
                        <SuggestionIcon type={item.type} />
                        <span className="search-suggestions-label">
                          {highlightMatch(item.label, query)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    );
  },
);

SearchSuggestions.displayName = "SearchSuggestions";

function highlightMatch(label: string, query?: string) {
  if (!query?.trim()) return label;

  const index = label.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return label;

  return (
    <>
      {label.slice(0, index)}
      <mark className="search-suggestions-highlight">
        {label.slice(index, index + query.length)}
      </mark>
      {label.slice(index + query.length)}
    </>
  );
}

function SuggestionIcon({ type }: { type?: SearchSuggestion["type"] }) {
  if (type === "recent") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    );
  }

  if (type === "category") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

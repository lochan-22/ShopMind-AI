import { forwardRef, type HTMLAttributes } from "react";

import { MOCK_FILTERS } from "@/components/search/mock";
import type { SearchFilter } from "@/components/search/types";
import { cn } from "@/utils/cn";

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  filters?: SearchFilter[];
  values?: Record<string, string>;
  onFilterChange?: (filterId: string, value: string) => void;
  onClearAll?: () => void;
}

export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  (
    {
      filters = MOCK_FILTERS,
      values = {},
      onFilterChange,
      onClearAll,
      className,
      ...props
    },
    ref,
  ) => {
    const activeCount = Object.values(values).filter(Boolean).length;

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Search filters"
        className={cn("filter-bar", className)}
        {...props}
      >
        {filters.map((filter) => (
          <div key={filter.id} className="filter-bar-item">
            <label htmlFor={`filter-${filter.id}`} className="filter-bar-label">
              {filter.label}
            </label>
            <select
              id={`filter-${filter.id}`}
              value={values[filter.id] ?? ""}
              onChange={(event) =>
                onFilterChange?.(filter.id, event.target.value)
              }
              className="filter-bar-select"
            >
              <option value="">All</option>
              {filter.options.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {activeCount > 0 && onClearAll && (
          <button
            type="button"
            className="filter-bar-clear"
            onClick={onClearAll}
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    );
  },
);

FilterBar.displayName = "FilterBar";

import { forwardRef, type HTMLAttributes } from "react";

import { MOCK_CATEGORIES } from "@/components/search/mock";
import type { SearchCategory } from "@/components/search/types";
import { cn } from "@/utils/cn";

export interface CategoryChipsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  categories?: SearchCategory[];
  selected?: string | string[];
  onSelect?: (categoryId: string) => void;
  multiple?: boolean;
  showCounts?: boolean;
}

export const CategoryChips = forwardRef<HTMLDivElement, CategoryChipsProps>(
  (
    {
      categories = MOCK_CATEGORIES,
      selected = "all",
      onSelect,
      multiple = false,
      showCounts = true,
      className,
      ...props
    },
    ref,
  ) => {
    const selectedSet = new Set(
      Array.isArray(selected) ? selected : [selected],
    );

    const handleSelect = (categoryId: string) => {
      onSelect?.(categoryId);
    };

    return (
      <div
        ref={ref}
        role={multiple ? "group" : "radiogroup"}
        aria-label="Categories"
        className={cn("category-chips", className)}
        {...props}
      >
        {categories.map((category) => {
          const isSelected = selectedSet.has(category.id);

          return (
            <button
              key={category.id}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={isSelected}
              className={cn(
                "category-chip",
                isSelected && "category-chip-selected",
              )}
              onClick={() => handleSelect(category.id)}
            >
              <span>{category.label}</span>
              {showCounts && category.count !== undefined && (
                <span className="category-chip-count" aria-hidden="true">
                  {category.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

CategoryChips.displayName = "CategoryChips";

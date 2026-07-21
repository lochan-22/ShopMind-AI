export interface SearchSuggestion {
  id: string;
  label: string;
  category?: string;
  type?: "recent" | "popular" | "product" | "category";
}

export interface SearchCategory {
  id: string;
  label: string;
  count?: number;
}

export interface SearchFilterOption {
  id: string;
  label: string;
  value: string;
}

export interface SearchFilter {
  id: string;
  label: string;
  options: SearchFilterOption[];
}

export interface SortOption {
  id: string;
  label: string;
  value: string;
}

export type SearchBarSize = "sm" | "md" | "lg";

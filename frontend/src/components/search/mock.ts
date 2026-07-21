import type {
  SearchCategory,
  SearchFilter,
  SearchSuggestion,
  SortOption,
} from "@/components/search/types";

export const MOCK_SEARCH_QUERY = "wireless earbuds";

export const MOCK_SUGGESTIONS: SearchSuggestion[] = [
  { id: "s1", label: "wireless earbuds", type: "recent", category: "Recent" },
  { id: "s2", label: "wireless earbuds pro", type: "popular", category: "Popular" },
  { id: "s3", label: "Wireless Earbuds Pro", type: "product", category: "Electronics" },
  { id: "s4", label: "bluetooth headphones", type: "popular", category: "Popular" },
  { id: "s5", label: "noise cancelling earbuds", type: "popular", category: "Popular" },
  { id: "s6", label: "Electronics", type: "category", category: "Categories" },
];

export const MOCK_CATEGORIES: SearchCategory[] = [
  { id: "all", label: "All", count: 1248 },
  { id: "electronics", label: "Electronics", count: 342 },
  { id: "apparel", label: "Apparel", count: 218 },
  { id: "home", label: "Home", count: 156 },
  { id: "fitness", label: "Fitness", count: 97 },
  { id: "kitchen", label: "Kitchen", count: 84 },
  { id: "accessories", label: "Accessories", count: 203 },
];

export const MOCK_FILTERS: SearchFilter[] = [
  {
    id: "price",
    label: "Price",
    options: [
      { id: "p1", label: "Under $25", value: "0-25" },
      { id: "p2", label: "$25 – $50", value: "25-50" },
      { id: "p3", label: "$50 – $100", value: "50-100" },
      { id: "p4", label: "Over $100", value: "100+" },
    ],
  },
  {
    id: "rating",
    label: "Rating",
    options: [
      { id: "r1", label: "4★ & up", value: "4" },
      { id: "r2", label: "3★ & up", value: "3" },
      { id: "r3", label: "2★ & up", value: "2" },
    ],
  },
  {
    id: "availability",
    label: "Availability",
    options: [
      { id: "a1", label: "In stock", value: "in-stock" },
      { id: "a2", label: "On sale", value: "on-sale" },
    ],
  },
];

export const MOCK_SORT_OPTIONS: SortOption[] = [
  { id: "relevance", label: "Relevance", value: "relevance" },
  { id: "price-asc", label: "Price: Low to High", value: "price-asc" },
  { id: "price-desc", label: "Price: High to Low", value: "price-desc" },
  { id: "rating", label: "Top Rated", value: "rating" },
  { id: "newest", label: "Newest", value: "newest" },
];

export const MOCK_RESULT_COUNT = 47;

export const MOCK_SEARCH_PLACEHOLDER = "Search products, categories, brands…";

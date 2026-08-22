import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { ProductCard } from "../components/product/ProductCard";
import { ProductSearchForm } from "../components/product/ProductSearchForm";
import { searchProducts, type Product } from "../services/productService";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";


const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(query));
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedSearch, setHasCompletedSearch] = useState(false);
  const [retrySequence, setRetrySequence] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        setError(null);
        setHasCompletedSearch(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await searchProducts(query);
        if (cancelled) return;
        setProducts(data);
        setHasCompletedSearch(true);
      } catch {
        if (cancelled) return;
        setError("Product search is temporarily unavailable. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    let cancelled = false;
    void fetchResults();
    return () => {
      cancelled = true;
    };
  }, [query, retrySequence]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-300/50">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Search Results
          </h1>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:p-5">
          <ProductSearchForm
            initialQuery={query}
            onSearch={(nextQuery) => navigate(`/search?q=${encodeURIComponent(nextQuery)}`)}
          />
        </div>

        {/* Loading State */}
        {loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 py-20 shadow-lg shadow-slate-200/50">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="mt-4 text-sm text-slate-500">Loading search results...</p>
          </div>
        )}

        {/* Error State */}
        {loading && products.length > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading new search results...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/60 py-8 text-center shadow-lg shadow-rose-100/50">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
            <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => setRetrySequence((current) => current + 1)}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hasCompletedSearch && products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 py-20 text-center shadow-lg shadow-slate-200/50">
            <p className="text-sm text-slate-500">No products found.</p>
          </div>
        )}

        {/* Product Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigationState={{ comparisonCandidates: products }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

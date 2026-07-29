import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { ProductCard } from "../components/product/ProductCard";
import type { Product } from "../services/productService";
import { search } from "../services/agentService";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";


const SearchResults: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeState = location.state as { query?: string; products?: Product[] } | null;
  const query = routeState?.query ?? searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(!routeState?.products);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (routeState?.products) {
      setProducts(routeState.products);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await search(query);
        setProducts(data.matching_products);
      } catch {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [query, routeState?.products]);

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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 py-20 shadow-lg shadow-slate-200/50">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="mt-4 text-sm text-slate-500">Loading search results...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/60 py-20 text-center shadow-lg shadow-rose-100/50">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
            <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 py-20 text-center shadow-lg shadow-slate-200/50">
            <p className="text-sm text-slate-500">No products found.</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

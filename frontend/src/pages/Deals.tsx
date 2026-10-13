import React, { useEffect, useState, useMemo } from "react";
import { Tag, Sparkles, AlertCircle, RefreshCw, Loader2, ArrowUpDown } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";
import { ProductCard } from "../components/product/ProductCard";
import { searchProducts, type Product } from "../services/productService";

interface DealCategory {
  id: string;
  label: string;
  emoji: string;
  query: string;
}

const DEAL_CATEGORIES: DealCategory[] = [
  { id: "all", label: "All Featured", emoji: "🔥", query: "popular electronics gadgets India" },
  { id: "smartphones", label: "Smartphones", emoji: "📱", query: "best price smartphones India" },
  { id: "laptops", label: "Laptops", emoji: "💻", query: "best laptop deals India" },
  { id: "audio", label: "Audio & Headphones", emoji: "🎧", query: "best wireless headphones India" },
  { id: "wearables", label: "Smart Watches", emoji: "⌚", query: "smartwatch deals India" },
  { id: "footwear", label: "Footwear", emoji: "👟", query: "running shoes India" },
];

type SortOption = "default" | "price-asc" | "price-desc" | "rating-desc";

const Deals: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DealCategory>(DEAL_CATEGORIES[0]);
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const fetchDealsForCategory = async (category: DealCategory, forceRefresh = false) => {
    if (!forceRefresh && productsCache[category.id] && productsCache[category.id].length > 0) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchProducts(category.query);
      setProductsCache((prev) => ({
        ...prev,
        [category.id]: data,
      }));
    } catch {
      setError("Live deals are temporarily unavailable. Please try again in a few moments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDealsForCategory(activeCategory);
  }, [activeCategory]);

  const rawProducts = productsCache[activeCategory.id] || [];

  const sortedProducts = useMemo(() => {
    const list = [...rawProducts];
    if (sortBy === "price-asc") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === "rating-desc") {
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return list;
  }, [rawProducts, sortBy]);

  return (
    <PageBackground>
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-3.5 py-1 text-xs font-bold text-[#7C3AED] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Live Market Offers · Google Shopping India</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]">
            Featured Deals & Offers
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#7A7068] max-w-2xl leading-relaxed">
            Real-time pricing and multi-seller offers retrieved across major Indian merchants. Verified listings without artificial markups or fake discount claims.
          </p>
        </div>

        {/* Category Pills & Sorting Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E2D9] pb-6">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {DEAL_CATEGORIES.map((cat) => {
              const active = cat.id === activeCategory.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (cat.id !== activeCategory.id) {
                      setActiveCategory(cat);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    active
                      ? "bg-[#7C3AED] text-white shadow-md shadow-purple-500/20 scale-[1.02]"
                      : "bg-white text-[#5A5248] border border-[#E8E2D9] hover:border-purple-200 hover:text-[#7C3AED]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="h-4 w-4 text-[#A89F95]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-[#E8E2D9] bg-white px-3 py-1.5 text-xs font-medium text-[#0D0B1E] shadow-xs outline-none transition focus:border-purple-400"
            >
              <option value="default">Default: Best Match</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E8E2D9] bg-white/80 py-24 text-center shadow-xs backdrop-blur-xs">
            <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
            <p className="mt-4 text-sm sm:text-base font-semibold text-[#0D0B1E]">
              Fetching live offers for {activeCategory.label}…
            </p>
            <p className="mt-1 text-xs text-[#7A7068]">
              Comparing real-time prices across verified sellers
            </p>
          </div>
        )}

        {/* Error State with Retry Button */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center shadow-xs">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-bold text-red-900">{error}</p>
            <p className="mt-1 text-xs text-red-700">
              The live product provider could not be reached. Click below to retry.
            </p>
            <button
              type="button"
              onClick={() => void fetchDealsForCategory(activeCategory, true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-red-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E8E2D9] bg-white p-12 text-center shadow-xs">
            <Tag className="h-8 w-8 text-[#A89F95] mb-2" />
            <p className="text-base font-bold text-[#0D0B1E]">
              No active offers found for this category.
            </p>
            <p className="mt-1 text-xs text-[#7A7068]">
              Try choosing another department or return to the main catalog.
            </p>
            <button
              type="button"
              onClick={() => void fetchDealsForCategory(activeCategory, true)}
              className="mt-5 rounded-xl border border-[#E8E2D9] bg-white px-4 py-2 text-xs font-semibold text-[#5A5248] hover:border-purple-300"
            >
              Refresh Listings
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && sortedProducts.length > 0 && (
          <div>
            <div className="mb-5 flex items-center justify-between text-xs text-[#7A7068]">
              <span>
                Showing <strong className="text-[#0D0B1E]">{sortedProducts.length}</strong> live offers in{" "}
                <strong className="text-[#7C3AED]">{activeCategory.label}</strong>
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-[#EA580C] border border-orange-200">
                Live Google Shopping India
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.product_id ?? product.id}
                  product={product}
                  navigationState={{ comparisonCandidates: sortedProducts }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </PageBackground>
  );
};

export default Deals;


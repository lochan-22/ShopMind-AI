import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import Navbar from "../components/common/Navbar";
import PageBackground from "../components/common/PageBackground";
import { ProductCard } from "../components/product/ProductCard";
import { searchProducts, type Product } from "../services/productService";
import { findMainCategory, findSubCategory } from "../data/categoryData";

/**
 * Level 3 — Category Products page.
 * Route: /categories/:mainCategory/:subCategory
 * Triggers live SerpApi search using the subcategory's searchQuery.
 */
const CategoryProducts: React.FC = () => {
  const { mainCategory = "", subCategory = "" } =
    useParams<{ mainCategory: string; subCategory: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const main = findMainCategory(mainCategory);
  const sub = findSubCategory(mainCategory, subCategory);

  useEffect(() => {
    if (!sub) {
      setLoading(false);
      setError("Subcategory not found.");
      return;
    }

    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchProducts(sub.searchQuery);
        if (cancelled) return;
        setProducts(data);
        setHasLoaded(true);
      } catch {
        if (cancelled) return;
        setError("Live product search is temporarily unavailable. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchProducts();
    return () => { cancelled = true; };
  }, [sub]);

  const mainLabel = main ? `${main.emoji} ${main.label}` : mainCategory;
  const subLabel = sub?.label ?? subCategory;

  return (
    <PageBackground>
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(`/categories/${mainCategory}`)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 hover:-translate-y-px"
          style={{
            background: "#FFFFFF",
            borderColor: "#E8E2D9",
            color: "#5A5248",
            boxShadow: "0 1px 4px rgba(13,11,30,0.06)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          {mainLabel}
        </button>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-1.5 text-xs"
          style={{ color: "#A89F95" }}
        >
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="transition-colors hover:underline"
            style={{ color: "#7C3AED" }}
          >
            Categories
          </button>
          <ChevronRight className="h-3 w-3" />
          <button
            type="button"
            onClick={() => navigate(`/categories/${mainCategory}`)}
            className="transition-colors hover:underline"
            style={{ color: "#7C3AED" }}
          >
            {mainLabel}
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold" style={{ color: "#0D0B1E" }}>{subLabel}</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: "#EDE9FE", color: "#7C3AED" }}
            >
              <Sparkles className="h-3 w-3" />
              Live Results · SerpApi
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "#0D0B1E" }}
          >
            {subLabel}
          </h1>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border py-24 text-center"
            style={{
              background: "linear-gradient(135deg, #FFFFFF, #F8F5FF)",
              borderColor: "#E8E2D9",
              boxShadow: "0 4px 24px rgba(124,58,237,0.08)",
            }}
          >
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
            >
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
            <p className="text-base font-semibold" style={{ color: "#0D0B1E" }}>
              Searching live products…
            </p>
            <p className="mt-1 text-sm" style={{ color: "#A89F95" }}>
              for <strong style={{ color: "#7C3AED" }}>{subLabel}</strong> via Google Shopping
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border py-20 text-center"
            style={{
              background: "#FFF5F5",
              borderColor: "#FECACA",
            }}
          >
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="mt-4 text-sm font-semibold" style={{ color: "#DC2626" }}>{error}</p>
            <button
              type="button"
              onClick={() => { setError(null); setLoading(true); navigate(0); }}
              className="mt-4 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && hasLoaded && products.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border py-20 text-center"
            style={{
              background: "linear-gradient(135deg, #FFFFFF, #F8F5FF)",
              borderColor: "#E8E2D9",
            }}
          >
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-base font-semibold" style={{ color: "#0D0B1E" }}>
              No live products found for <span style={{ color: "#7C3AED" }}>{subLabel}</span>
            </p>
            <p className="mt-1 text-sm" style={{ color: "#A89F95" }}>
              Try a different subcategory or use the AI assistant
            </p>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm" style={{ color: "#7A7068" }}>
                <span className="font-bold" style={{ color: "#0D0B1E" }}>{products.length}</span>{" "}
                live result{products.length !== 1 ? "s" : ""} found
              </p>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ background: "#FFF7ED", color: "#F97316" }}
              >
                Google Shopping · India
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.product_id ?? product.id}
                  product={product}
                  navigationState={{ comparisonCandidates: products }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PageBackground>
  );
};

export default CategoryProducts;


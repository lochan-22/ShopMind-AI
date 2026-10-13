import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";
import { ProductCard } from "../components/product/ProductCard";
import { ProductSearchForm } from "../components/product/ProductSearchForm";
import {
  getShoppingDecision,
  type Product,
  type ShoppingDecision,
} from "../services/productService";
import {
  getSearchEntry,
  setSearchDecision,
  updateScrollY,
  invalidateSearchDecision,
} from "../services/searchCache";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Target,
  Zap,
} from "lucide-react";

const isDuplicateSummary = (
  summary?: string | null,
  directAnswer?: string | null,
): boolean => {
  if (!summary || !directAnswer) return false;
  const sNorm = summary.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const dNorm = directAnswer.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  if (sNorm === dNorm) return true;
  if (sNorm.length > 20 && dNorm.includes(sNorm.slice(0, 30))) return true;
  if (dNorm.length > 20 && sNorm.includes(dNorm.slice(0, 30))) return true;
  const sWords = new Set(sNorm.split(/\s+/).filter((w) => w.length > 3));
  const dWords = new Set(dNorm.split(/\s+/).filter((w) => w.length > 3));
  if (sWords.size === 0 || dWords.size === 0) return false;
  let common = 0;
  for (const w of sWords) {
    if (dWords.has(w)) common++;
  }
  const ratio = common / Math.min(sWords.size, dWords.size);
  return ratio > 0.6;
};

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  // Read any valid cached results for this query immediately on mount
  const initialCache = query ? getSearchEntry(query) : null;

  const [products, setProducts] = useState<Product[]>(
    () => initialCache?.decision.all_products ?? [],
  );
  const [decision, setDecision] = useState<ShoppingDecision | null>(
    () => initialCache?.decision ?? null,
  );
  const [loading, setLoading] = useState<boolean>(
    () => Boolean(query) && !initialCache,
  );
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedSearch, setHasCompletedSearch] = useState<boolean>(
    () => Boolean(initialCache),
  );
  const [retrySequence, setRetrySequence] = useState(0);

  const isRetryingRef = React.useRef(false);

  // Restore cached scroll position on mount if available
  useEffect(() => {
    if (initialCache?.scrollY != null && initialCache.scrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: initialCache.scrollY, behavior: "instant" });
      });
    }
  }, []);

  // Track scroll position before leaving or navigating to a product
  useEffect(() => {
    const handleScroll = () => {
      if (query && hasCompletedSearch) {
        updateScrollY(query, window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (query && hasCompletedSearch) {
        updateScrollY(query, window.scrollY);
      }
    };
  }, [query, hasCompletedSearch]);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setDecision(null);
      setLoading(false);
      setError(null);
      setHasCompletedSearch(false);
      return;
    }

    const cached = getSearchEntry(query);

    // If cache is valid and not an explicit retry, restore cached state and skip network request
    if (cached && !isRetryingRef.current) {
      setDecision(cached.decision);
      setProducts(cached.decision.all_products);
      setLoading(false);
      setError(null);
      setHasCompletedSearch(true);

      if (cached.scrollY != null && cached.scrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: cached.scrollY, behavior: "instant" });
        });
      }
      return;
    }

    isRetryingRef.current = false;
    let cancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const decisionData = await getShoppingDecision(query);
        if (cancelled) return;
        setDecision(decisionData);
        setProducts(decisionData.all_products);
        setHasCompletedSearch(true);
        setSearchDecision(query, decisionData, window.scrollY);
      } catch {
        if (cancelled) return;
        setError("Product search is temporarily unavailable. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchResults();

    return () => {
      cancelled = true;
    };
  }, [query, retrySequence]);

  const [sortBy, setSortBy] = useState<"match" | "price_asc" | "price_desc" | "rating">("match");
  const [visibleCount, setVisibleCount] = useState<number>(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [query]);

  const topRecs = decision?.top_recommendations ?? [];
  const aiAnalysis = decision?.ai_analysis;
  const intent = decision?.intent;

  // Deduplicate: exclude items already in top recommendations from broader market catalogue
  const topRecIds = React.useMemo(() => {
    return new Set(topRecs.map((p) => String(p.product_id || p.id)));
  }, [topRecs]);

  const additionalProducts = React.useMemo(() => {
    return products.filter((p) => !topRecIds.has(String(p.product_id || p.id)));
  }, [products, topRecIds]);

  const sortedAdditionalProducts = React.useMemo(() => {
    const list = [...additionalProducts];
    if (sortBy === "price_asc") {
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return list;
  }, [additionalProducts, sortBy]);

  const paginatedAdditionalProducts = sortedAdditionalProducts.slice(0, visibleCount);

  return (
    <PageBackground>
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                boxShadow: "0 4px 12px rgba(124,58,237,0.30)",
              }}
            >
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "#0D0B1E" }}
            >
              Search Results
            </h1>
          </div>
          {query && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <p className="text-sm" style={{ color: "#7A7068" }}>
                Showing live results for{" "}
                <span className="font-semibold" style={{ color: "#7C3AED" }}>
                  &ldquo;{query}&rdquo;
                </span>
              </p>

              {/* Detected intent pills */}
              {intent?.category && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE" }}
                >
                  <Tag className="h-3 w-3" />
                  {intent.category}
                </span>
              )}
              {intent?.budget != null && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
                >
                  <ShieldCheck className="h-3 w-3" />
                  Budget: Under ₹{intent.budget.toLocaleString("en-IN")}
                </span>
              )}
              {intent?.features?.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ background: "#FFF7ED", color: "#EA580C", border: "1px solid #FFEDD5" }}
                >
                  <Zap className="h-3 w-3" />
                  {feat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Search form */}
        <div
          className="mb-8 rounded-2xl border p-4 sm:p-5"
          style={{
            background: "linear-gradient(135deg, #FFFFFF, #FDFAF7)",
            borderColor: "#E8E2D9",
            boxShadow: "0 2px 10px rgba(13,11,30,0.05)",
          }}
        >
          <ProductSearchForm
            initialQuery={query}
            onSearch={(nextQuery) => {
              const trimmedNext = nextQuery.trim();
              if (trimmedNext.toLowerCase() === query.trim().toLowerCase()) {
                invalidateSearchDecision(query);
                isRetryingRef.current = true;
                setRetrySequence((c) => c + 1);
              } else {
                navigate(`/search?q=${encodeURIComponent(trimmedNext)}`);
              }
            }}
          />
        </div>

        {/* Loading — initial */}
        {loading && products.length === 0 && (
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
              ShopMind AI is analyzing market offers…
            </p>
            <p className="mt-1 text-sm" style={{ color: "#A89F95" }}>
              Extracting criteria · Querying Google Shopping via SerpApi · Verifying budgets
            </p>
          </div>
        )}

        {/* Loading — over existing results */}
        {loading && products.length > 0 && (
          <div
            className="mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "#F5F3FF",
              borderColor: "#DDD6FE",
              color: "#7C3AED",
            }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading decision analysis for &ldquo;{query}&rdquo;…
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className="mb-6 flex flex-col items-center justify-center rounded-3xl border py-12 text-center"
            style={{ background: "#FFF5F5", borderColor: "#FECACA" }}
          >
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="mt-4 text-sm font-semibold" style={{ color: "#DC2626" }}>
              {error}
            </p>
            <button
              type="button"
              onClick={() => {
                if (query) invalidateSearchDecision(query);
                isRetryingRef.current = true;
                setRetrySequence((c) => c + 1);
              }}
              className="mt-4 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state (only if no AI analysis was returned) */}
        {!loading && !error && hasCompletedSearch && products.length === 0 && !aiAnalysis && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border py-20 text-center"
            style={{
              background: "linear-gradient(135deg, #FFFFFF, #F8F5FF)",
              borderColor: "#E8E2D9",
            }}
          >
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-base font-semibold" style={{ color: "#0D0B1E" }}>
              No products found for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-sm" style={{ color: "#A89F95" }}>
              Try different keywords or browse by category
            </p>
          </div>
        )}

        {/* AI Shopping Analysis Card */}
        {!loading && !error && aiAnalysis && (
          <div
            className="mb-10 overflow-hidden rounded-3xl border transition-all"
            style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #FAF7FF 50%, #FFF9F5 100%)",
              borderColor: "#DDD6FE",
              boxShadow: "0 8px 30px rgba(124, 58, 237, 0.08)",
            }}
          >
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-3.5 py-1 text-xs font-bold text-[#7C3AED]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>ShopMind AI Shopping Assistant</span>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: aiAnalysis.analysis_source === "openrouter" ? "#EDE9FE" : "#F3F4F6",
                    color: aiAnalysis.analysis_source === "openrouter" ? "#6D28D9" : "#4B5563",
                    border: aiAnalysis.analysis_source === "openrouter" ? "1px solid #C4B5FD" : "1px solid #E5E7EB",
                  }}
                >
                  {aiAnalysis.analysis_source === "openrouter"
                    ? `Powered by ${aiAnalysis.model || "OpenRouter AI"}`
                    : "Market Evaluation"}
                </span>
              </div>

              {/* Direct Answer */}
              {aiAnalysis.direct_answer && (
                <div
                  className="mb-4 rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed font-medium"
                  style={{
                    background: "linear-gradient(135deg, #F5F3FF 0%, #FAF5FF 100%)",
                    borderLeft: "4px solid #7C3AED",
                    color: "#0D0B1E",
                  }}
                >
                  <p className="font-semibold text-xs text-[#7C3AED] uppercase tracking-wider mb-1">
                    AI Shopping Guidance
                  </p>
                  <p>{aiAnalysis.direct_answer}</p>
                </div>
              )}

              {/* Summary / Explanatory Paragraph - only if provided and not duplicating the guidance */}
              {aiAnalysis.summary &&
                aiAnalysis.summary.trim().length > 0 &&
                !isDuplicateSummary(aiAnalysis.summary, aiAnalysis.direct_answer) && (
                  <p className="mb-4 text-sm sm:text-base font-normal leading-relaxed text-[#5A5248]">
                    {aiAnalysis.summary}
                  </p>
                )}

              {/* Key criteria */}
              {aiAnalysis.key_criteria && aiAnalysis.key_criteria.length > 0 && (
                <div className="mt-5 pt-5 border-t border-purple-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] mb-3 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    Key Decision Criteria
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiAnalysis.key_criteria.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed font-medium"
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          border: "1px solid #E8E2D9",
                          color: "#5A5248",
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trade-offs & Final Recommendation */}
              {(aiAnalysis.trade_offs || aiAnalysis.final_recommendation) && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {aiAnalysis.trade_offs && (
                    <div
                      className="rounded-xl p-3.5 text-xs font-medium"
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        color: "#92400E",
                      }}
                    >
                      <p className="font-bold text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5 text-[#B45309]">
                        <span>⚖️</span> Market Trade-Offs
                      </p>
                      <p className="leading-relaxed">{aiAnalysis.trade_offs}</p>
                    </div>
                  )}

                  {aiAnalysis.final_recommendation && (
                    <div
                      className="rounded-xl p-3.5 text-xs font-medium"
                      style={{
                        background: "#F5F3FF",
                        border: "1px solid #DDD6FE",
                        color: "#5B21B6",
                      }}
                    >
                      <p className="font-bold text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5 text-[#7C3AED]">
                        <span>🎯</span> Final Verdict
                      </p>
                      <p className="leading-relaxed">{aiAnalysis.final_recommendation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Budget verdict bar */}
              {aiAnalysis.budget_verdict && (
                <div
                  className="mt-5 flex items-center gap-2.5 rounded-xl p-3.5 text-xs font-semibold"
                  style={{
                    background: intent?.budget ? "#ECFDF5" : "#F8F5FF",
                    border: intent?.budget ? "1px solid #A7F3D0" : "1px solid #DDD6FE",
                    color: intent?.budget ? "#065F46" : "#6D28D9",
                  }}
                >
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                  <span>{aiAnalysis.budget_verdict}</span>
                </div>
              )}

              {/* Missing Information / Limitations Alert */}
              {(aiAnalysis.missing_information || aiAnalysis.limitations) && (
                <div
                  className="mt-3 flex items-start gap-2.5 rounded-xl p-3 text-xs font-medium"
                  style={{
                    background: "#FFF7ED",
                    border: "1px solid #FFEDD5",
                    color: "#9A3412",
                  }}
                >
                  <span className="text-sm">ℹ️</span>
                  <div>
                    {aiAnalysis.missing_information && (
                      <p className="font-semibold">{aiAnalysis.missing_information}</p>
                    )}
                    {aiAnalysis.limitations && aiAnalysis.limitations !== aiAnalysis.missing_information && (
                      <p className="mt-0.5 text-[11px] opacity-90">{aiAnalysis.limitations}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Zero-match strict constraint alert */}
        {!loading && !error && hasCompletedSearch && topRecs.length === 0 && aiAnalysis && (
          <div
            className="mb-10 rounded-2xl border p-6 text-center"
            style={{
              background: "#FFFBEB",
              borderColor: "#FDE68A",
              color: "#92400E",
            }}
          >
            <span className="text-3xl mb-2 block">⚠️</span>
            <h3 className="text-base font-bold text-[#92400E]">
              No Products Met All Strict Constraints
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[#B45309] max-w-xl mx-auto leading-relaxed">
              {aiAnalysis.limitations ||
                aiAnalysis.direct_answer ||
                "No live market models satisfied both your stated budget ceiling and hardware specifications. Over-budget and unverified configurations were omitted."}
            </p>
            <p className="mt-2 text-xs font-semibold text-[#78350F]">
              Suggestion: Consider broadening your budget ceiling or broadening technical requirements.
            </p>
          </div>
        )}

        {/* Top 5 AI Product Recommendations */}
        {!loading && !error && topRecs.length > 0 && (
          <div className="mb-12">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="text-xl sm:text-2xl font-bold tracking-tight"
                    style={{ color: "#0D0B1E" }}
                  >
                    Top {topRecs.length} AI Recommendations
                  </h2>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                      color: "#FFFFFF",
                    }}
                  >
                    Curated Picks
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-[#7A7068]">
                  Selected from live Google Shopping results based on feature matching and budget fit.
                </p>
              </div>
            </div>

            {/* If fewer than 5 qualified because of strict constraints, show limitation banner */}
            {topRecs.length < 5 && (
              <div
                className="mb-4 rounded-xl px-4 py-2.5 text-xs font-medium border"
                style={{
                  background: "#FEF3C7",
                  borderColor: "#FDE68A",
                  color: "#92400E",
                }}
              >
                <span>⚠️ Strict Constraint Match: Only {topRecs.length} product(s) in live listings satisfied all required criteria. Non-qualifying models were omitted from top recommendations.</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {topRecs.map((product) => (
                <ProductCard
                  key={`rec-${product.id}`}
                  product={product}
                  navigationState={{ comparisonCandidates: products }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Explore More Products / All Live Market Results */}
        {additionalProducts.length > 0 && (
          <div>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3
                  className="text-lg sm:text-xl font-bold tracking-tight"
                  style={{ color: "#0D0B1E" }}
                >
                  Explore More Products
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: "#7A7068" }}>
                  Showing{" "}
                  <span className="font-bold" style={{ color: "#0D0B1E" }}>
                    {Math.min(visibleCount, sortedAdditionalProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold" style={{ color: "#0D0B1E" }}>
                    {sortedAdditionalProducts.length}
                  </span>{" "}
                  additional live offers from Google Shopping
                </p>
              </div>

              {/* Controls: Sorting */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs font-semibold text-[#7A7068]">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "match" | "price_asc" | "price_desc" | "rating",
                    )
                  }
                  className="rounded-xl border border-[#E8E2D9] bg-white px-3 py-1.5 text-xs font-semibold text-[#0D0B1E] shadow-xs focus:border-[#7C3AED] focus:outline-hidden"
                >
                  <option value="match">Best Match</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "#FFF7ED", color: "#F97316" }}
                >
                  Google Shopping · India
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedAdditionalProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigationState={{ comparisonCandidates: products }}
                />
              ))}
            </div>

            {/* Load More Pagination */}
            {visibleCount < sortedAdditionalProducts.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold text-[#7C3AED] border border-[#DDD6FE] bg-[#F5F3FF] transition-all hover:bg-[#EDE9FE] hover:border-[#C4B5FD] shadow-xs"
                >
                  Load More Products ({sortedAdditionalProducts.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </PageBackground>
  );
};

export default SearchResults;

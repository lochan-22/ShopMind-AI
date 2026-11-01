import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowRight, CircleAlert, Layers, RefreshCw, SearchX, Sparkles, Tag, Wallet, Zap } from "lucide-react";
import { SearchCommand, EXAMPLE_PROMPTS } from "../components/search/SearchCommand";
import { InsightsPanel } from "../components/insights/InsightsPanel";
import { AnalysisProgress } from "../components/insights/AnalysisProgress";
import { FeaturedRecommendation, RecommendationCard } from "../components/product/RecommendationCard";
import { ProductCard } from "../components/product/ProductCard";
import { StateView } from "../components/ui/StateView";
import { Reveal } from "../components/ui/Reveal";
import { Badge } from "../components/ui/Badge";
import { Accent } from "../components/ui/SectionHeading";
import { Button, buttonClasses } from "../components/ui/Button";
import { getShoppingDecision, type ShoppingDecision } from "../services/productService";
import { getSearchEntry, invalidateSearchDecision, setSearchDecision, updateScrollY } from "../services/searchCache";
import { useAgent } from "../agent/AgentContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/errors";
import { productKey, productRetailer } from "../utils/product";
import { cn } from "../utils/cn";

type SortKey = "match" | "price_asc" | "price_desc" | "rating";
const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

/** Landing view for /search without a query. */
const SearchLanding = () => {
  const navigate = useNavigate();
  const go = (query: string) => navigate(`/search?q=${encodeURIComponent(query)}`);
  return (
    <section className="container-x pb-24 pt-36 sm:pt-44">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow text-muted">Ask ShopMind</p>
        <h1 className="mt-4 text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[3.6rem]">
          What are you <Accent>shopping for?</Accent>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted">Include a budget, the way you'll use it, and anything you can't compromise on.</p>
        <SearchCommand className="mt-10 text-left" autoFocus onSubmit={go} animatedPlaceholder />
        <div className="mt-8 grid gap-2.5 text-left sm:grid-cols-2">
          {EXAMPLE_PROMPTS.map((prompt, index) => (
            <button
              key={prompt}
              type="button"
              onClick={() => go(prompt)}
              className="rise-in group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-[13.5px] text-ink-2 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:text-ink"
              style={{ ["--rise-index" as string]: index }}
            >
              {prompt}
              <ArrowRight className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const IntentChips = ({ decision }: { decision: ShoppingDecision }) => {
  const intent = decision.intent;
  const budget = intent.budget_max ?? intent.budget;
  const features = Array.from(new Set([...(intent.required_features ?? []), ...(intent.features ?? [])])).slice(0, 5);
  if (!intent.category && budget == null && !intent.brand && features.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] text-faint">Understood as</span>
      {intent.category && (
        <Badge tone="outline" icon={<Tag className="h-3 w-3" />}>
          {intent.category}
        </Badge>
      )}
      {budget != null && (
        <Badge tone="jade" icon={<Wallet className="h-3 w-3" />}>
          Under ₹{budget.toLocaleString("en-IN")}
        </Badge>
      )}
      {intent.brand && <Badge tone="outline">{intent.brand}</Badge>}
      {features.map((feature) => (
        <Badge key={feature} tone="outline" icon={<Zap className="h-3 w-3" />}>
          {feature}
        </Badge>
      ))}
    </div>
  );
};

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const { openAgent } = useAgent();
  useDocumentTitle(query ? `“${query}”` : "Search");

  const initialCache = query ? getSearchEntry(query) : null;
  const [decision, setDecision] = useState<ShoppingDecision | null>(() => initialCache?.decision ?? null);
  const [loading, setLoading] = useState(() => Boolean(query) && !initialCache);
  const [error, setError] = useState<string | null>(null);
  const [retrySequence, setRetrySequence] = useState(0);
  const forceRefreshRef = useRef(false);
  const [sortBy, setSortBy] = useState<SortKey>("match");
  const [retailer, setRetailer] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Load the decision: from cache when returning from a product page, otherwise live.
  useEffect(() => {
    setSortBy("match");
    setRetailer(null);
    setVisibleCount(PAGE_SIZE);
    if (!query) {
      setDecision(null);
      setLoading(false);
      setError(null);
      return;
    }

    const cached = getSearchEntry(query);
    if (cached && !forceRefreshRef.current) {
      setDecision(cached.decision);
      setLoading(false);
      setError(null);
      if (cached.scrollY && cached.scrollY > 0) {
        requestAnimationFrame(() => window.scrollTo({ top: cached.scrollY, behavior: "instant" }));
      }
      return;
    }

    forceRefreshRef.current = false;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDecision(null);

    getShoppingDecision(query)
      .then((data) => {
        if (cancelled) return;
        setDecision(data);
        // Unranked fallbacks are not cached so the next visit retries the full analysis.
        if (data.ai_analysis.analysis_source !== "search_only") setSearchDecision(query, data, 0);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, "Product search is temporarily unavailable. Please try again."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, retrySequence]);

  // Remember the scroll position so returning from a product restores it.
  useEffect(() => {
    if (!query || !decision) return;
    const onScroll = () => updateScrollY(query, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      updateScrollY(query, window.scrollY);
    };
  }, [query, decision]);

  const retry = () => {
    if (query) invalidateSearchDecision(query);
    forceRefreshRef.current = true;
    setRetrySequence((value) => value + 1);
  };

  const handleSearch = (next: string) => {
    if (next.toLowerCase() === query.toLowerCase()) retry();
    else navigate(`/search?q=${encodeURIComponent(next)}`);
  };

  const allProducts = useMemo(() => decision?.all_products ?? [], [decision]);
  const topRecs = useMemo(() => decision?.top_recommendations ?? [], [decision]);
  const isSearchOnly = decision?.ai_analysis.analysis_source === "search_only";

  const explore = useMemo(() => {
    const topKeys = new Set(topRecs.map(productKey));
    return allProducts.filter((product) => !topKeys.has(productKey(product)));
  }, [allProducts, topRecs]);

  const retailers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of explore) {
      const name = productRetailer(product);
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name]) => name);
  }, [explore]);

  const sortedExplore = useMemo(() => {
    const list = retailer ? explore.filter((product) => productRetailer(product) === retailer) : [...explore];
    if (sortBy === "price_asc") list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sortBy === "price_desc") list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sortBy === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [explore, sortBy, retailer]);

  if (!query) return <SearchLanding />;

  const [first, ...rest] = topRecs;
  const noQualifying = decision && !isSearchOnly && topRecs.length === 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line bg-surface/50 pb-10 pt-28 sm:pt-32">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,#000,transparent)]" aria-hidden="true" />
        <div className="container-x relative">
          <p className="eyebrow text-muted">Results for</p>
          <h1 className="mt-3 max-w-4xl text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[2.6rem]">
            <Accent>“</Accent>
            {query}
            <Accent>”</Accent>
          </h1>
          {decision && (
            <div className="mt-4">
              <IntentChips decision={decision} />
            </div>
          )}
          <SearchCommand className="mt-7 max-w-3xl" initialQuery={query} onSubmit={handleSearch} busy={loading} />
        </div>
      </section>

      <div className="container-x mt-12 space-y-20 sm:mt-14 sm:space-y-24">
        {loading && <AnalysisProgress query={query} />}

        {!loading && error && (
          <StateView
            tone="danger"
            icon={<CircleAlert className="h-6 w-6" />}
            title="We couldn't complete this search"
            description={error}
            actions={
              <>
                <Button onClick={retry} icon={<RefreshCw className="h-4 w-4" />}>
                  Try again
                </Button>
                <Link to="/categories" className={buttonClasses("secondary")}>
                  Browse collections
                </Link>
              </>
            }
          />
        )}

        {!loading && !error && decision && (
          <>
            {isSearchOnly && (
              <div className="rise-in flex flex-col gap-4 rounded-3xl border border-warn/15 bg-warn-soft p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
                  <div>
                    <p className="font-medium text-ink">Buying analysis is unavailable right now</p>
                    <p className="mt-1 text-sm text-muted">These are live listings in their original order — not yet ranked or filtered against your requirements.</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={retry} icon={<RefreshCw className="h-4 w-4" />}>
                  Retry analysis
                </Button>
              </div>
            )}

            {!isSearchOnly && <InsightsPanel decision={decision} />}

            {noQualifying && (
              <StateView
                tone="warn"
                icon={<SearchX className="h-6 w-6" />}
                title="Nothing met every requirement"
                description={
                  <>
                    <p>{decision.ai_analysis.limitations || "No live listing satisfied both your budget and your required specifications."}</p>
                    <p className="mt-3 text-faint">Try a slightly higher budget, fewer must-haves, or a broader category.</p>
                  </>
                }
                actions={
                  <>
                    <Button onClick={openAgent} icon={<Sparkles className="h-4 w-4 text-jade-300" />}>
                      Refine with the concierge
                    </Button>
                    <Link to="/categories" className={buttonClasses("secondary")}>
                      Browse collections
                    </Link>
                  </>
                }
              />
            )}

            {first && (
              <section aria-labelledby="top-picks">
                <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow flex items-center gap-2 text-muted">
                      <span className="h-px w-6 bg-line-strong" />
                      Shortlist
                    </p>
                    <h2 id="top-picks" className="mt-3 text-[1.9rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2.3rem]">
                      Top-Tier Recommendations
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-muted">
                      Ranked from live listings by fit, value, verified specs and reputation. Prices and stock can change at the retailer.
                    </p>
                  </div>
                  {explore.length > 0 && (
                    <a href="#explore" className={buttonClasses("ghost", "sm")}>
                      {explore.length} more listings <ArrowDown className="h-3.5 w-3.5" />
                    </a>
                  )}
                </Reveal>

                {topRecs.length < 5 && (
                  <p className="mt-5 flex gap-2 text-[13px] text-warn">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    Only {topRecs.length} listing{topRecs.length === 1 ? "" : "s"} met every requirement, so the shortlist is shorter than five.
                  </p>
                )}

                <Reveal className="mt-8" variant="scale">
                  <FeaturedRecommendation product={first} rank={1} candidates={allProducts} />
                </Reveal>
                {rest.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {rest.map((product, index) => (
                      <Reveal key={productKey(product)} index={index}>
                        <RecommendationCard product={product} rank={index + 2} candidates={allProducts} />
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            )}

            {explore.length > 0 && (
              <section id="explore" aria-labelledby="explore-heading" className="scroll-mt-24">
                <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="eyebrow flex items-center gap-2 text-muted">
                      <Layers className="h-3.5 w-3.5" /> {isSearchOnly ? "Live listings" : "Also qualified"}
                    </p>
                    <h2 id="explore-heading" className="mt-3 text-[1.7rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2rem]">
                      Explore the Collection
                    </h2>
                    <p className="tabular mt-2 text-sm text-muted">
                      {sortedExplore.length} {isSearchOnly ? "live listings" : "more listings that passed every check"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-[13px] text-muted">
                    Sort
                    <select
                      value={sortBy}
                      onChange={(event) => {
                        setSortBy(event.target.value as SortKey);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className="h-10 rounded-full border border-line bg-surface px-4 text-[13px] font-medium text-ink outline-none focus:border-jade-400"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </Reveal>

                {retailers.length > 1 && (
                  <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                    {[null, ...retailers].map((name) => (
                      <button
                        key={name ?? "all"}
                        type="button"
                        onClick={() => {
                          setRetailer(name);
                          setVisibleCount(PAGE_SIZE);
                        }}
                        aria-pressed={retailer === name}
                        className={cn(
                          "shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors duration-300",
                          retailer === name ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-line-strong",
                        )}
                      >
                        {name ?? "All retailers"}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                  {sortedExplore.slice(0, visibleCount).map((product, index) => (
                    <Reveal key={productKey(product)} index={index % PAGE_SIZE}>
                      <ProductCard product={product} candidates={allProducts} />
                    </Reveal>
                  ))}
                </div>

                {visibleCount < sortedExplore.length && (
                  <div className="mt-10 flex justify-center">
                    <Button variant="secondary" size="lg" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                      Show more <span className="tabular text-faint">({sortedExplore.length - visibleCount})</span>
                    </Button>
                  </div>
                )}
              </section>
            )}

            {!first && explore.length === 0 && !noQualifying && (
              <StateView
                icon={<SearchX className="h-6 w-6" />}
                title={`No listings found for “${query}”`}
                description="Try different wording, a broader product type, or browse a collection."
                actions={
                  <Link to="/categories" className={buttonClasses("secondary")}>
                    Browse collections
                  </Link>
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

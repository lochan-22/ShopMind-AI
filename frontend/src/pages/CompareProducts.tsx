import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CircleAlert, GitCompareArrows, Loader2, RefreshCw, Scale, Search, Sparkles, Trophy } from "lucide-react";
import {
  compareProducts,
  searchProducts,
  type ComparisonProduct,
  type Product,
  type ProductComparison,
} from "../services/productService";
import { ProductImage } from "../components/product/ProductImage";
import { StateView } from "../components/ui/StateView";
import { Skeleton } from "../components/ui/Skeleton";
import { Reveal } from "../components/ui/Reveal";
import { Accent } from "../components/ui/SectionHeading";
import { Button, buttonClasses } from "../components/ui/Button";
import { useCart } from "../contexts/CartContext";
import { useCompare } from "../contexts/CompareContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { isComparable, productKey } from "../utils/product";
import { cn } from "../utils/cn";

const availabilityLabel = (value: boolean | null) => (value === true ? "In stock" : value === false ? "Out of stock" : "Not stated");

/* ── Picker ───────────────────────────────────────────────────────────── */

const CandidateButton = ({ product, onPick }: { product: Product; onPick: (product: Product) => void }) => (
  <button
    type="button"
    onClick={() => onPick(product)}
    className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 text-left transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
  >
    <ProductImage src={product.image} alt="" className="h-16 w-16 shrink-0 rounded-xl" imgClassName="p-1.5" />
    <span className="min-w-0 flex-1">
      <span className="eyebrow block truncate text-[9.5px] text-faint">{product.brand ?? product.retailer ?? "Live listing"}</span>
      <span className="line-clamp-2 mt-0.5 block text-[13.5px] font-medium leading-snug text-ink">{product.name}</span>
      <span className="tabular mt-1 block text-[13px] font-semibold text-ink-2">{formatPrice(product.price, product.currency) ?? "Price unavailable"}</span>
    </span>
    <GitCompareArrows className="mr-1 h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-jade-600" />
  </button>
);

const CandidateGroup = ({ title, products, onPick }: { title: string; products: Product[]; onPick: (product: Product) => void }) =>
  products.length === 0 ? null : (
    <div>
      <p className="eyebrow mb-3 text-[10px] text-muted">{title}</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {products.map((product) => (
          <CandidateButton key={productKey(product)} product={product} onPick={onPick} />
        ))}
      </div>
    </div>
  );

const Picker = ({ excludeId, onPick, title, subtitle }: { excludeId?: string; onPick: (product: Product) => void; title: string; subtitle: string }) => {
  const location = useLocation();
  const { items } = useCart();
  const { selected, candidates: trayCandidates } = useCompare();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateCandidates = (location.state as { comparisonCandidates?: Product[] } | null)?.comparisonCandidates;
  const usable = (list: Product[]) => {
    const seen = new Set<string>();
    return list.filter((product) => {
      const key = productKey(product);
      if (!isComparable(product) || product.product_id === excludeId || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const fromSearch = usable(Array.isArray(stateCandidates) && stateCandidates.length ? stateCandidates : trayCandidates).slice(0, 8);
  const fromTray = usable(selected);
  const fromCart = usable(items.map((item) => item.product));

  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    setError(null);
    try {
      setResults(usable(await searchProducts(trimmed)));
    } catch (err) {
      setError(getErrorMessage(err, "Live search is unavailable right now. Please try again."));
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className="card rise-in p-5 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
      <form onSubmit={runSearch} className="mt-6 flex items-center gap-2 rounded-2xl border border-line bg-paper/60 p-1.5 pl-4 focus-within:border-jade-300">
        <Search className="h-4 w-4 shrink-0 text-faint" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search any product to compare…"
          aria-label="Search products to compare"
          className="h-10 min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-faint"
        />
        <Button type="submit" size="sm" disabled={searching} className="h-10">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-8 space-y-8">
        {results && (results.length ? <CandidateGroup title="Search results" products={results} onPick={onPick} /> : <p className="text-sm text-muted">No comparable live listings found for that search.</p>)}
        <CandidateGroup title="Selected for comparison" products={fromTray} onPick={onPick} />
        <CandidateGroup title="From your last search" products={fromSearch} onPick={onPick} />
        <CandidateGroup title="In your cart" products={fromCart} onPick={onPick} />
        {!results && !fromTray.length && !fromSearch.length && !fromCart.length && (
          <p className="text-sm text-muted">
            Search above, or{" "}
            <Link to="/categories" className="text-jade-700 underline underline-offset-4">
              browse a collection
            </Link>{" "}
            and use the compare button on any product.
          </p>
        )}
      </div>
    </section>
  );
};

/* ── Comparison view ──────────────────────────────────────────────────── */

const ProductColumn = ({ product, isPick, cheaper }: { product: ComparisonProduct; isPick: boolean; cheaper: boolean }) => {
  const rows: [string, string, boolean?][] = [
    ["Current price", formatPrice(product.current_price) ?? "Not available"],
    ["Best price", formatPrice(product.best_price) ?? "Not available", cheaper],
    ["Rating", product.rating != null ? `${product.rating.toFixed(1)} / 5` : "Not available"],
    ["Reviews", product.review_count?.toLocaleString("en-IN") ?? "Not available"],
    ["Availability", availabilityLabel(product.availability)],
    ["Retailer offers", String(product.offer_count)],
    ["Best retailer", product.best_retailer ?? "Not available"],
  ];
  return (
    <article className={cn("relative flex flex-col rounded-[26px] bg-surface p-3 shadow-card", isPick ? "aurora-border shadow-lift" : "border border-line")}>
      {isPick && (
        <span className="absolute left-6 top-6 z-[1] inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11.5px] font-medium text-white">
          <Trophy className="h-3.5 w-3.5 text-jade-300" /> ShopMind pick
        </span>
      )}
      <ProductImage src={product.image} alt={product.name} eager className="aspect-[4/3] rounded-[20px]" imgClassName="p-8" />
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <p className="eyebrow text-[10px] text-faint">{product.brand ?? "Brand not stated"}</p>
        <h2 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-ink">{product.name}</h2>
        <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
          {rows.map(([label, value, highlight]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">{label}</dt>
              <dd className={cn("tabular text-right font-medium", highlight ? "text-jade-700" : "text-ink")}>{value}</dd>
            </div>
          ))}
        </dl>
        {product.product_url && (
          <a href={product.product_url} target="_blank" rel="noopener noreferrer" className={buttonClasses(isPick ? "primary" : "secondary", "md", "mt-6 w-full")}>
            View best offer <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
};

const ComparisonView = ({ comparison }: { comparison: ProductComparison }) => {
  const { product_a: a, product_b: b } = comparison;
  const specKeys = useMemo(() => Array.from(new Set([...Object.keys(a.specifications), ...Object.keys(b.specifications)])).sort(), [a, b]);
  const nameFor = (id: string | null) => (id === a.product_id ? a.name : id === b.product_id ? b.name : null);
  const aCheaper = a.best_price != null && b.best_price != null && a.best_price < b.best_price;
  const bCheaper = a.best_price != null && b.best_price != null && b.best_price < a.best_price;

  return (
    <div className="space-y-16">
      <header className="rise-in text-center">
        <p className="eyebrow text-muted">Side by side</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-[1.6rem] font-semibold leading-[1.2] tracking-[-0.03em] text-ink sm:text-[2.4rem]">
          <span className="line-clamp-2">{a.name}</span>
          <Accent aurora> versus </Accent>
          <span className="line-clamp-2">{b.name}</span>
        </h1>
      </header>

      <div className="relative grid gap-4 md:grid-cols-2">
        <Reveal>
          <ProductColumn product={a} isPick={comparison.shopmind_pick_product_id === a.product_id} cheaper={aCheaper} />
        </Reveal>
        <Reveal index={1}>
          <ProductColumn product={b} isPick={comparison.shopmind_pick_product_id === b.product_id} cheaper={bCheaper} />
        </Reveal>
        <span className="font-display absolute left-1/2 top-[30%] z-[2] hidden h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-paper text-xl italic text-ink shadow-card md:flex">
          vs
        </span>
      </div>

      <Reveal className="noise relative overflow-hidden rounded-[1.5rem] bg-night p-7 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-jade-500/25 blur-3xl" aria-hidden="true" />
        <p className="eyebrow relative flex items-center gap-2 text-[10px] text-white/50">
          <Scale className="h-3.5 w-3.5 text-jade-300" /> Verdict
        </p>
        <p className="relative mt-4 max-w-3xl text-[1.15rem] leading-relaxed text-white/90 sm:text-[1.3rem]">{comparison.recommendation}</p>
        {comparison.price_difference != null && (
          <p className="tabular relative mt-5 text-sm text-white/50">Best-price difference: {formatPrice(comparison.price_difference)}</p>
        )}
        <p className="relative mt-6 text-[11.5px] text-white/35">Derived from the listings' prices, ratings, reviews, offers and availability.</p>
      </Reveal>

      {comparison.insights.length > 0 && (
        <section>
          <h2 className="eyebrow text-muted">Where each one wins</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comparison.insights.map((insight, index) => {
              const winner = nameFor(insight.winner_product_id);
              return (
                <Reveal key={`${insight.label}-${index}`} index={index} className="card p-6">
                  <p className="text-[15px] font-semibold tracking-tight text-ink">{insight.label}</p>
                  {winner ? (
                    <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-jade-50 px-2.5 py-1 text-[11.5px] font-medium text-jade-700">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span className="truncate">{winner}</span>
                    </p>
                  ) : (
                    <p className="mt-2 inline-flex rounded-full bg-sunken px-2.5 py-1 text-[11.5px] text-muted">Even</p>
                  )}
                  <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{insight.message}</p>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {specKeys.length > 0 && (
        <Reveal>
          <h2 className="eyebrow text-muted">Specifications</h2>
          <div className="card mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="w-1/4 px-5 py-4 font-medium text-muted">Specification</th>
                  <th className="px-5 py-4 font-medium text-ink">
                    <span className="line-clamp-1">{a.name}</span>
                  </th>
                  <th className="px-5 py-4 font-medium text-ink">
                    <span className="line-clamp-1">{b.name}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {specKeys.map((key) => {
                  const valueA = a.specifications[key];
                  const valueB = b.specifications[key];
                  const differs = valueA !== valueB;
                  return (
                    <tr key={key} className="transition-colors hover:bg-paper/70">
                      <th className="px-5 py-3.5 text-left font-normal text-muted">{key}</th>
                      <td className={cn("px-5 py-3.5", valueA ? "text-ink" : "text-faint", differs && valueA && "font-medium")}>{valueA ?? "Not listed"}</td>
                      <td className={cn("px-5 py-3.5", valueB ? "text-ink" : "text-faint", differs && valueB && "font-medium")}>{valueB ?? "Not listed"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {[a, b].map((product, index) => (
          <Reveal key={product.product_id} index={index} className="card p-6">
            <h3 className="line-clamp-1 text-[15px] font-semibold text-ink">{product.name}</h3>
            <p className="mt-1 text-[12.5px] text-muted">
              {product.offers.length} retailer offer{product.offers.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-4 divide-y divide-line">
              {product.offers.length === 0 && <li className="py-3 text-sm text-faint">No offers listed.</li>}
              {product.offers.map((offer, offerIndex) => (
                <li key={`${offer.retailer ?? "offer"}-${offerIndex}`} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {offer.retailer ?? "Retailer"}
                    {offer.is_best_price && <span className="ml-2 rounded-full bg-jade-50 px-2 py-0.5 text-[10.5px] font-medium text-jade-700">Best price</span>}
                  </span>
                  <span className="tabular text-sm font-semibold text-ink">{formatPrice(offer.price, offer.currency) ?? "—"}</span>
                  {offer.product_url && (
                    <a href={offer.product_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line p-1.5 text-ink-2 transition-colors hover:border-ink" aria-label={`Open ${offer.retailer ?? "retailer"} offer`}>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </section>
    </div>
  );
};

const ComparisonSkeleton = () => (
  <div className="space-y-10" role="status" aria-label="Comparing products">
    <div className="mx-auto max-w-xl space-y-3">
      <Skeleton className="mx-auto h-3 w-24 rounded-full" />
      <Skeleton className="h-8 w-full rounded-full" />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-[34rem] w-full rounded-[26px]" />
      <Skeleton className="h-[34rem] w-full rounded-[26px]" />
    </div>
  </div>
);

/* ── Page ─────────────────────────────────────────────────────────────── */

const CompareProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const productA = params.get("product_a") ?? "";
  const productB = params.get("product_b") ?? "";
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  useDocumentTitle(comparison ? `${comparison.product_a.name} vs ${comparison.product_b.name}` : "Compare");

  useEffect(() => {
    if (!productA || !productB || productA === productB) {
      setComparison(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    compareProducts(productA, productB)
      .then((data) => !cancelled && setComparison(data))
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, "We couldn't compare these products. One of the listings may have expired."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [productA, productB, reload]);

  const pick = (key: "product_a" | "product_b") => (product: Product) => {
    if (!product.product_id) return;
    const next = new URLSearchParams(params);
    next.set(key, product.product_id);
    navigate(`/compare?${next.toString()}`, { state: location.state });
  };

  return (
    <div className="container-x pb-24 pt-28 sm:pt-32">
      {(productA || productB) && (
        <button type="button" onClick={() => navigate(-1)} className="group mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
        </button>
      )}

      {!productA && (
        <div className="mx-auto max-w-3xl">
          <div className="rise-in mb-10 text-center">
            <p className="eyebrow text-muted">Compare</p>
            <h1 className="mt-4 text-[2.3rem] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[3.2rem]">
              Two products, <Accent>one clear answer</Accent>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted">Prices, offers, ratings and specs from live listings — side by side, with a verdict.</p>
          </div>
          <Picker onPick={pick("product_a")} title="Choose your first product" subtitle="Pick from your recent results, your cart, or search for anything." />
        </div>
      )}

      {productA && !productB && (
        <div className="mx-auto max-w-3xl">
          <Picker excludeId={productA} onPick={pick("product_b")} title="Now choose a second product" subtitle="Select one product to set against your first choice." />
        </div>
      )}

      {productA && productB && productA === productB && (
        <StateView
          tone="warn"
          icon={<GitCompareArrows className="h-6 w-6" />}
          title="Choose two different products"
          description="A product can't be compared with itself."
          actions={
            <Button onClick={() => navigate(`/compare?product_a=${encodeURIComponent(productA)}`, { state: location.state })}>Pick another product</Button>
          }
        />
      )}

      {productA && productB && productA !== productB && (
        <>
          {loading && <ComparisonSkeleton />}
          {!loading && error && (
            <StateView
              tone="danger"
              icon={<CircleAlert className="h-6 w-6" />}
              title="This comparison couldn't load"
              description={error}
              actions={
                <>
                  <Button onClick={() => setReload((value) => value + 1)} icon={<RefreshCw className="h-4 w-4" />}>
                    Try again
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(`/compare?product_a=${encodeURIComponent(productA)}`, { state: location.state })}>
                    Choose another product
                  </Button>
                </>
              }
            />
          )}
          {!loading && !error && comparison && <ComparisonView comparison={comparison} />}
        </>
      )}
    </div>
  );
};

export default CompareProducts;

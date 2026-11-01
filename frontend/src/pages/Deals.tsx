import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleAlert, Footprints, Headphones, Laptop, Radio, RefreshCw, Smartphone, Sparkles, Watch, type LucideIcon } from "lucide-react";
import { searchProducts, type Product } from "../services/productService";
import { ProductCard } from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { StateView } from "../components/ui/StateView";
import { Reveal } from "../components/ui/Reveal";
import { Accent } from "../components/ui/SectionHeading";
import { Button, buttonClasses } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { productKey } from "../utils/product";
import { cn } from "../utils/cn";

interface Segment {
  id: string;
  label: string;
  icon: LucideIcon;
  query: string;
  ask: string;
}

const SEGMENTS: Segment[] = [
  { id: "all", label: "Popular tech", icon: Radio, query: "popular electronics gadgets India", ask: "Best value electronics gadgets right now" },
  { id: "smartphones", label: "Smartphones", icon: Smartphone, query: "best price smartphones India", ask: "Best value smartphone right now" },
  { id: "laptops", label: "Laptops", icon: Laptop, query: "best laptop deals India", ask: "Best value laptop right now" },
  { id: "audio", label: "Audio", icon: Headphones, query: "best wireless headphones India", ask: "Best wireless headphones for the price" },
  { id: "wearables", label: "Smartwatches", icon: Watch, query: "smartwatch deals India", ask: "Best value smartwatch right now" },
  { id: "footwear", label: "Running shoes", icon: Footprints, query: "running shoes India", ask: "Best running shoes for the price" },
];

type SortKey = "default" | "price_asc" | "price_desc" | "rating";

/** Kept for the session so switching segments doesn't refetch. */
const segmentCache = new Map<string, Product[]>();

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const Deals = () => {
  useDocumentTitle("Live Market");
  const [segment, setSegment] = useState<Segment>(SEGMENTS[0]);
  const [products, setProducts] = useState<Product[]>(() => segmentCache.get(SEGMENTS[0].id) ?? []);
  const [loading, setLoading] = useState(() => !segmentCache.has(SEGMENTS[0].id));
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("default");

  useEffect(() => {
    const cached = segmentCache.get(segment.id);
    if (cached && refresh === 0) {
      setProducts(cached);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchProducts(segment.query)
      .then((data) => {
        if (cancelled) return;
        segmentCache.set(segment.id, data);
        setProducts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, "Live market data is unavailable right now."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [segment, refresh]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sortBy === "price_asc") list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sortBy === "price_desc") list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sortBy === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [products, sortBy]);

  // Price statistics computed from the listings on screen.
  const stats = useMemo(() => {
    const prices = products.map((product) => product.price).filter((price): price is number => price != null && price > 0);
    return {
      count: products.length,
      low: prices.length ? Math.min(...prices) : null,
      median: median(prices),
      retailers: new Set(products.map((product) => product.retailer).filter(Boolean)).size,
    };
  }, [products]);

  return (
    <div className="pb-24">
      <section className="noise relative overflow-hidden bg-night pb-14 pt-32 text-white sm:pt-40">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="grid-fade absolute inset-0" />
          <div className="animate-float-a absolute -left-24 top-0 h-96 w-96 rounded-full bg-jade-500/25 blur-[110px]" />
          <div className="animate-float-b absolute -right-24 top-10 h-96 w-96 rounded-full bg-sky-aurora/20 blur-[110px]" />
        </div>
        <div className="container-x relative">
          <div className="rise-in max-w-2xl">
            <p className="eyebrow flex items-center gap-2 text-white/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="pulse-ring absolute inset-0 rounded-full bg-jade-300" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-jade-300" />
              </span>
              Live market
            </p>
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[4rem]">
              What the market is <Accent aurora>charging today</Accent>
            </h1>
            <p className="mt-5 text-[15.5px] leading-relaxed text-white/55">
              Current listings across popular segments, straight from retailers. Prices are shown exactly as listed — compare them here, then let ShopMind rank them.
            </p>
          </div>

          <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Market segments">
            {SEGMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={segment.id === item.id}
                onClick={() => {
                  setSegment(item);
                  setSortBy("default");
                  setRefresh(0);
                }}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-[background-color,border-color,color] duration-300",
                  segment.id === item.id ? "border-white bg-white text-ink" : "border-white/12 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              ["Listings", loading ? "—" : String(stats.count)],
              ["Lowest price", loading ? "—" : (formatPrice(stats.low) ?? "—")],
              ["Median price", loading ? "—" : (formatPrice(stats.median) ?? "—")],
              ["Retailers", loading ? "—" : String(stats.retailers)],
            ].map(([label, value]) => (
              <div key={label} className="bg-night/80 px-5 py-4">
                <dt className="text-[11.5px] text-white/45">{label}</dt>
                <dd className="tabular mt-1 text-xl font-semibold tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x mt-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/search?q=${encodeURIComponent(segment.ask)}`} className={buttonClasses("primary", "md")}>
              <Sparkles className="h-4 w-4 text-jade-300" /> Rank {segment.label.toLowerCase()} for me
            </Link>
            <Button variant="ghost" size="md" onClick={() => setRefresh((value) => value + 1)} disabled={loading} icon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />}>
              Refresh
            </Button>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-muted">
            Sort
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="h-10 rounded-full border border-line bg-surface px-4 text-[13px] font-medium text-ink outline-none focus:border-jade-400"
            >
              <option value="default">Retailer order</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </label>
        </div>

        {loading && <ProductGridSkeleton count={8} />}
        {!loading && error && (
          <StateView
            tone="danger"
            icon={<CircleAlert className="h-6 w-6" />}
            title="Market data didn't load"
            description={error}
            actions={
              <Button onClick={() => setRefresh((value) => value + 1)} icon={<RefreshCw className="h-4 w-4" />}>
                Try again
              </Button>
            }
          />
        )}
        {!loading && !error && products.length === 0 && (
          <StateView icon={<Radio className="h-6 w-6" />} title="No listings in this segment right now" description="Retailers returned nothing for this segment. Try another, or refresh in a moment." />
        )}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {sorted.map((product, index) => (
              <Reveal key={productKey(product)} index={index % 12}>
                <ProductCard product={product} candidates={products} eager={index < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Deals;

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleAlert,
  CircleCheck,
  GitCompareArrows,
  PackageX,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { getExternalProduct, getProduct, type Product, type ProductOffer } from "../services/productService";
import { ProductImage } from "../components/product/ProductImage";
import { ProductCard, Rating } from "../components/product/ProductCard";
import { StateView } from "../components/ui/StateView";
import { Skeleton } from "../components/ui/Skeleton";
import { Badge } from "../components/ui/Badge";
import { Reveal } from "../components/ui/Reveal";
import { Button, buttonClasses } from "../components/ui/Button";
import { useCart } from "../contexts/CartContext";
import { useCompare } from "../contexts/CompareContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice, formatSpecValue, humanizeKey, parsePrice } from "../utils/format";
import { getErrorMessage, getErrorStatus } from "../utils/errors";
import { bestOfferUrl, isComparable, isInStock, productKey, productRetailer } from "../utils/product";
import { cn } from "../utils/cn";

interface DetailsState {
  /** The listing as shown in search results, including ranking context. */
  product?: Product;
  /** Legacy name used by cart navigation. */
  productFallback?: Product;
  comparisonCandidates?: Product[];
}

/** Keep ranking context (rationale, verified specs) from search alongside fresh provider data. */
const mergeContext = (fresh: Product, context?: Product): Product => {
  if (!context || productKey(context) !== productKey(fresh)) return fresh;
  return {
    ...fresh,
    recommendation_badge: fresh.recommendation_badge ?? context.recommendation_badge,
    why_recommended: fresh.why_recommended ?? context.why_recommended,
    limitation: fresh.limitation ?? context.limitation,
    verified_specs: fresh.verified_specs ?? context.verified_specs,
    specifications: fresh.specifications ?? context.specifications,
    score: fresh.score ?? context.score,
    score_breakdown: fresh.score_breakdown ?? context.score_breakdown,
  };
};

const DetailsSkeleton = () => (
  <div className="grid gap-10 lg:grid-cols-2" role="status" aria-label="Loading product">
    <Skeleton className="aspect-square w-full rounded-[28px]" />
    <div className="space-y-4 pt-4">
      <Skeleton className="h-3 w-32 rounded-full" />
      <Skeleton className="h-8 w-full rounded-full" />
      <Skeleton className="h-8 w-3/4 rounded-full" />
      <Skeleton className="mt-8 h-12 w-40 rounded-full" />
      <Skeleton className="mt-6 h-40 w-full rounded-3xl" />
    </div>
  </div>
);

const ProductDetails = () => {
  const { id, productId } = useParams<{ id?: string; productId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as DetailsState | null) ?? {};
  const contextProduct = state.product ?? state.productFallback;
  const candidates = useMemo(() => (Array.isArray(state.comparisonCandidates) ? state.comparisonCandidates : []), [state.comparisonCandidates]);

  const { addToCart, isInCart } = useCart();
  const { toggle, isSelected } = useCompare();
  const [product, setProduct] = useState<Product | null>(null);
  const [usingSnapshot, setUsingSnapshot] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [reload, setReload] = useState(0);
  useDocumentTitle(product?.name ?? "Product");

  useEffect(() => {
    const requestedId = productId ?? id;
    const isExternal = Boolean(productId);
    if (!requestedId || (!isExternal && !Number.isInteger(Number(requestedId)))) {
      setError({ message: "This product link isn't valid.", notFound: true });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setUsingSnapshot(false);

    const request = isExternal ? getExternalProduct(requestedId) : getProduct(Number(requestedId));
    request
      .then((data) => {
        if (!cancelled) setProduct(mergeContext(data, contextProduct));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = getErrorStatus(err);
        // Live details expire on the backend; fall back to the listing the user just saw.
        if (isExternal && status === 404 && contextProduct?.product_id === requestedId) {
          setProduct(contextProduct);
          setUsingSnapshot(true);
          return;
        }
        setProduct(null);
        setError({
          message: getErrorMessage(err, "We couldn't load this product. Please try again."),
          notFound: status === 404,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // The context product only matters for the id being requested.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, productId, reload]);

  const offers = useMemo<ProductOffer[]>(() => {
    const list = [...(product?.offers ?? [])].sort((a, b) => (parsePrice(a.price) ?? Infinity) - (parsePrice(b.price) ?? Infinity));
    const min = list.reduce<number | null>((lowest, offer) => {
      const price = parsePrice(offer.price);
      return price == null ? lowest : lowest == null ? price : Math.min(lowest, price);
    }, null);
    return list.map((offer) => {
      const price = parsePrice(offer.price);
      return { ...offer, is_best_price: offer.is_best_price || (min != null && price != null && Math.abs(price - min) < 0.01) };
    });
  }, [product?.offers]);

  const specs = useMemo(() => {
    if (!product) return [];
    const merged = new Map<string, string>();
    for (const [key, value] of Object.entries(product.specifications ?? {})) {
      const formatted = formatSpecValue(value);
      if (formatted) merged.set(humanizeKey(key), formatted);
    }
    for (const [key, value] of Object.entries(product.verified_specs ?? {})) {
      const formatted = formatSpecValue(value);
      if (formatted && !merged.has(humanizeKey(key))) merged.set(humanizeKey(key), formatted);
    }
    return [...merged.entries()];
  }, [product]);

  const related = useMemo(
    () => (product ? candidates.filter((item) => productKey(item) !== productKey(product)).slice(0, 4) : []),
    [candidates, product],
  );

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  const startComparison = () => {
    if (!product?.product_id) return;
    if (!isSelected(product)) toggle(product, candidates);
    navigate(`/compare?product_a=${encodeURIComponent(product.product_id)}`, { state: { comparisonCandidates: candidates } });
  };

  const price = product ? formatPrice(product.price, product.currency) : null;
  const stock = product ? isInStock(product) : null;
  const buyUrl = product ? bestOfferUrl(product) : null;
  const retailer = product ? productRetailer(product) : null;
  const inCart = product ? isInCart(product) : false;

  return (
    <div className="container-x pb-24 pt-28 sm:pt-32">
      <button type="button" onClick={goBack} className="group mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
      </button>

      {loading && <DetailsSkeleton />}

      {!loading && error && (
        <StateView
          tone={error.notFound ? "neutral" : "danger"}
          icon={error.notFound ? <PackageX className="h-6 w-6" /> : <CircleAlert className="h-6 w-6" />}
          title={error.notFound ? "This listing is no longer available" : "Something went wrong"}
          description={error.message}
          actions={
            <>
              {!error.notFound && (
                <Button onClick={() => setReload((value) => value + 1)} icon={<RefreshCw className="h-4 w-4" />}>
                  Try again
                </Button>
              )}
              <Link to="/search" className={buttonClasses(error.notFound ? "primary" : "secondary")}>
                Search again
              </Link>
            </>
          }
        />
      )}

      {!loading && !error && product && (
        <>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="card rise-in overflow-hidden p-3">
                <ProductImage src={product.image} alt={product.name} eager className="aspect-square rounded-[22px]" imgClassName="p-10 sm:p-16" />
              </div>
            </div>

            <div className="rise-in" style={{ ["--rise-index" as string]: 1 }}>
              {usingSnapshot && (
                <p className="mb-6 flex gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-[13px] text-warn">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  Live details for this listing have expired, so you're seeing the information saved from your search. Search again to refresh it.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {product.recommendation_badge && (
                  <Badge tone="dark" icon={<Sparkles className="h-3 w-3 text-jade-300" />}>
                    {product.recommendation_badge}
                  </Badge>
                )}
                {product.category && <Badge tone="outline">{product.category}</Badge>}
                {product.condition && product.condition.toLowerCase() !== "new" && <Badge tone="warn">{product.condition}</Badge>}
              </div>
              <p className="eyebrow mt-5 text-faint">{[product.brand, retailer].filter(Boolean).join(" · ") || "Live listing"}</p>
              <h1 className="mt-3 text-[1.7rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[2.3rem]">{product.name}</h1>
              <Rating rating={product.rating} reviews={product.review_count} className="mt-4 text-[13px]" />

              <div className="mt-8 flex flex-wrap items-end gap-x-5 gap-y-2">
                {price ? (
                  <p className="tabular text-[2.4rem] font-semibold leading-none tracking-[-0.03em] text-ink">{price}</p>
                ) : (
                  <p className="text-lg text-faint">Price unavailable</p>
                )}
                {stock != null && (
                  <span className={cn("inline-flex items-center gap-1.5 pb-1 text-[13px] font-medium", stock ? "text-jade-700" : "text-danger")}>
                    {stock ? <CircleCheck className="h-4 w-4" /> : <PackageX className="h-4 w-4" />}
                    {stock ? "In stock" : "Out of stock"}
                  </span>
                )}
              </div>
              {offers.length > 1 && <p className="mt-2 text-[13px] text-muted">Lowest of {offers.length} retailer offers</p>}

              <div className="mt-8 flex flex-wrap gap-3">
                {buyUrl ? (
                  <a href={buyUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
                    View best offer <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="inline-flex h-13 items-center rounded-full bg-sunken px-6 text-sm text-muted">No direct purchase link available</span>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  disabled={stock === false}
                  onClick={() => addToCart(product)}
                  icon={inCart ? <Check className="h-4 w-4 text-jade-600" /> : <ShoppingBag className="h-4 w-4" />}
                >
                  {stock === false ? "Out of stock" : inCart ? "Add another" : "Add to cart"}
                </Button>
                {isComparable(product) && (
                  <Button variant="secondary" size="lg" onClick={startComparison} icon={<GitCompareArrows className="h-4 w-4" />}>
                    Compare
                  </Button>
                )}
              </div>
              {inCart && (
                <p className="pop-in mt-3 text-[13px] text-muted">
                  In your cart.{" "}
                  <Link to="/cart" className="text-jade-700 underline underline-offset-4">
                    View cart
                  </Link>
                </p>
              )}

              {(product.why_recommended || product.limitation) && (
                <div className="aurora-border mt-10 rounded-3xl bg-surface p-6">
                  <p className="eyebrow flex items-center gap-2 text-[10px] text-jade-700">
                    <Sparkles className="h-3.5 w-3.5" /> Why ShopMind picked it
                  </p>
                  {product.why_recommended && <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{product.why_recommended}</p>}
                  {product.limitation && (
                    <p className="mt-4 flex gap-2 text-[13.5px] leading-relaxed text-warn">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      {product.limitation}
                    </p>
                  )}
                  {product.score != null && <p className="tabular mt-4 font-mono text-[11px] uppercase tracking-wider text-faint">Match score {Math.round(product.score)}/100</p>}
                </div>
              )}

              {product.description && (
                <section className="mt-10">
                  <h2 className="eyebrow text-muted">Overview</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{product.description}</p>
                </section>
              )}

              {offers.length > 0 && (
                <section className="mt-10">
                  <h2 className="eyebrow text-muted">Retailer offers</h2>
                  <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                    {offers.map((offer, index) => {
                      const offerPrice = formatPrice(parsePrice(offer.price), offer.currency);
                      return (
                        <li key={`${offer.source_name ?? "offer"}-${index}`} className={cn("flex items-center gap-3 px-4 py-3.5", offer.is_best_price && "bg-jade-50/50")}>
                          <Store className="h-4 w-4 shrink-0 text-faint" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{offer.source_name ?? "Retailer"}</p>
                            {offer.is_best_price && <p className="text-[11.5px] font-medium text-jade-700">Best price</p>}
                          </div>
                          <span className="tabular text-sm font-semibold text-ink">{offerPrice ?? <span className="font-normal text-faint">Price unavailable</span>}</span>
                          {offer.product_url ? (
                            <a
                              href={offer.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 text-[12px] font-medium text-ink transition-colors hover:border-ink"
                              aria-label={`Buy from ${offer.source_name ?? "retailer"}`}
                            >
                              Buy <ArrowUpRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="w-14" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {specs.length > 0 && (
                <section className="mt-10">
                  <h2 className="eyebrow text-muted">Specifications</h2>
                  <dl className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                    {specs.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 px-4 py-3 text-sm">
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2 text-[11.5px] text-faint">Taken from the listing. Confirm critical specs with the retailer.</p>
                </section>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-24">
              <Reveal className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-muted">From the same search</p>
                  <h2 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.03em] text-ink">Worth a look alongside</h2>
                </div>
              </Reveal>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {related.map((item, index) => (
                  <Reveal key={productKey(item)} index={index}>
                    <ProductCard product={item} candidates={candidates} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default ProductDetails;

import { Link } from "react-router-dom";
import { ArrowUpRight, CircleAlert, Sparkles } from "lucide-react";
import type { Product } from "../../services/productService";
import { formatPrice, formatSpecValue, humanizeKey } from "../../utils/format";
import { bestOfferUrl, productPath, productRetailer } from "../../utils/product";
import { cn } from "../../utils/cn";
import { ProductImage } from "./ProductImage";
import { AddToCartButton, CompareToggle } from "./ProductActions";
import { Rating } from "./ProductCard";

/** Maximum points per score component, as defined by the backend decision engine. */
const SCORE_PARTS: { key: string; label: string; max: number }[] = [
  { key: "intent_relevance", label: "Fit to your request", max: 30 },
  { key: "budget_and_value", label: "Budget & value", max: 25 },
  { key: "verified_specs", label: "Verified specs", max: 25 },
  { key: "reputation", label: "Reputation", max: 15 },
  { key: "listing_quality", label: "Listing quality", max: 5 },
];

const specEntries = (product: Product, limit: number) =>
  Object.entries(product.verified_specs ?? {})
    .map(([key, value]) => [humanizeKey(key), formatSpecValue(value)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))
    .slice(0, limit);

const RankNumeral = ({ rank, className }: { rank: number; className?: string }) => (
  <span className={cn("font-display text-[2.2rem] italic leading-none text-ink/90", className)} aria-label={`Rank ${rank}`}>
    {String(rank).padStart(2, "0")}
  </span>
);

const ScoreMeter = ({ product }: { product: Product }) => {
  if (product.score == null) return null;
  const breakdown = product.score_breakdown ?? {};
  return (
    <div className="rounded-2xl border border-line bg-paper/60 p-4">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-[10px] text-muted">Match score</p>
        <p className="tabular text-sm font-semibold text-ink">
          {Math.round(product.score)}
          <span className="text-faint">/100</span>
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {SCORE_PARTS.filter((part) => breakdown[part.key] != null).map((part) => {
          const value = breakdown[part.key];
          return (
            <div key={part.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-[11.5px]">
              <span className="text-muted">{part.label}</span>
              <span className="tabular text-ink-2">
                {value}/{part.max}
              </span>
              <span className="col-span-2 h-1 overflow-hidden rounded-full bg-sunken">
                <span
                  className="block h-full origin-left rounded-full bg-aurora"
                  style={{ width: `${Math.min(100, (value / part.max) * 100)}%`, animation: "progress-sweep 1.2s var(--ease-out-expo) both" }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface RecommendationCardProps {
  product: Product;
  rank: number;
  candidates?: Product[];
}

/** The #1 pick: a wide card with the full rationale and score breakdown. */
export const FeaturedRecommendation = ({ product, rank, candidates }: RecommendationCardProps) => {
  const price = formatPrice(product.price, product.currency);
  const retailer = productRetailer(product);
  const buyUrl = bestOfferUrl(product);
  const specs = specEntries(product, 6);

  return (
    <article className="aurora-border group relative overflow-hidden rounded-[28px] bg-surface shadow-lift">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-jade-200/40 blur-3xl" aria-hidden="true" />
      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="relative p-3 sm:p-4">
          <ProductImage
            src={product.image}
            alt={product.name}
            eager
            className="aspect-square rounded-[22px] lg:aspect-auto lg:h-full lg:min-h-[420px]"
            imgClassName="p-8 sm:p-12 group-hover:scale-[1.04]"
          />
          <div className="absolute left-7 top-7 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11.5px] font-medium text-white">
              <Sparkles className="h-3.5 w-3.5 text-jade-300" />
              {product.recommendation_badge || "Top Recommendation"}
            </span>
          </div>
          <div className="absolute right-7 top-7 z-[2]">
            <CompareToggle product={product} candidates={candidates} />
          </div>
        </div>

        <div className="flex flex-col p-6 pt-3 sm:p-8 lg:pl-4 lg:pt-8">
          <div className="flex items-start gap-4">
            <RankNumeral rank={rank} className="text-[3rem] text-aurora" />
            <div className="min-w-0 pt-1">
              <p className="eyebrow truncate text-[10px] text-faint">{[product.brand, retailer].filter(Boolean).join(" · ") || "Live listing"}</p>
              <h3 className="mt-1.5 text-xl font-semibold leading-snug tracking-tight text-ink sm:text-[1.6rem]">
                <Link to={productPath(product)} state={{ product, comparisonCandidates: candidates }} className="hover:underline hover:decoration-line-strong hover:underline-offset-4">
                  {product.name}
                </Link>
              </h3>
              <Rating rating={product.rating} reviews={product.review_count} className="mt-2.5" />
            </div>
          </div>

          {product.why_recommended && (
            <div className="mt-6">
              <p className="eyebrow text-[10px] text-jade-700">Why it leads</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{product.why_recommended}</p>
            </div>
          )}
          {product.limitation && (
            <p className="mt-4 flex gap-2.5 rounded-xl bg-warn-soft/70 px-3.5 py-3 text-[13px] leading-relaxed text-warn">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{product.limitation}</span>
            </p>
          )}

          {specs.length > 0 && (
            <dl
              className={cn(
                "mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line",
                specs.length === 1 ? "grid-cols-1" : specs.length % 3 === 0 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
              )}
            >
              {specs.map(([label, value]) => (
                <div key={label} className="bg-surface px-3.5 py-3">
                  <dt className="text-[11px] text-faint">{label}</dt>
                  <dd className="mt-0.5 truncate text-[13px] font-medium text-ink" title={value}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6">
            <ScoreMeter product={product} />
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
            <div className="mr-auto">
              {price ? <p className="tabular text-[1.9rem] font-semibold tracking-tight text-ink">{price}</p> : <p className="text-sm text-faint">Price unavailable</p>}
              {retailer && <p className="text-[12px] text-muted">at {retailer}</p>}
            </div>
            <AddToCartButton product={product} className="h-11 w-11" />
            <Link
              to={productPath(product)}
              state={{ product, comparisonCandidates: candidates }}
              className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              Details
            </Link>
            {buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-jade-700"
              >
                View offer <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/** Runner-up picks (#2–#5). */
export const RecommendationCard = ({ product, rank, candidates }: RecommendationCardProps) => {
  const price = formatPrice(product.price, product.currency);
  const retailer = productRetailer(product);
  const specs = specEntries(product, 3);

  return (
    <article className="group card relative flex h-full flex-col overflow-hidden p-2 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-strong hover:shadow-lift">
      <Link
        to={productPath(product)}
        state={{ product, comparisonCandidates: candidates }}
        className="absolute inset-0 z-[1] rounded-[inherit]"
        aria-label={`View details for ${product.name}`}
      />
      <div className="relative">
        <ProductImage src={product.image} alt={product.name} eager className="aspect-[4/3.3] rounded-[14px]" imgClassName="p-6 group-hover:scale-[1.05]" />
        <RankNumeral rank={rank} className="absolute bottom-2.5 left-3.5 text-[1.9rem]" />
        <div className="absolute right-2.5 top-2.5 z-[2]">
          <CompareToggle product={product} candidates={candidates} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-2.5 pb-2 pt-3.5">
        {product.recommendation_badge && (
          <span className="mb-2.5 inline-flex w-fit items-center gap-1 rounded-full bg-jade-50 px-2 py-0.5 text-[11px] font-medium text-jade-700 ring-1 ring-inset ring-jade-200/70">
            {product.recommendation_badge}
          </span>
        )}
        <p className="eyebrow truncate text-[10px] text-faint">{[product.brand, retailer].filter(Boolean).join(" · ") || "Live listing"}</p>
        <h3 className="line-clamp-2 mt-1.5 text-[14px] font-medium leading-snug text-ink">{product.name}</h3>
        {product.why_recommended && <p className="line-clamp-3 mt-2.5 text-[12.5px] leading-relaxed text-muted">{product.why_recommended}</p>}
        {product.limitation && (
          <p className="line-clamp-2 mt-2 flex gap-1.5 text-[12px] leading-relaxed text-warn">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{product.limitation}</span>
          </p>
        )}
        {specs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {specs.map(([label, value]) => (
              <span key={label} className="max-w-full truncate rounded-md bg-sunken px-1.5 py-0.5 text-[10.5px] text-ink-2" title={`${label}: ${value}`}>
                {value}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {price ? <p className="tabular text-[17px] font-semibold tracking-tight text-ink">{price}</p> : <p className="text-[13px] text-faint">Price unavailable</p>}
            {product.score != null && <p className="tabular mt-0.5 text-[11px] text-muted">Match {Math.round(product.score)}/100</p>}
          </div>
          <div className="relative z-[2]">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
};

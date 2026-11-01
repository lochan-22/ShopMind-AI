import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "../../services/productService";
import { formatCount, formatPrice } from "../../utils/format";
import { isInStock, productPath, productRetailer } from "../../utils/product";
import { cn } from "../../utils/cn";
import { ProductImage } from "./ProductImage";
import { AddToCartButton, CompareToggle } from "./ProductActions";

interface ProductCardProps {
  product: Product;
  /** Products offered as comparison partners on the details and compare pages. */
  candidates?: Product[];
  className?: string;
  eager?: boolean;
}

export const Rating = ({ rating, reviews, className }: { rating: number | null; reviews?: number | null; className?: string }) => {
  if (rating == null || rating <= 0) return null;
  const count = formatCount(reviews);
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] text-muted", className)}>
      <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" />
      <span className="tabular font-medium text-ink-2">{rating.toFixed(1)}</span>
      {count && <span className="tabular">({count})</span>}
      <span className="sr-only">out of 5{count ? `, ${count} reviews` : ""}</span>
    </span>
  );
};

export const ProductCard = ({ product, candidates, className, eager }: ProductCardProps) => {
  const price = formatPrice(product.price, product.currency);
  const retailer = productRetailer(product);
  const outOfStock = isInStock(product) === false;
  const offerCount = product.offers?.length ?? 0;

  return (
    <article
      className={cn(
        "group card relative flex h-full flex-col overflow-hidden p-2 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-strong hover:shadow-lift",
        className,
      )}
    >
      <Link
        to={productPath(product)}
        state={{ product, comparisonCandidates: candidates }}
        className="absolute inset-0 z-[1] rounded-[inherit]"
        aria-label={`View details for ${product.name}`}
      />
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.name}
          eager={eager}
          className="aspect-[4/3.4] rounded-[14px]"
          imgClassName="p-5 group-hover:scale-[1.05]"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {product.condition && product.condition.toLowerCase() !== "new" && (
            <span className="rounded-full bg-surface/90 px-2 py-1 text-[10.5px] font-medium text-warn ring-1 ring-line backdrop-blur">
              {product.condition}
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-surface/90 px-2 py-1 text-[10.5px] font-medium text-danger ring-1 ring-line backdrop-blur">
              Out of stock
            </span>
          )}
        </div>
        <div className="absolute right-2.5 top-2.5 z-[2] opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 [&:has([aria-pressed=true])]:opacity-100">
          <CompareToggle product={product} candidates={candidates} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3.5 sm:px-2.5">
        <p className="eyebrow truncate text-[10px] text-faint">
          {[product.brand, retailer].filter(Boolean).join(" · ") || "Live listing"}
        </p>
        <h3 className="line-clamp-2 mt-1.5 text-[13.5px] font-medium leading-snug text-ink sm:text-[14.5px]">{product.name}</h3>
        <Rating rating={product.rating} reviews={product.review_count} className="mt-2" />

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="min-w-0">
            {price ? (
              <p className="tabular text-[16px] font-semibold tracking-tight text-ink sm:text-[17px]">{price}</p>
            ) : (
              <p className="text-[13px] text-faint">Price unavailable</p>
            )}
            {offerCount > 1 && <p className="mt-0.5 text-[11px] text-muted">{offerCount} offers</p>}
          </div>
          <div className="relative z-[2]">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
};

import React from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../services/productService";
import { Star, CheckCircle2, XCircle } from "lucide-react";

export interface ProductCardProps {
  product: Product;
  showDescription?: boolean;
  navigationState?: unknown;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showDescription = true,
  navigationState,
}) => {
  const navigate = useNavigate();
  const imageUrl = product.image || undefined;
  const imageAlt = product.name ?? "";
  const category = product.category ?? "";
  const brand = product.brand ?? "";
  const name = product.name ?? "";
  const description = product.description ?? "";
  const rating = product.rating ?? 0;
  const reviewCount = product.review_count ?? 0;
  const price = product.price ?? 0;
  const stockIsKnown = product.stock !== null && product.stock !== undefined;
  const inStock = product.stock === true;
  const externalProductId = product.product_id;
  const productPath = externalProductId
    ? `/products/external/${encodeURIComponent(externalProductId)}`
    : `/products/${product.id}`;
  const shopmindProductPath = product.shopmind_url ?? productPath;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(shopmindProductPath, { state: navigationState })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(shopmindProductPath, { state: navigationState });
        }
      }}
      className="group flex cursor-pointer flex-row sm:flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 p-2.5 sm:p-0"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #FDFAF7 100%)",
        borderColor: "#E8E2D9",
        boxShadow: "0 2px 8px rgba(13, 11, 30, 0.04)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "#C4B5FD";
        el.style.boxShadow =
          "0 8px 24px rgba(124, 58, 237, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "#E8E2D9";
        el.style.boxShadow = "0 2px 8px rgba(13, 11, 30, 0.04)";
      }}
    >
      {/* Product Image: 30-35% on mobile (110-130px on typical phones, ~95px on narrow phones), full width on desktop */}
      <div
        className="relative w-[32%] min-w-[95px] max-w-[130px] sm:w-full sm:max-w-none aspect-square shrink-0 overflow-hidden rounded-xl sm:rounded-none bg-[#FAF7F2] p-2 sm:p-4 flex items-center justify-center self-start sm:self-auto"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs text-[#A89F95]"
          >
            📦
          </div>
        )}

        {/* Badges */}
        {product.recommendation_badge ? (
          <span
            className="absolute left-1.5 top-1.5 sm:left-3 sm:top-3 z-10 rounded-md sm:rounded-lg px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-bold text-white shadow-xs backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A855F7)",
              boxShadow: "0 2px 6px rgba(124, 58, 237, 0.35)",
            }}
          >
            ★ {product.recommendation_badge}
          </span>
        ) : category ? (
          <span
            className="hidden sm:inline-block absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              color: "#5A5248",
              boxShadow: "0 1px 4px rgba(13, 11, 30, 0.08)",
            }}
          >
            {category}
          </span>
        ) : null}

        {/* Desktop stock status badge */}
        {stockIsKnown && inStock ? (
          <span
            className="hidden sm:inline-flex absolute right-3 top-3 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold backdrop-blur-md"
            style={{
              background: "rgba(240, 253, 244, 0.95)",
              color: "#16A34A",
            }}
          >
            <CheckCircle2 className="h-3 w-3" />
            In Stock
          </span>
        ) : stockIsKnown ? (
          <span
            className="hidden sm:inline-flex absolute right-3 top-3 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold backdrop-blur-md"
            style={{
              background: "rgba(254, 242, 242, 0.95)",
              color: "#DC2626",
            }}
          >
            <XCircle className="h-3 w-3" />
            Out of Stock
          </span>
        ) : null}
      </div>

      {/* Product Information: 65-70% on mobile, full width on desktop */}
      <div className="flex flex-1 flex-col justify-between pl-3 sm:pl-0 sm:p-5 min-w-0">
        <div>
          {/* Brand */}
          {brand && (
            <p
              className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate"
              style={{ color: "#7C3AED" }}
            >
              {brand}
            </p>
          )}

          {/* Product Title (2-3 lines clamp) */}
          <h3
            className="mt-0.5 sm:mt-1 line-clamp-2 text-xs sm:text-sm font-semibold leading-snug transition-colors group-hover:text-purple-700"
            style={{ color: "#0D0B1E" }}
            title={name}
          >
            {name}
          </h3>

          {/* Description (desktop only) */}
          {showDescription && description && (
            <p
              className="hidden sm:block mt-1.5 line-clamp-2 text-xs leading-relaxed"
              style={{ color: "#7A7068" }}
            >
              {description}
            </p>
          )}

          {/* Rating and review count */}
          {(rating > 0 || reviewCount > 0) && (
            <div className="mt-1 sm:mt-2.5 flex items-center gap-1.5 flex-wrap">
              {rating > 0 && (
                <div
                  className="inline-flex items-center gap-1 rounded-md sm:rounded-lg px-1.5 py-0.5"
                  style={{ background: "#FFF7ED" }}
                >
                  <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-orange-400 text-orange-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold" style={{ color: "#EA580C" }}>
                    {rating}
                  </span>
                </div>
              )}
              {reviewCount > 0 && (
                <span className="text-[10px] sm:text-xs" style={{ color: "#A89F95" }}>
                  ({reviewCount.toLocaleString("en-IN")})
                </span>
              )}
            </div>
          )}

          {/* Verified specs chips if present */}
          {product.verified_specs && Object.keys(product.verified_specs).length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {Object.entries(product.verified_specs).slice(0, 3).map(([key, val]) => (
                <span
                  key={key}
                  className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-100"
                >
                  {val}
                </span>
              ))}
            </div>
          )}

          {/* AI Grounded Reason & Limitation */}
          {product.why_recommended && (
            <div className="mt-2 rounded-lg bg-[#F5F3FF] p-2 border border-[#DDD6FE]/60 text-left">
              <p className="text-[11px] font-medium leading-snug text-[#6D28D9]">
                <span className="font-bold">Why recommended:</span> {product.why_recommended}
              </p>
              {product.limitation && (
                <p className="mt-1 text-[10px] text-[#7A7068] leading-snug border-t border-purple-100/60 pt-1">
                  <span className="font-semibold text-[#B45309]">Limitation:</span> {product.limitation}
                </p>
              )}
            </div>
          )}

          {/* Price and availability */}
          <div className="mt-1 sm:mt-3 flex items-center justify-between gap-1.5 flex-wrap">
            <span className="text-sm sm:text-lg font-bold" style={{ color: "#0D0B1E" }}>
              {price == null ? "Price unavailable" : `₹${price.toLocaleString("en-IN")}`}
            </span>

            {/* Mobile stock availability */}
            {stockIsKnown && (
              <span
                className={`sm:hidden inline-flex items-center gap-1 text-[10px] font-semibold ${
                  inStock ? "text-[#16A34A]" : "text-[#DC2626]"
                }`}
              >
                {inStock ? (
                  <>
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>In Stock</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-2.5 w-2.5" />
                    <span>Out of Stock</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Compact, full-width View Product button */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigate(shopmindProductPath, { state: navigationState });
          }}
          className="mt-2 sm:mt-4 w-full rounded-lg sm:rounded-xl py-1.5 sm:py-2.5 text-center text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
          }}
        >
          View Product →
        </button>
      </div>
    </div>
  );
};

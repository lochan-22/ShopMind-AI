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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #FDFAF7 100%)",
        borderColor: "#E8E2D9",
        boxShadow: "0 2px 8px rgba(13, 11, 30, 0.05)",
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
        el.style.boxShadow = "0 2px 8px rgba(13, 11, 30, 0.05)";
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ backgroundColor: "#F8F5F0" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs"
            style={{ color: "#A89F95" }}
          >
            No Image
          </div>
        )}
        {product.recommendation_badge ? (
          <span
            className="absolute left-3 top-3 z-10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A855F7)",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.35)",
            }}
          >
            ★ {product.recommendation_badge}
          </span>
        ) : category ? (
          <span
            className="absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              color: "#5A5248",
              boxShadow: "0 1px 4px rgba(13, 11, 30, 0.08)",
            }}
          >
            {category}
          </span>
        ) : null}
        {stockIsKnown && inStock ? (
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold backdrop-blur-md"
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
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold backdrop-blur-md"
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

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "#7C3AED" }}
        >
          {brand}
        </p>
        <h3
          className="mt-1 line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-purple-700"
          style={{ color: "#0D0B1E" }}
        >
          {name}
        </h3>

        {showDescription && description && (
          <p
            className="mt-1.5 line-clamp-2 text-xs leading-relaxed"
            style={{ color: "#7A7068" }}
          >
            {description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {rating > 0 && (
            <div
              className="flex items-center gap-1 rounded-lg px-2 py-0.5"
              style={{ background: "#FFF7ED" }}
            >
              <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
              <span className="text-xs font-bold" style={{ color: "#EA580C" }}>
                {rating}
              </span>
            </div>
          )}
          {reviewCount > 0 && (
            <span className="text-xs" style={{ color: "#A89F95" }}>
              ({reviewCount.toLocaleString("en-IN")})
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-base sm:text-lg font-bold" style={{ color: "#0D0B1E" }}>
            {price == null ? "Price unavailable" : `₹${price.toLocaleString("en-IN")}`}
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigate(shopmindProductPath, { state: navigationState });
          }}
          className="mt-4 w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            boxShadow: "0 3px 10px rgba(124, 58, 237, 0.30)",
          }}
        >
          View Product →
        </button>
      </div>
    </div>
  );
};

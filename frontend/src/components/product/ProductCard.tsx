import React from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../services/productService";
import { Star, CheckCircle2, XCircle } from "lucide-react";

export interface ProductCardProps {
  product: Product;
  showDescription?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showDescription = true }) => {
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
  const inStock = product.stock ?? false;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/products/${product.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/products/${product.id}`);
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
    alt={imageAlt}
    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            No Image
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
          {category}
        </span>
        {inStock ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-3 w-3" />
            In Stock
          </span>
        ) : (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-600 shadow-sm">
            <XCircle className="h-3 w-3" />
            Out of Stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
          {brand}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
          {name}
        </h3>

        {showDescription && (
          <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{description}</p>
        )}

        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-amber-700">
              {rating}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            ({reviewCount.toLocaleString("en-IN")})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-300/30 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

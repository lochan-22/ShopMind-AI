import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, GitCompareArrows, X } from "lucide-react";
import { MAX_COMPARE, useCompare } from "../../contexts/CompareContext";
import { productKey } from "../../utils/product";
import { ProductImage } from "./ProductImage";

/** Floating tray that collects up to two products and launches a comparison. */
export const CompareTray = () => {
  const { selected, candidates, remove, clear } = useCompare();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (selected.length === 0 || pathname === "/compare" || pathname === "/agent") return null;
  const ready = selected.length === MAX_COMPARE;

  const launch = () => {
    const [a, b] = selected;
    if (!a?.product_id) return;
    const params = new URLSearchParams({ product_a: a.product_id });
    if (b?.product_id) params.set("product_b", b.product_id);
    navigate(`/compare?${params.toString()}`, {
      state: { comparisonCandidates: candidates.length ? candidates : selected },
    });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-start px-3 sm:justify-center sm:px-4">
      <div
        className="slide-up pointer-events-auto flex w-[calc(100%-4.5rem)] max-w-md items-center gap-2 rounded-full border border-white/10 bg-night/95 p-1.5 pl-3 text-white shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl sm:w-auto sm:max-w-none sm:gap-3 sm:pl-4"
        role="region"
        aria-label="Comparison tray"
      >
        <GitCompareArrows className="hidden h-4 w-4 text-jade-300 sm:block" />
        <div className="flex items-center -space-x-2">
          {Array.from({ length: MAX_COMPARE }, (_, index) => {
            const product = selected[index];
            return product ? (
              <div key={productKey(product)} className="pop-in group relative">
                <ProductImage src={product.image} alt={product.name} className="h-9 w-9 rounded-full bg-white ring-2 ring-night" imgClassName="p-1" />
                <button
                  type="button"
                  onClick={() => remove(product)}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-white text-ink group-hover:flex focus-visible:flex"
                  aria-label={`Remove ${product.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ) : (
              <div key={`empty-${index}`} className="h-9 w-9 rounded-full border border-dashed border-white/25 bg-white/5 ring-2 ring-night" />
            );
          })}
        </div>
        <p className="min-w-0 flex-1 truncate text-[13px] text-white/75 sm:flex-none">
          {ready ? "Ready to compare" : "Pick one more product"}
        </p>
        <button type="button" onClick={clear} className="hidden rounded-full px-2.5 py-2 text-[12px] text-white/55 transition-colors hover:text-white sm:block">
          Clear
        </button>
        <button
          type="button"
          onClick={launch}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-jade-100"
        >
          {ready ? "Compare" : "Choose"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

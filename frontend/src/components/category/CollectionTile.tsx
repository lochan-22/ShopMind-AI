import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { MainCategory } from "../../data/categoryData";
import { cn } from "../../utils/cn";
import { getMainVisual, getSubIcon } from "./categoryVisuals";

interface CollectionTileProps {
  category: MainCategory;
  size?: "default" | "large";
  className?: string;
}

/**
 * A collection card: soft two-tone artwork, a large line icon and a fan of
 * subcategory glyphs that spreads apart on hover.
 */
export const CollectionTile = ({ category, size = "default", className }: CollectionTileProps) => {
  const visual = getMainVisual(category.slug);
  const Icon = visual.icon;
  const preview = category.subcategories.slice(0, 3);
  const large = size === "large";

  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-surface p-2 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-strong hover:shadow-lift",
        className,
      )}
    >
      <div
        className={cn("relative overflow-hidden rounded-[20px]", large ? "min-h-[15rem] flex-1 sm:min-h-[18rem]" : "h-40 sm:h-44")}
        style={{ background: `linear-gradient(140deg, ${visual.from}, ${visual.to})` }}
      >
        <div className="dot-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/50 blur-2xl transition-transform duration-700 group-hover:scale-125" aria-hidden="true" />
        <Icon
          className={cn(
            "absolute text-ink/80 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-6 group-hover:scale-110",
            large ? "bottom-8 right-8 h-24 w-24 sm:h-28 sm:w-28" : "bottom-5 right-5 h-16 w-16",
          )}
          strokeWidth={1}
          aria-hidden="true"
        />
        <div className="absolute left-4 top-4 flex gap-1.5" aria-hidden="true">
          {preview.map((sub, index) => {
            const SubIcon = getSubIcon(sub.slug, category.slug);
            return (
              <span
                key={sub.slug}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/75 text-ink-2 shadow-sm backdrop-blur transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
                style={{ transform: `translateX(${-index * 6}px)`, transitionDelay: `${index * 40}ms` }}
              >
                <SubIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            );
          })}
        </div>
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white opacity-0 transition-[opacity,transform] duration-500 group-hover:opacity-100 group-hover:rotate-0 sm:-rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3 px-3 pb-2.5 pt-4">
        <div className="min-w-0">
          <h3 className={cn("font-semibold tracking-tight text-ink", large ? "text-xl" : "text-[15.5px]")}>{category.label}</h3>
          <p className="line-clamp-2 mt-1 text-[13px] leading-relaxed text-muted">{category.description}</p>
        </div>
        <span className="tabular shrink-0 font-mono text-[11px] text-faint">{String(category.subcategories.length).padStart(2, "0")}</span>
      </div>
    </Link>
  );
};

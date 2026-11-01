import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { MAIN_CATEGORIES } from "../data/categoryData";
import { CollectionTile } from "../components/category/CollectionTile";
import { getSubIcon } from "../components/category/categoryVisuals";
import { Reveal } from "../components/ui/Reveal";
import { Accent } from "../components/ui/SectionHeading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const Categories = () => {
  useDocumentTitle("Collections");
  const [filter, setFilter] = useState("");
  const term = filter.trim().toLowerCase();

  /** Aisles matching the filter, across every collection. */
  const matches = useMemo(() => {
    if (!term) return [];
    return MAIN_CATEGORIES.flatMap((main) =>
      main.subcategories.filter((sub) => sub.label.toLowerCase().includes(term)).map((sub) => ({ main, sub })),
    );
  }, [term]);

  const collections = term
    ? MAIN_CATEGORIES.filter((main) => main.label.toLowerCase().includes(term) || main.description.toLowerCase().includes(term))
    : MAIN_CATEGORIES;
  const aisleCount = MAIN_CATEGORIES.reduce((total, main) => total + main.subcategories.length, 0);

  return (
    <div className="pb-24">
      <section className="container-x pt-32 sm:pt-40">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="rise-in max-w-2xl">
            <p className="eyebrow text-muted">Collections</p>
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[4rem]">
              Discover <Accent>curated</Accent> collections
            </h1>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-muted">
              {MAIN_CATEGORIES.length} collections and {aisleCount} focused aisles. Open any aisle for live listings, or ask ShopMind to rank the best of it.
            </p>
          </div>
          <label className="rise-in flex h-12 w-full items-center gap-3 rounded-full border border-line bg-surface px-4 focus-within:border-jade-300 lg:w-80" style={{ ["--rise-index" as string]: 1 }}>
            <Search className="h-4 w-4 text-faint" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter collections and aisles"
              aria-label="Filter collections and aisles"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint"
            />
          </label>
        </div>
      </section>

      {matches.length > 0 && (
        <section className="container-x mt-12">
          <p className="eyebrow mb-4 text-[10px] text-muted">Matching aisles</p>
          <div className="flex flex-wrap gap-2">
            {matches.map(({ main, sub }) => {
              const Icon = getSubIcon(sub.slug, main.slug);
              return (
                <Link
                  key={`${main.slug}/${sub.slug}`}
                  to={`/categories/${main.slug}/${sub.slug}`}
                  className="pop-in group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-2 pl-2 pr-4 text-[13px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sunken">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {sub.label}
                  <span className="text-faint">in {main.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-faint group-hover:text-ink" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-x mt-12">
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((category, index) => (
              <Reveal key={category.slug} index={index % 6} variant="scale">
                <CollectionTile category={category} />
              </Reveal>
            ))}
          </div>
        ) : (
          matches.length === 0 && <p className="py-16 text-center text-sm text-muted">No collections or aisles match “{filter}”.</p>
        )}
      </section>
    </div>
  );
};

export default Categories;

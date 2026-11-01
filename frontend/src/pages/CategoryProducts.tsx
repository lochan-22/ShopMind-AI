import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, Compass, PackageSearch, RefreshCw, Sparkles } from "lucide-react";
import { findMainCategory, findSubCategory } from "../data/categoryData";
import { searchProducts, type Product } from "../services/productService";
import { getMainVisual, getSubIcon } from "../components/category/categoryVisuals";
import { ProductCard } from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { StateView } from "../components/ui/StateView";
import { Reveal } from "../components/ui/Reveal";
import { Button, buttonClasses } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/errors";
import { productKey } from "../utils/product";
import { cn } from "../utils/cn";

type SortKey = "default" | "price_asc" | "price_desc" | "rating";
const PAGE_SIZE = 16;

/** Session cache so moving between a product and its aisle doesn't refetch. */
const aisleCache = new Map<string, Product[]>();

const CategoryProducts = () => {
  const { mainCategory = "", subCategory = "" } = useParams<{ mainCategory: string; subCategory: string }>();
  const main = findMainCategory(mainCategory);
  const sub = findSubCategory(mainCategory, subCategory);
  useDocumentTitle(sub?.label ?? "Collection");

  const cacheKey = sub?.searchQuery ?? "";
  const [products, setProducts] = useState<Product[]>(() => aisleCache.get(cacheKey) ?? []);
  const [loading, setLoading] = useState(() => Boolean(sub) && !aisleCache.has(cacheKey));
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!sub) return;
    setVisible(PAGE_SIZE);
    const cached = aisleCache.get(sub.searchQuery);
    if (cached && reload === 0) {
      setProducts(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchProducts(sub.searchQuery)
      .then((data) => {
        if (cancelled) return;
        aisleCache.set(sub.searchQuery, data);
        setProducts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, "Live listings for this aisle are unavailable right now."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sub, reload]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sortBy === "price_asc") list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sortBy === "price_desc") list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sortBy === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [products, sortBy]);

  if (!main || !sub) {
    return (
      <div className="container-x pb-24 pt-32">
        <StateView
          icon={<Compass className="h-6 w-6" />}
          title="We couldn't find that aisle"
          description="The link may be out of date."
          actions={
            <Link to={main ? `/categories/${main.slug}` : "/categories"} className={buttonClasses()}>
              {main ? `Back to ${main.label}` : "View all collections"}
            </Link>
          }
        />
      </div>
    );
  }

  const visual = getMainVisual(main.slug);
  const Icon = getSubIcon(sub.slug, main.slug);
  const askQuery = `Best ${sub.label.toLowerCase()} to buy right now`;

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-surface/50 pb-10 pt-28 sm:pt-32">
        <div className="container-x">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link to="/categories" className="hover:text-ink">
              Collections
            </Link>
            <span className="text-faint">/</span>
            <Link to={`/categories/${main.slug}`} className="inline-flex items-center gap-1 hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5 sm:hidden" /> {main.label}
            </Link>
          </nav>
          <div className="rise-in mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] text-ink sm:h-20 sm:w-20" style={{ background: `linear-gradient(140deg, ${visual.from}, ${visual.to})` }}>
                <Icon className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.4} />
              </span>
              <div>
                <h1 className="text-[2.1rem] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[3rem]">{sub.label}</h1>
                <p className="mt-1 text-sm text-muted">Live listings from Google Shopping, in retailer order.</p>
              </div>
            </div>
            <Link to={`/search?q=${encodeURIComponent(askQuery)}`} className={buttonClasses("primary", "lg")}>
              <Sparkles className="h-4 w-4 text-jade-300" /> Rank the top 5 for me
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x mt-10">
        {loading && <ProductGridSkeleton count={8} />}

        {!loading && error && (
          <StateView
            tone="danger"
            icon={<CircleAlert className="h-6 w-6" />}
            title="Listings didn't load"
            description={error}
            actions={
              <Button onClick={() => setReload((value) => value + 1)} icon={<RefreshCw className="h-4 w-4" />}>
                Try again
              </Button>
            }
          />
        )}

        {!loading && !error && products.length === 0 && (
          <StateView
            icon={<PackageSearch className="h-6 w-6" />}
            title="No live listings right now"
            description="Retailers didn't return products for this aisle. Try asking ShopMind instead."
            actions={
              <Link to={`/search?q=${encodeURIComponent(askQuery)}`} className={buttonClasses()}>
                Ask ShopMind
              </Link>
            }
          />
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="tabular text-sm text-muted">{products.length} live listings</p>
              <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                {(
                  [
                    ["default", "Retailer order"],
                    ["price_asc", "Lowest price"],
                    ["price_desc", "Highest price"],
                    ["rating", "Top rated"],
                  ] as [SortKey, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={sortBy === value}
                    onClick={() => setSortBy(value)}
                    className={cn(
                      "shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors",
                      sortBy === value ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-line-strong",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {sorted.slice(0, visible).map((product, index) => (
                <Reveal key={productKey(product)} index={index % PAGE_SIZE}>
                  <ProductCard product={product} candidates={products} eager={index < 4} />
                </Reveal>
              ))}
            </div>
            {visible < sorted.length && (
              <div className="mt-10 flex justify-center">
                <Button variant="secondary" size="lg" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                  Show more <span className="tabular text-faint">({sorted.length - visible})</span>
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default CategoryProducts;

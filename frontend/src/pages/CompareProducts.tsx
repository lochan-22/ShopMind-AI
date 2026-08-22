import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, GitCompare, Loader2, Search } from "lucide-react";
import Navbar from "../components/common/Navbar";
import {
  compareProducts,
  searchProducts,
  type ComparisonProduct,
  type Product,
  type ProductComparison,
} from "../services/productService";

const indianRupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatPrice = (price: number | null): string => (
  price == null ? "Not available" : indianRupeeFormatter.format(price)
);

const availabilityLabel = (availability: boolean | null): string => {
  if (availability === true) return "In Stock";
  if (availability === false) return "Out of Stock";
  return "Availability unknown";
};

const ProductSummary: React.FC<{ product: ComparisonProduct; isPick: boolean; lowerPrice: boolean }> = ({
  product,
  isPick,
  lowerPrice,
}) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    {product.image ? (
      <img src={product.image} alt={product.name} className="aspect-square w-full rounded-2xl object-cover" />
    ) : (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">No Image</div>
    )}
    <div className="mt-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-500">{product.brand ?? "Brand unavailable"}</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h2>
      </div>
      {isPick && <span className="shrink-0 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">ShopMind Pick</span>}
    </div>
    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
      <div><dt className="text-slate-500">Current price</dt><dd className="mt-1 font-semibold text-slate-900">{formatPrice(product.current_price)}</dd></div>
      <div><dt className="text-slate-500">Best price</dt><dd className={`mt-1 font-semibold ${lowerPrice ? "text-emerald-700" : "text-slate-900"}`}>{formatPrice(product.best_price)}</dd></div>
      <div><dt className="text-slate-500">Rating</dt><dd className="mt-1 font-semibold text-slate-900">{product.rating ?? "Not available"}</dd></div>
      <div><dt className="text-slate-500">Reviews</dt><dd className="mt-1 font-semibold text-slate-900">{product.review_count?.toLocaleString("en-IN") ?? "Not available"}</dd></div>
      <div><dt className="text-slate-500">Availability</dt><dd className="mt-1 font-semibold text-slate-900">{availabilityLabel(product.availability)}</dd></div>
      <div><dt className="text-slate-500">Retailer offers</dt><dd className="mt-1 font-semibold text-slate-900">{product.offer_count}</dd></div>
      <div className="col-span-2"><dt className="text-slate-500">Best retailer</dt><dd className="mt-1 font-semibold text-slate-900">{product.best_retailer ?? "Not available"}</dd></div>
    </dl>
    {product.product_url && (
      <a href={product.product_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800">Buy best offer</a>
    )}
  </article>
);

const OfferList: React.FC<{ product: ComparisonProduct }> = ({ product }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">{product.name} offers</h3>
    <div className="mt-3 space-y-2">
      {product.offers.length === 0 && <p className="text-sm text-slate-500">No offers available.</p>}
      {product.offers.map((offer, index) => (
        <div key={`${offer.retailer ?? "offer"}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
          <span className="min-w-0 text-sm font-medium text-slate-800">
            {offer.retailer ?? "Retailer"}
            {offer.is_best_price && <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">Best Price</span>}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{formatPrice(offer.price)}</span>
            {offer.product_url && <a href={offer.product_url} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Buy</a>}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const CompareProducts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const productAId = searchParams.get("product_a") ?? "";
  const productBId = searchParams.get("product_b") ?? "";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSearchResults = Array.isArray(
    (location.state as { comparisonCandidates?: Product[] } | null)?.comparisonCandidates,
  )
    ? (location.state as { comparisonCandidates: Product[] }).comparisonCandidates
    : [];

  const selectionMode = Boolean(productAId) && !productBId;
  const currentResultCandidates = currentSearchResults.filter(
    (product) => product.product_id && product.product_id !== productAId,
  );

  const selectProductB = (product: Product) => {
    if (!product.product_id || product.product_id === productAId) return;
    navigate(
      `/compare?product_a=${encodeURIComponent(productAId)}&product_b=${encodeURIComponent(product.product_id)}`,
    );
  };

  useEffect(() => {
    if (!productAId || !productBId || productAId === productBId) return;
    const loadComparison = async () => {
      setLoading(true);
      setError(null);
      try {
        setComparison(await compareProducts(productAId, productBId));
      } catch {
        setError("Failed to load the live product comparison. Search again and try once more.");
      } finally {
        setLoading(false);
      }
    };
    void loadComparison();
  }, [productAId, productBId]);

  const findProducts = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchProducts(query.trim()));
    } catch {
      setError("Failed to search live products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const specificationKeys = useMemo(() => {
    if (!comparison) return [];
    return Array.from(new Set([
      ...Object.keys(comparison.product_a.specifications),
      ...Object.keys(comparison.product_b.specifications),
    ])).sort();
  }, [comparison]);

  if (!productAId) {
    return <div className="min-h-screen bg-slate-50"><Navbar /><main className="mx-auto max-w-3xl px-4 py-16 text-center"><GitCompare className="mx-auto h-10 w-10 text-indigo-600" /><h1 className="mt-4 text-2xl font-bold text-slate-900">Choose a product to compare</h1><p className="mt-2 text-slate-500">Open a live product and select Compare to begin.</p></main></div>;
  }

  if (productAId === productBId) {
    return <div className="min-h-screen bg-slate-50"><Navbar /><main className="mx-auto max-w-3xl px-4 py-16 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-2xl font-bold text-slate-900">Choose a different product</h1><p className="mt-2 text-slate-500">A product cannot be compared with itself.</p></main></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Back</button>
        {selectionMode && (
          <section className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <GitCompare className="h-8 w-8 text-indigo-600" /><h1 className="mt-3 text-2xl font-bold text-slate-900">Choose a second live product</h1><p className="mt-2 text-slate-500">Search results stay live. Select one product to compare against your first choice.</p>
            <form onSubmit={findProducts} className="mt-6 flex gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Search any product to compare..." /><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white"><Search className="h-4 w-4" />Search</button></form>
            {currentResultCandidates.length > 0 && <><div className="my-6 flex items-center gap-3 text-sm font-medium text-slate-500"><span className="h-px flex-1 bg-slate-200" />OR choose from current results<span className="h-px flex-1 bg-slate-200" /></div><div className="grid gap-3 sm:grid-cols-2">{currentResultCandidates.map((product) => (
              <button key={product.product_id} type="button" onClick={() => selectProductB(product)} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50">
                {product.image ? <img src={product.image} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <div className="h-16 w-16 rounded-xl bg-slate-100" />}
                <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{product.name}</span><span className="mt-1 block text-sm text-slate-500">{formatPrice(product.price)}</span></span>
              </button>
            ))}</div></>}
            {loading && <div className="mt-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>}
            {error && <p className="mt-5 text-sm text-rose-600">{error}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {results.filter((product) => product.product_id !== productAId).map((product) => (
                <button key={product.product_id ?? product.id} type="button" onClick={() => selectProductB(product)} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50">
                  {product.image ? <img src={product.image} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <div className="h-16 w-16 rounded-xl bg-slate-100" />}
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{product.name}</span><span className="mt-1 block text-sm text-slate-500">{formatPrice(product.price)}</span></span>
                </button>
              ))}
            </div>
          </section>
        )}
        {!selectionMode && loading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}
        {!selectionMode && error && <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">{error}</div>}
        {!selectionMode && comparison && (
          <>
            <header className="mb-8 text-center"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Live product comparison</p><h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{comparison.product_a.name} <span className="mx-2 text-indigo-500">VS</span> {comparison.product_b.name}</h1></header>
            <section className="grid gap-6 lg:grid-cols-2"><ProductSummary product={comparison.product_a} isPick={comparison.shopmind_pick_product_id === comparison.product_a.product_id} lowerPrice={comparison.product_a.best_price != null && comparison.product_b.best_price != null && comparison.product_a.best_price < comparison.product_b.best_price} /><ProductSummary product={comparison.product_b} isPick={comparison.shopmind_pick_product_id === comparison.product_b.product_id} lowerPrice={comparison.product_a.best_price != null && comparison.product_b.best_price != null && comparison.product_b.best_price < comparison.product_a.best_price} /></section>
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">ShopMind comparison summary</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{comparison.insights.map((insight) => <div key={insight.label} className="rounded-xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">{insight.label}</p><p className="mt-1 text-sm text-slate-600">{insight.message}</p></div>)}</div><p className="mt-4 text-sm font-medium text-indigo-700">{comparison.recommendation}</p>{comparison.price_difference != null && <p className="mt-2 text-sm text-slate-600">Best-price difference: <span className="font-semibold text-slate-900">{formatPrice(comparison.price_difference)}</span></p>}</section>
            {specificationKeys.length > 0 && <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><h2 className="px-6 py-5 text-xl font-semibold text-slate-900">Available specifications</h2><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="px-6 py-3 font-medium">Specification</th><th className="px-6 py-3 font-medium">Product A</th><th className="px-6 py-3 font-medium">Product B</th></tr></thead><tbody className="divide-y divide-slate-100">{specificationKeys.map((key) => <tr key={key}><th className="px-6 py-3 text-left font-medium text-slate-800">{key}</th><td className="px-6 py-3 text-slate-600">{comparison.product_a.specifications[key] ?? "Not available"}</td><td className="px-6 py-3 text-slate-600">{comparison.product_b.specifications[key] ?? "Not available"}</td></tr>)}</tbody></table></div></section>}
            <section className="mt-6 grid gap-6 lg:grid-cols-2"><OfferList product={comparison.product_a} /><OfferList product={comparison.product_b} /></section>
          </>
        )}
      </main>
    </div>
  );
};

export default CompareProducts;

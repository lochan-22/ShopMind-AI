import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, GitCompare, Loader2, Search, CheckCircle2 } from "lucide-react";
import Navbar from "../components/common/Navbar";
import PageBackground from "../components/common/PageBackground";
import ShopMindText from "../components/common/ShopMindText";
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

const formatPrice = (price: number | null): string =>
  price == null ? "Not available" : indianRupeeFormatter.format(price);

const availabilityLabel = (availability: boolean | null): string => {
  if (availability === true) return "In Stock";
  if (availability === false) return "Out of Stock";
  return "Availability unknown";
};

const ProductSummary: React.FC<{
  product: ComparisonProduct;
  isPick: boolean;
  lowerPrice: boolean;
}> = ({ product, isPick, lowerPrice }) => (
  <article
    className="rounded-3xl border p-5 sm:p-7 transition-all"
    style={{
      background: "linear-gradient(135deg, #FFFFFF 0%, #FDFAF7 100%)",
      borderColor: isPick ? "#C4B5FD" : "#E8E2D9",
      boxShadow: isPick
        ? "0 12px 36px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.1)"
        : "0 4px 16px rgba(13, 11, 30, 0.05)",
    }}
  >
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "#E8E2D9", background: "#F8F5F0" }}
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div
          className="flex aspect-square w-full items-center justify-center text-sm"
          style={{ color: "#A89F95" }}
        >
          No Image
        </div>
      )}
    </div>
    <div className="mt-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
          {product.brand ?? "Brand unavailable"}
        </p>
        <h2 className="mt-1 text-base sm:text-lg font-bold" style={{ color: "#0D0B1E" }}>
          {product.name}
        </h2>
      </div>
      {isPick && (
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
          style={{ background: "#EDE9FE", color: "#7C3AED" }}
        >
          <ShopMindText showAi={false} /> Pick
        </span>
      )}
    </div>
    <dl
      className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t pt-4 text-xs sm:text-sm"
      style={{ borderColor: "#E8E2D9" }}
    >
      <div>
        <dt style={{ color: "#7A7068" }}>Current price</dt>
        <dd className="mt-1 font-bold" style={{ color: "#0D0B1E" }}>
          {formatPrice(product.current_price)}
        </dd>
      </div>
      <div>
        <dt style={{ color: "#7A7068" }}>Best price</dt>
        <dd
          className="mt-1 font-bold"
          style={{ color: lowerPrice ? "#16A34A" : "#0D0B1E" }}
        >
          {formatPrice(product.best_price)}
        </dd>
      </div>
      <div>
        <dt style={{ color: "#7A7068" }}>Rating</dt>
        <dd className="mt-1 font-bold" style={{ color: "#0D0B1E" }}>
          {product.rating ?? "Not available"}
        </dd>
      </div>
      <div>
        <dt style={{ color: "#7A7068" }}>Reviews</dt>
        <dd className="mt-1 font-bold" style={{ color: "#0D0B1E" }}>
          {product.review_count?.toLocaleString("en-IN") ?? "Not available"}
        </dd>
      </div>
      <div>
        <dt style={{ color: "#7A7068" }}>Availability</dt>
        <dd className="mt-1 font-semibold" style={{ color: product.availability ? "#16A34A" : "#DC2626" }}>
          {availabilityLabel(product.availability)}
        </dd>
      </div>
      <div>
        <dt style={{ color: "#7A7068" }}>Retailer offers</dt>
        <dd className="mt-1 font-bold" style={{ color: "#0D0B1E" }}>
          {product.offer_count}
        </dd>
      </div>
      <div className="col-span-2">
        <dt style={{ color: "#7A7068" }}>Best retailer</dt>
        <dd className="mt-1 font-bold" style={{ color: "#0D0B1E" }}>
          {product.best_retailer ?? "Not available"}
        </dd>
      </div>
    </dl>
    {product.product_url && (
      <a
        href={product.product_url}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px"
        style={{
          background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.30)",
        }}
      >
        Buy best offer
      </a>
    )}
  </article>
);

const OfferList: React.FC<{ product: ComparisonProduct }> = ({ product }) => (
  <section
    className="rounded-3xl border p-6 sm:p-7"
    style={{
      background: "linear-gradient(135deg, #FFFFFF 0%, #FDFAF7 100%)",
      borderColor: "#E8E2D9",
      boxShadow: "0 4px 16px rgba(13, 11, 30, 0.04)",
    }}
  >
    <h3 className="text-base sm:text-lg font-bold" style={{ color: "#0D0B1E" }}>
      {product.name} offers
    </h3>
    <div className="mt-4 space-y-2.5">
      {product.offers.length === 0 && (
        <p className="text-sm" style={{ color: "#7A7068" }}>
          No offers available.
        </p>
      )}
      {product.offers.map((offer, index) => (
        <div
          key={`${offer.retailer ?? "offer"}-${index}`}
          className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
          style={{
            background: offer.is_best_price ? "#F0FDF4" : "#FFFFFF",
            borderColor: offer.is_best_price ? "#86EFAC" : "#E8E2D9",
          }}
        >
          <span className="min-w-0 text-sm font-semibold" style={{ color: "#0D0B1E" }}>
            {offer.retailer ?? "Retailer"}
            {offer.is_best_price && (
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: "#16A34A", color: "#FFFFFF" }}
              >
                Best Price
              </span>
            )}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-bold" style={{ color: "#0D0B1E" }}>
              {formatPrice(offer.price)}
            </span>
            {offer.product_url && (
              <a
                href={offer.product_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                }}
              >
                Buy
              </a>
            )}
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
    return Array.from(
      new Set([
        ...Object.keys(comparison.product_a.specifications),
        ...Object.keys(comparison.product_b.specifications),
      ]),
    ).sort();
  }, [comparison]);

  if (!productAId) {
    return (
      <PageBackground>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)" }}
          >
            <GitCompare className="h-8 w-8" style={{ color: "#7C3AED" }} />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-bold" style={{ color: "#0D0B1E" }}>
            Choose a product to compare
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#7A7068" }}>
            Open any live product and click Compare to begin side-by-side analysis.
          </p>
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
          >
            Browse Categories
          </button>
        </main>
      </PageBackground>
    );
  }

  if (productAId === productBId) {
    return (
      <PageBackground>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "#FFF5F5" }}
          >
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-bold" style={{ color: "#0D0B1E" }}>
            Choose a different product
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#7A7068" }}>
            A product cannot be compared against itself.
          </p>
        </main>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-px"
          style={{
            background: "#FFFFFF",
            borderColor: "#E8E2D9",
            color: "#5A5248",
            boxShadow: "0 1px 4px rgba(13, 11, 30, 0.05)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {selectionMode && (
          <section
            className="mx-auto max-w-7xl rounded-3xl border p-6 sm:p-8"
            style={{
              background: "linear-gradient(135deg, #FFFFFF, #FDFAF7)",
              borderColor: "#E8E2D9",
              boxShadow: "0 4px 20px rgba(13, 11, 30, 0.05)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)" }}
              >
                <GitCompare className="h-6 w-6" style={{ color: "#7C3AED" }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0D0B1E" }}>
                  Choose a second live product
                </h1>
                <p className="mt-1 text-sm" style={{ color: "#7A7068" }}>
                  Select one product to compare side-by-side with your first choice.
                </p>
              </div>
            </div>

            <form onSubmit={findProducts} className="mt-6 flex gap-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-[#A89F95]"
                style={{ borderColor: "#E8E2D9", color: "#0D0B1E" }}
                placeholder="Search any product to compare..."
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  boxShadow: "0 3px 10px rgba(124, 58, 237, 0.30)",
                }}
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>

            {currentResultCandidates.length > 0 && (
              <>
                <div
                  className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#A89F95" }}
                >
                  <span className="h-px flex-1" style={{ background: "#E8E2D9" }} />
                  OR CHOOSE FROM PREVIOUS RESULTS
                  <span className="h-px flex-1" style={{ background: "#E8E2D9" }} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentResultCandidates.map((product) => (
                    <button
                      key={product.product_id}
                      type="button"
                      onClick={() => selectProductB(product)}
                      className="flex items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:-translate-y-px hover:border-purple-300 hover:shadow-md"
                      style={{
                        background: "#FFFFFF",
                        borderColor: "#E8E2D9",
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-xl text-lg"
                          style={{ background: "#F8F5F0" }}
                        >
                          📦
                        </div>
                      )}
                      <span className="min-w-0">
                        <span
                          className="block truncate text-sm font-bold"
                          style={{ color: "#0D0B1E" }}
                        >
                          {product.name}
                        </span>
                        <span className="mt-1 block text-sm font-semibold" style={{ color: "#7C3AED" }}>
                          {formatPrice(product.price)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {loading && (
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#7C3AED" }} />
              </div>
            )}
            {error && <p className="mt-5 text-sm font-semibold text-rose-600">{error}</p>}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {results
                .filter((product) => product.product_id !== productAId)
                .map((product) => (
                  <button
                    key={product.product_id ?? product.id}
                    type="button"
                    onClick={() => selectProductB(product)}
                    className="flex items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:-translate-y-px hover:border-purple-300 hover:shadow-md"
                    style={{
                      background: "#FFFFFF",
                      borderColor: "#E8E2D9",
                    }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-xl text-lg"
                        style={{ background: "#F8F5F0" }}
                      >
                        📦
                      </div>
                    )}
                    <span className="min-w-0">
                      <span
                        className="block truncate text-sm font-bold"
                        style={{ color: "#0D0B1E" }}
                      >
                        {product.name}
                      </span>
                      <span className="mt-1 block text-sm font-semibold" style={{ color: "#7C3AED" }}>
                        {formatPrice(product.price)}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </section>
        )}

        {!selectionMode && loading && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border py-24 text-center"
            style={{
              background: "linear-gradient(135deg, #FFFFFF, #F8F5FF)",
              borderColor: "#E8E2D9",
            }}
          >
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#7C3AED" }} />
            <p className="mt-4 text-base font-semibold" style={{ color: "#0D0B1E" }}>
              Comparing live specifications…
            </p>
          </div>
        )}

        {!selectionMode && error && (
          <div
            className="rounded-3xl border p-8 text-center"
            style={{ background: "#FFF5F5", borderColor: "#FECACA", color: "#DC2626" }}
          >
            {error}
          </div>
        )}

        {!selectionMode && comparison && (
          <>
            <header className="mb-10 text-center">
              <span
                className="rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-widest"
                style={{ background: "#EDE9FE", color: "#7C3AED" }}
              >
                Live Product Comparison
              </span>
              <h1
                className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight"
                style={{ color: "#0D0B1E" }}
              >
                {comparison.product_a.name}{" "}
                <span
                  className="mx-2 inline-block rounded-xl px-2.5 py-0.5 text-base font-bold text-white align-middle"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #F97316)" }}
                >
                  VS
                </span>{" "}
                {comparison.product_b.name}
              </h1>
            </header>

            <section className="grid gap-6 lg:grid-cols-2">
              <ProductSummary
                product={comparison.product_a}
                isPick={comparison.shopmind_pick_product_id === comparison.product_a.product_id}
                lowerPrice={
                  comparison.product_a.best_price != null &&
                  comparison.product_b.best_price != null &&
                  comparison.product_a.best_price < comparison.product_b.best_price
                }
              />
              <ProductSummary
                product={comparison.product_b}
                isPick={comparison.shopmind_pick_product_id === comparison.product_b.product_id}
                lowerPrice={
                  comparison.product_a.best_price != null &&
                  comparison.product_b.best_price != null &&
                  comparison.product_b.best_price < comparison.product_a.best_price
                }
              />
            </section>

            {/* AI Comparison Summary */}
            <section
              className="mt-8 rounded-3xl border p-6 sm:p-8"
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #F8F5FF 100%)",
                borderColor: "#C4B5FD",
                boxShadow: "0 8px 32px rgba(124, 58, 237, 0.08)",
              }}
            >
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#0D0B1E" }}>
                <ShopMindText showAi={false} /> Comparison Summary
              </h2>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
                {comparison.insights.map((insight) => (
                  <div
                    key={insight.label}
                    className="rounded-2xl border p-4"
                    style={{ background: "#FFFFFF", borderColor: "#E8E2D9" }}
                  >
                    <p className="font-bold text-sm" style={{ color: "#0D0B1E" }}>
                      {insight.label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "#7A7068" }}>
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="mt-5 rounded-2xl border p-4 flex items-start gap-3"
                style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-800">
                    AI Recommendation
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-orange-950">
                    {comparison.recommendation}
                  </p>
                </div>
              </div>
              {comparison.price_difference != null && (
                <p className="mt-3 text-xs" style={{ color: "#7A7068" }}>
                  Best-price difference:{" "}
                  <span className="font-bold" style={{ color: "#0D0B1E" }}>
                    {formatPrice(comparison.price_difference)}
                  </span>
                </p>
              )}
            </section>

            {/* Specifications Table */}
            {specificationKeys.length > 0 && (
              <section
                className="mt-8 overflow-hidden rounded-3xl border"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E8E2D9",
                  boxShadow: "0 4px 16px rgba(13, 11, 30, 0.04)",
                }}
              >
                <h2 className="border-b px-6 py-5 text-base sm:text-lg font-bold" style={{ color: "#0D0B1E", borderColor: "#E8E2D9" }}>
                  Available Specifications
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead style={{ background: "#FAF7F2", color: "#5A5248" }}>
                      <tr>
                        <th className="px-6 py-3.5 font-bold text-left">Specification</th>
                        <th className="px-6 py-3.5 font-bold text-left">{comparison.product_a.name}</th>
                        <th className="px-6 py-3.5 font-bold text-left">{comparison.product_b.name}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "#E8E2D9" }}>
                      {specificationKeys.map((key) => (
                        <tr key={key} className="transition-colors hover:bg-[#FAF7F2]">
                          <th className="px-6 py-3.5 text-left font-semibold" style={{ color: "#0D0B1E" }}>
                            {key}
                          </th>
                          <td className="px-6 py-3.5" style={{ color: "#7A7068" }}>
                            {comparison.product_a.specifications[key] ?? "Not available"}
                          </td>
                          <td className="px-6 py-3.5" style={{ color: "#7A7068" }}>
                            {comparison.product_b.specifications[key] ?? "Not available"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Offer Lists */}
            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <OfferList product={comparison.product_a} />
              <OfferList product={comparison.product_b} />
            </section>
          </>
        )}
      </main>
    </PageBackground>
  );
};

export default CompareProducts;

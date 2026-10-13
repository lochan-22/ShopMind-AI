import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  GitCompare,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";
import { ProductSearchForm } from "../components/product/ProductSearchForm";
import { getExternalProduct, getProduct } from "../services/productService";
import type { Product, ProductOffer } from "../services/productService";
import { useCart } from "../contexts/CartContext";

type ProductDetailsNavigationState = {
  comparisonCandidates?: Product[];
  productFallback?: Product;
};

/** Safely parse a numeric price from a number or price string (e.g. "₹1,499" -> 1499, 1357 -> 1357) */
const parsePrice = (priceVal: number | string | null | undefined): number | null => {
  if (priceVal == null) return null;
  if (typeof priceVal === "number") return isNaN(priceVal) || priceVal < 0 ? null : priceVal;
  const match = String(priceVal).match(/-?[\d,]+(?:\.\d+)?/);
  if (!match) return null;
  const num = parseFloat(match[0].replace(/,/g, ""));
  return isNaN(num) || num < 0 ? null : num;
};

const ProductDetails: React.FC = () => {
  const { id, productId } = useParams<{ id?: string; productId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const navigationState = location.state as ProductDetailsNavigationState | null;
  const comparisonCandidates = Array.isArray(
    navigationState?.comparisonCandidates,
  )
    ? navigationState.comparisonCandidates
    : [];
  const productFallback = navigationState?.productFallback;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [buyNowError, setBuyNowError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const isExternalProduct = Boolean(productId);
      const requestedId = productId ?? id;
      if (!requestedId) {
        setError("No product id provided.");
        setLoading(false);
        return;
      }

      if (!isExternalProduct && !Number.isInteger(Number(requestedId))) {
        setError("Invalid product id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setBuyNowError(null);

      try {
        const data = isExternalProduct
          ? await getExternalProduct(requestedId)
          : await getProduct(Number(requestedId));
        setProduct(data);
      } catch (error) {
        const externalProductIsUnavailable =
          isExternalProduct &&
          axios.isAxiosError(error) &&
          error.response?.status === 404;
        const matchingCartFallback =
          externalProductIsUnavailable &&
          productFallback?.product_id === requestedId
            ? productFallback
            : null;

        if (matchingCartFallback) {
          setProduct(matchingCartFallback);
          return;
        }

        setError(
          axios.isAxiosError(error) && error.response?.status === 404
            ? "Product not found."
            : "Failed to load product. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, productId, productFallback]);

  /** Sort offers by numeric price ascending (Lowest → Highest) and accurately identify the best price */
  const sortedOffers = useMemo<ProductOffer[]>(() => {
    if (!product?.offers) return [];
    const offersCopy = [...product.offers];

    offersCopy.sort((a, b) => {
      const priceA = parsePrice(a.price);
      const priceB = parsePrice(b.price);
      if (priceA === null && priceB === null) return 0;
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return priceA - priceB;
    });

    // Find minimum valid numeric price
    const minPrice = offersCopy.reduce<number | null>((min, offer) => {
      const p = parsePrice(offer.price);
      if (p === null) return min;
      return min === null ? p : Math.min(min, p);
    }, null);

    return offersCopy.map((offer) => {
      const p = parsePrice(offer.price);
      const isBest = minPrice !== null && p !== null && Math.abs(p - minPrice) < 0.01;
      return {
        ...offer,
        is_best_price: isBest || offer.is_best_price,
      };
    });
  }, [product?.offers]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    navigate("/cart");
  };

  const handleCompare = () => {
    if (!product?.product_id) return;
    navigate(`/compare?product_a=${encodeURIComponent(product.product_id)}`, {
      state: { comparisonCandidates },
    });
  };

  /** Dynamically calculate the cheapest offer with a valid URL and navigate to it */
  const handleBuyNow = () => {
    if (!product) return;
    setBuyNowError(null);

    // Filter offers that have both a valid numeric price and a valid non-empty product_url
    const validOffersWithUrl = sortedOffers.filter((offer) => {
      const p = parsePrice(offer.price);
      return p !== null && Boolean(offer.product_url?.trim());
    });

    let targetUrl: string | null = null;

    if (validOffersWithUrl.length > 0) {
      // sortedOffers is sorted ascending by price, so validOffersWithUrl[0] is guaranteed to be the lowest price offer
      targetUrl = validOffersWithUrl[0].product_url!.trim();
    } else if (product.product_url?.trim()) {
      targetUrl = product.product_url.trim();
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else if (product.offers && product.offers.length > 0) {
      setBuyNowError("No direct purchase link is available for the current offers.");
    } else {
      setBuyNowError("No valid seller offer is available.");
    }
  };

  return (
    <PageBackground>
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:p-5">
          <ProductSearchForm
            onSearch={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 py-20 shadow-lg shadow-slate-200/50">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="mt-4 text-sm text-slate-500">Loading product...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/60 py-20 text-center shadow-lg shadow-rose-100/50">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
            <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && !error && !product && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 py-20 text-center shadow-lg shadow-slate-200/50">
            <p className="text-sm text-slate-500">Product not found.</p>
          </div>
        )}

        {/* Product Content */}
        {!loading && !error && product && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
              {product.image ? (
                <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-slate-100 text-slate-400">No Image</div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                {product.brand} · {product.category}
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating != null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-700">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {product.review_count != null ? product.review_count.toLocaleString("en-IN") : "Reviews unavailable"}
                  </span>
                </div>
              )}

              {/* Price */}
              {product.price != null && (
                <div className="mt-6">
                  <span className="text-3xl font-bold text-slate-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Stock */}
              {product.stock != null && (
                <div className="mt-4">
                  {product.stock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600">
                      <XCircle className="h-4 w-4" />
                      Out of Stock
                    </span>
                  )}
                </div>
              )}

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-500">
                {product.description}
              </p>

              {/* Available Offers — Sorted Lowest → Highest */}
              {product.product_id && sortedOffers.length > 0 && (
                <section className="mt-6">
                  <h2 className="text-lg font-semibold text-slate-900">Available offers</h2>
                  <div className="mt-3 space-y-2">
                    {sortedOffers.map((offer, index) => {
                      const numPrice = parsePrice(offer.price);
                      return (
                        <div
                          key={`${offer.source_name ?? "offer"}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2 text-base font-medium text-slate-800">
                            {offer.source_name ?? "Retailer"}
                            {offer.is_best_price && (
                              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Best Price
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-[17px] font-medium text-slate-600">
                              {numPrice != null ? `₹${numPrice.toLocaleString("en-IN")}` : "Price unavailable"}
                            </span>
                            {offer.product_url && (
                              <a
                                href={offer.product_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                              >
                                Buy
                              </a>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Action Buttons */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.stock}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-300/40 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  type="button"
                  onClick={handleCompare}
                  disabled={!product.product_id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-slate-800"
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </button>
              </div>

              {/* Buy Now User Feedback Notification */}
              {buyNowError && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
                  {buyNowError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </PageBackground>
  );
};

export default ProductDetails;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { getProduct } from "../services/productService";
import type { Product } from "../services/productService";
import { useCart } from "../contexts/CartContext";
const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product id provided.");
        setLoading(false);
        return;
      }

      if (!Number.isInteger(Number(id))) {
        setError("Invalid product id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getProduct(Number(id));
        setProduct(data);
      } catch (error) {
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
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);
    navigate("/cart");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

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
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-700">
                    {product.rating}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {product.review_count.toLocaleString("en-IN")} reviews
                </span>
              </div>

              {/* Price */}
              <div className="mt-6">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Stock */}
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

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-500">
                {product.description}
              </p>

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
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-slate-800"
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

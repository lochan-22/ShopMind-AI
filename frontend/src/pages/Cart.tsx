import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import { useCart } from "../contexts/CartContext";
import type { Product } from "../services/productService";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems, subtotal, increaseQuantity, decreaseQuantity, removeProduct } = useCart();
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

  const handleIncrease = (id: number) => {
    increaseQuantity(id);
  };

  const handleDecrease = (id: number) => {
    decreaseQuantity(id);
  };

  const handleRemove = (id: number) => {
    removeProduct(id);
  };

  const handleContinueShopping = () => {
    navigate("/categories");
  };

  const handleViewProduct = (product: Product) => {
    const productPath = product.product_id
      ? `/products/external/${encodeURIComponent(product.product_id)}`
      : `/products/${product.id}`;
    navigate(productPath, { state: { productFallback: product } });
  };

  const handleCompareProducts = () => {
    if (cartItems.length < 2) {
      setCompareMessage("Add at least 2 unique products to compare them.");
      return;
    }

    const [productA, productB] = cartItems;
    const productAId = productA.product.product_id ?? String(productA.product.id);
    const productBId = productB.product.product_id ?? String(productB.product.id);
    navigate(
      `/compare?product_a=${encodeURIComponent(productAId)}&product_b=${encodeURIComponent(productBId)}`,
    );
  };

  const formatCurrency = (value: number | null | undefined): string =>
    `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-300/50">
            <ShoppingBag className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
        </div>

        {/* Empty Cart State */}
        {cartItems.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center shadow-lg shadow-slate-200/50">
            <p className="text-slate-500">Your cart is empty.</p>
            <button
              type="button"
              onClick={handleContinueShopping}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-300/40 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </button>
          </div>
        )}

        {/* Cart Content */}
        {cartItems.length > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => handleViewProduct(item.product)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleViewProduct(item.product);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 sm:h-28 sm:w-28">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">No Image</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">
                      {item.product.category}
                    </p>
                    <h3 className="mt-1 truncate text-sm sm:text-base font-semibold text-slate-900">
                      {item.product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-amber-600">
                        ★ {item.product.rating ?? "N/A"}
                      </span>

                      <span className="text-xs text-slate-400">
                        ({Number(item.product.review_count ?? 0).toLocaleString("en-IN")})
                      </span>
                    </div>
                    <div className="mt-2 text-base font-bold text-slate-900">
                      {formatCurrency(item.product.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDecrease(item.product.id);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleIncrease(item.product.id);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemove(item.product.id);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50">
                <h2 className="mb-5 text-base sm:text-lg font-bold text-slate-900">
                  Cart Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Unique products</span>
                    <span className="font-medium text-slate-800">
                      {cartItems.length}
                    </span>
                  </div>
                  <div className="my-3 h-px w-full bg-slate-100" />
                  <div className="flex items-center justify-between text-base font-bold text-slate-900">
                    <span>Estimated product value</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-slate-500">
                  ShopMind AI helps you discover and compare products. Purchases are completed on retailer websites.
                </p>

                {compareMessage && (
                  <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                    {compareMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCompareProducts}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-300/40 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  Compare Products
                </button>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  Sparkles,
  TrendingDown,
  RefreshCw,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import { useCart } from "../contexts/CartContext";

const aiSuggestions: string[] = [
  "Buy together and save ₹500",
  "Better alternative available",
  "This product price may drop soon",
];

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems, subtotal, totalQuantity, increaseQuantity, decreaseQuantity, removeProduct } = useCart();

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

  const discount = 0;
  const delivery = subtotal > 0 && subtotal < 50000 ? 199 : 0;
  const finalTotal = subtotal + delivery - discount;

  const formatCurrency = (value: number): string =>
    `₹${value.toLocaleString("en-IN")}`;

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
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
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
                        ★ {item.product.rating}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({item.product.review_count.toLocaleString("en-IN")})
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
                        onClick={() => handleDecrease(item.product.id)}
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
                        onClick={() => handleIncrease(item.product.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.product.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Suggestions */}
            <div className="space-y-6">
              {/* AI Shopping Summary */}
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50">
                <h2 className="mb-5 text-base sm:text-lg font-bold text-slate-900">
                  AI Shopping Summary ({totalQuantity} items)
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Discount</span>
                    <span className="font-medium text-emerald-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Delivery</span>
                    <span className="font-medium text-slate-800">
                      {delivery === 0 ? "Free" : formatCurrency(delivery)}
                    </span>
                  </div>
                  <div className="my-3 h-px w-full bg-slate-100" />
                  <div className="flex items-center justify-between text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-300/40 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  Checkout
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

              {/* AI Suggestions Card */}
              <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-lg shadow-amber-100/50">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 shadow-md shadow-amber-300/50">
                    <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    AI Suggestions
                  </h2>
                </div>
                <ul className="space-y-2.5">
                  {aiSuggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-2xl border border-amber-100 bg-white/70 p-3 text-sm text-slate-700"
                    >
                      {idx === 1 ? (
                        <RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      ) : idx === 2 ? (
                        <TrendingDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      ) : (
                        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      )}
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

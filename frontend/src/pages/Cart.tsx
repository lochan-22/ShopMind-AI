import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, ExternalLink, GitCompare } from "lucide-react";
import Navbar from "../components/common/Navbar";
import PageBackground from "../components/common/PageBackground";
import { useCart } from "../contexts/CartContext";
import ShopMindText from "../components/common/ShopMindText";

const formatCurrency = (amount: number): string => `₹${amount.toLocaleString("en-IN")}`;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, removeProduct, increaseQuantity, decreaseQuantity } = useCart();
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

  const handleContinueShopping = () => navigate("/");

  const handleCompareProducts = () => {
    if (items.length < 2) {
      setCompareMessage("Add at least 2 products to compare them side-by-side.");
      return;
    }
    setCompareMessage(null);
    const productA = items[0].product.product_id;
    const productB = items[1].product.product_id;
    if (productA && productB) {
      navigate(
        `/compare?product_a=${encodeURIComponent(productA)}&product_b=${encodeURIComponent(productB)}`,
        { state: { comparisonCandidates: items.map((item) => item.product) } }
      );
      return;
    }
    setCompareMessage("Product comparison is available for live search products.");
  };

  return (
    <PageBackground>
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
            >
              <ShoppingBag className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#0D0B1E" }}>
                Your Cart
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: "#7A7068" }}>
                {items.length === 0
                  ? "Your cart is empty"
                  : `${items.length} product${items.length === 1 ? "" : "s"} in your cart`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueShopping}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-px"
            style={{
              background: "#FFFFFF",
              borderColor: "#E8E2D9",
              color: "#5A5248",
              boxShadow: "0 1px 4px rgba(13,11,30,0.06)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border py-24 text-center"
            style={{
              background: "linear-gradient(135deg, #FFFFFF, #F8F5FF)",
              borderColor: "#E8E2D9",
              boxShadow: "0 4px 24px rgba(124,58,237,0.06)",
            }}
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #EDE9FE, #FFF7ED)" }}
            >
              <ShoppingBag className="h-8 w-8" style={{ color: "#7C3AED" }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#0D0B1E" }}>Your cart is empty</h2>
            <p className="mt-2 text-sm" style={{ color: "#A89F95" }}>
              Search for products and add them to your cart to review them here.
            </p>
            <button
              type="button"
              onClick={handleContinueShopping}
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart items */}
            <div className="space-y-4 lg:col-span-2">
              {items.map(({ product, quantity }) => {
                const isExternal = Boolean(product.product_id);
                const targetPath = isExternal
                  ? `/products/external/${encodeURIComponent(product.product_id!)}`
                  : `/products/${product.id}`;

                return (
                  <div
                    key={product.product_id ?? product.id}
                    className="flex flex-col gap-4 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    style={{
                      background: "linear-gradient(135deg, #FFFFFF, #FDFAF7)",
                      borderColor: "#E8E2D9",
                      boxShadow: "0 2px 8px rgba(13,11,30,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-20 w-20 rounded-xl object-cover"
                          style={{ border: "1px solid #E8E2D9" }}
                        />
                      ) : (
                        <div
                          className="flex h-20 w-20 items-center justify-center rounded-xl text-lg"
                          style={{ background: "#F8F5F0", color: "#A89F95" }}
                        >
                          📦
                        </div>
                      )}
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#7C3AED" }}>
                          {product.brand}
                        </p>
                        <h3
                          onClick={() => navigate(targetPath, { state: { productFallback: product } })}
                          className="cursor-pointer font-semibold transition-colors hover:underline"
                          style={{ color: "#0D0B1E" }}
                        >
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold" style={{ color: "#7C3AED" }}>
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between gap-4 border-t pt-3 sm:border-t-0 sm:pt-0"
                      style={{ borderColor: "#E8E2D9" }}
                    >
                      {/* Qty controls */}
                      <div
                        className="flex items-center gap-2 rounded-xl border p-1"
                        style={{ background: "#F8F5F0", borderColor: "#E8E2D9" }}
                      >
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white"
                          style={{ color: "#5A5248" }}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold" style={{ color: "#0D0B1E" }}>
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-white"
                          style={{ color: "#5A5248" }}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(targetPath, { state: { productFallback: product } })}
                          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-px"
                          style={{
                            background: "#FFFFFF",
                            borderColor: "#E8E2D9",
                            color: "#5A5248",
                          }}
                        >
                          View Deals
                          <ExternalLink className="h-3.5 w-3.5" style={{ color: "#A89F95" }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-red-50"
                          style={{ color: "#EF4444" }}
                          aria-label="Remove product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart summary */}
            <div>
              <div
                className="rounded-3xl border p-6"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #F8F5FF)",
                  borderColor: "#E8E2D9",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.08)",
                }}
              >
                <h2 className="text-lg font-bold" style={{ color: "#0D0B1E" }}>Cart Summary</h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm" style={{ color: "#7A7068" }}>
                    <span>Selected items</span>
                    <span className="font-semibold" style={{ color: "#0D0B1E" }}>
                      {items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="h-px w-full" style={{ background: "#E8E2D9" }} />
                  <div className="flex items-center justify-between text-base font-bold" style={{ color: "#0D0B1E" }}>
                    <span>Estimated value</span>
                    <span style={{ color: "#7C3AED" }}>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed" style={{ color: "#7A7068" }}>
                  <ShopMindText /> helps you discover and compare products. Purchases are completed on retailer websites.
                </p>

                {compareMessage && (
                  <p
                    className="mt-4 rounded-xl px-3 py-2 text-sm font-medium"
                    style={{ background: "#FFF7ED", color: "#C2410C" }}
                  >
                    {compareMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCompareProducts}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.30)",
                  }}
                >
                  <GitCompare className="h-4 w-4" />
                  Compare Products
                </button>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-px"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#E8E2D9",
                    color: "#5A5248",
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageBackground>
  );
};

export default Cart;


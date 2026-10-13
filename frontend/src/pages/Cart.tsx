import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ExternalLink,
  GitCompare,
  Check,
  X,
  Loader2,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";
import { useCart } from "../contexts/CartContext";
import ShopMindText from "../components/common/ShopMindText";
import { getProductComparisonId, type Product } from "../services/productService";

const formatCurrency = (amount: number): string => `₹${amount.toLocaleString("en-IN")}`;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, removeProduct, increaseQuantity, decreaseQuantity } = useCart();
  const [compareMessage, setCompareMessage] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const handleContinueShopping = () => navigate("/");

  // Distinct products in cart by their canonical comparison ID
  const distinctCartProducts = useMemo(() => {
    const seenIds = new Set<string>();
    const distinct: Product[] = [];
    for (const item of items) {
      const pid = getProductComparisonId(item.product);
      if (pid && !seenIds.has(pid)) {
        seenIds.add(pid);
        distinct.push(item.product);
      }
    }
    return distinct;
  }, [items]);

  // Keep selectedProductIds synchronized with distinct products currently in the cart
  useEffect(() => {
    const currentIds = distinctCartProducts.map(getProductComparisonId).filter(Boolean);
    setSelectedProductIds((prev) => {
      const stillValid = prev.filter((id) => currentIds.includes(id));
      if (currentIds.length === 2) {
        return currentIds;
      }
      return stillValid.slice(0, 2);
    });
  }, [distinctCartProducts]);

  const toggleCompareSelection = (productId: string) => {
    if (!productId) return;
    setCompareMessage(null);
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 2) {
        // Keep the second one and add the new one so user always has the last 2 selected
        return [prev[1], productId];
      }
      return [...prev, productId];
    });
  };

  const executeComparison = (idA: string, idB: string) => {
    if (!idA || !idB || idA === idB) {
      setCompareMessage("Please select two distinct products to compare.");
      return;
    }
    setIsComparing(true);
    setCompareMessage(null);
    setIsSelectionModalOpen(false);
    navigate(
      `/compare?product_a=${encodeURIComponent(idA)}&product_b=${encodeURIComponent(idB)}`,
      { state: { comparisonCandidates: distinctCartProducts } }
    );
  };

  const handleCompareProducts = () => {
    if (isComparing) return;
    if (distinctCartProducts.length < 2) {
      setCompareMessage("Add at least 2 distinct products to your cart to compare them side-by-side.");
      return;
    }
    setCompareMessage(null);

    // If exactly 2 distinct products exist in cart, directly compare both
    if (distinctCartProducts.length === 2) {
      const idA = getProductComparisonId(distinctCartProducts[0]);
      const idB = getProductComparisonId(distinctCartProducts[1]);
      executeComparison(idA, idB);
      return;
    }

    // If more than 2 products and exactly 2 are selected, compare them
    if (selectedProductIds.length === 2) {
      executeComparison(selectedProductIds[0], selectedProductIds[1]);
      return;
    }

    // Otherwise, open the selection step modal so the user can choose
    setIsSelectionModalOpen(true);
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
                const compId = getProductComparisonId(product);
                const isSelectedForCompare = Boolean(compId && selectedProductIds.includes(compId));
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
                      borderColor: isSelectedForCompare ? "#C4B5FD" : "#E8E2D9",
                      boxShadow: isSelectedForCompare
                        ? "0 4px 16px rgba(124, 58, 237, 0.12)"
                        : "0 2px 8px rgba(13,11,30,0.05)",
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

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Compare toggle button */}
                        {distinctCartProducts.length >= 2 && compId && (
                          <button
                            type="button"
                            onClick={() => toggleCompareSelection(compId)}
                            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-px"
                            style={{
                              borderColor: isSelectedForCompare ? "#7C3AED" : "#E8E2D9",
                              background: isSelectedForCompare ? "#F5F3FF" : "#FFFFFF",
                              color: isSelectedForCompare ? "#7C3AED" : "#5A5248",
                            }}
                            aria-label={`Select ${product.name} for comparison`}
                          >
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-sm border transition ${
                                isSelectedForCompare
                                  ? "border-[#7C3AED] bg-[#7C3AED] text-white"
                                  : "border-[#C4B5FD] bg-white"
                              }`}
                            >
                              {isSelectedForCompare && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            <span>{isSelectedForCompare ? "Selected" : "Compare"}</span>
                          </button>
                        )}

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

                {/* Comparison selection helper badge */}
                {distinctCartProducts.length >= 2 && (
                  <div
                    className="mt-4 rounded-2xl border p-3.5 text-xs transition-all"
                    style={{
                      background: selectedProductIds.length === 2 ? "#FAF5FF" : "#FDFBF7",
                      borderColor: selectedProductIds.length === 2 ? "#C4B5FD" : "#E8E2D9",
                    }}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span style={{ color: "#0D0B1E" }}>Comparison Selection</span>
                      <span style={{ color: selectedProductIds.length === 2 ? "#16A34A" : "#7C3AED" }}>
                        {selectedProductIds.length === 2
                          ? "2 of 2 ready"
                          : `${selectedProductIds.length} of 2 selected`}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#7A7068" }}>
                      {distinctCartProducts.length === 2
                        ? "Both products are ready to compare side-by-side."
                        : selectedProductIds.length === 2
                        ? "2 products selected. Click Compare to analyze side-by-side."
                        : "Click Compare Products to choose any 2 items from your cart."}
                    </p>
                  </div>
                )}

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
                  disabled={isComparing}
                  onClick={handleCompareProducts}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.30)",
                  }}
                >
                  {isComparing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading comparison…
                    </>
                  ) : (
                    <>
                      <GitCompare className="h-4 w-4" />
                      {distinctCartProducts.length > 2 && selectedProductIds.length === 2
                        ? "Compare Selected (2)"
                        : "Compare Products"}
                    </>
                  )}
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

      {/* Product Selection Modal for > 2 items in cart */}
      {isSelectionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-modal-title"
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border bg-white p-6 sm:p-8 shadow-2xl transition-all"
            style={{ borderColor: "#E8E2D9" }}
          >
            <button
              type="button"
              onClick={() => setIsSelectionModalOpen(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl text-[#7A7068] transition hover:bg-[#F3EFEA] hover:text-[#0D0B1E]"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)" }}
              >
                <GitCompare className="h-5 w-5" style={{ color: "#7C3AED" }} />
              </div>
              <div>
                <h2 id="compare-modal-title" className="text-lg sm:text-xl font-bold" style={{ color: "#0D0B1E" }}>
                  Choose 2 Products to Compare
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: "#7A7068" }}>
                  Select any two distinct products from your cart for side-by-side analysis.
                </p>
              </div>
            </div>

            {/* Selection status chip */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/70 px-4 py-2.5 text-xs">
              <span className="font-semibold text-[#5A5248]">
                {selectedProductIds.length === 0
                  ? "Select your first product below"
                  : selectedProductIds.length === 1
                  ? "Select a second product to compare"
                  : "2 products selected and ready"}
              </span>
              <span className="font-bold text-[#7C3AED]">
                {selectedProductIds.length} / 2 selected
              </span>
            </div>

            {/* Products list */}
            <div className="mt-4 max-h-80 space-y-2.5 overflow-y-auto pr-1">
              {distinctCartProducts.map((prod) => {
                const pid = getProductComparisonId(prod);
                const isSelected = selectedProductIds.includes(pid);
                return (
                  <div
                    key={pid}
                    onClick={() => toggleCompareSelection(pid)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all hover:border-purple-300"
                    style={{
                      borderColor: isSelected ? "#7C3AED" : "#E8E2D9",
                      background: isSelected ? "#FAF5FF" : "#FFFFFF",
                      boxShadow: isSelected ? "0 2px 10px rgba(124,58,237,0.12)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                          isSelected
                            ? "border-[#7C3AED] bg-[#7C3AED] text-white"
                            : "border-[#C4B5FD] bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </div>

                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover shrink-0 border"
                          style={{ borderColor: "#E8E2D9" }}
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm"
                          style={{ background: "#F8F5F0" }}
                        >
                          📦
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                          {prod.brand || "Brand"}
                        </p>
                        <p className="truncate text-xs sm:text-sm font-semibold text-[#0D0B1E]">
                          {prod.name}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs sm:text-sm font-bold text-[#7C3AED]">
                        {formatCurrency(prod.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4" style={{ borderColor: "#E8E2D9" }}>
              <button
                type="button"
                onClick={() => setIsSelectionModalOpen(false)}
                className="rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5A5248] hover:bg-gray-50 transition"
                style={{ borderColor: "#E8E2D9" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedProductIds.length !== 2 || isComparing}
                onClick={() => {
                  if (selectedProductIds.length === 2) {
                    executeComparison(selectedProductIds[0], selectedProductIds[1]);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.30)",
                }}
              >
                {isComparing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Comparing…
                  </>
                ) : (
                  <>
                    <GitCompare className="h-4 w-4" />
                    Compare 2 Selected Products
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </PageBackground>
  );
};

export default Cart;

import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AgentProvider } from "../agent/context/AgentProvider";
import { AgentPanel } from "../agent/components/AgentPanel";
import { FloatingAgentButton } from "../agent/components/FloatingAgentButton";

/* ── Lazy page imports ── */
const Home            = lazy(() => import("../pages/Home"));
const SearchResults   = lazy(() => import("../pages/SearchResults"));
const Products        = lazy(() => import("../pages/Products"));
const Categories      = lazy(() => import("../pages/Categories"));
const CategoryProducts = lazy(() => import("../pages/CategoryProducts"));
const ProductDetails  = lazy(() => import("../pages/ProductDetails"));
const Cart            = lazy(() => import("../pages/Cart"));
const AgentDashboard  = lazy(() => import("../pages/AgentDashboard"));
const NotFound        = lazy(() => import("../pages/NotFound"));

/* ── Full-screen loading fallback ── */
const PageLoader: React.FC = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300" />
      </div>
    </div>
  </div>
);

/* ── Route definitions ── */
const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <AgentProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/products"     element={<Products />} />
          <Route path="/search"      element={<SearchResults />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<CategoryProducts />} />
          <Route path="/cart"        element={<Cart />} />
          <Route path="/agent"       element={<AgentDashboard />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </Suspense>
      <AgentPanel />
      <FloatingAgentButton />
    </AgentProvider>
  </BrowserRouter>
);

export default AppRoutes;

import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AgentProvider } from "../agent/context/AgentProvider";
import { AgentPanel } from "../agent/components/AgentPanel";
import { FloatingAgentButton } from "../agent/components/FloatingAgentButton";
import ShopMindLogo from "../components/common/ShopMindLogo";

/* ── Lazy page imports ── */
const Home             = lazy(() => import("../pages/Home"));
const SearchResults    = lazy(() => import("../pages/SearchResults"));
const CompareProducts  = lazy(() => import("../pages/CompareProducts"));
const Categories       = lazy(() => import("../pages/Categories"));
const SubCategories    = lazy(() => import("../pages/SubCategories"));
const CategoryProducts = lazy(() => import("../pages/CategoryProducts"));
const ProductDetails   = lazy(() => import("../pages/ProductDetails"));
const Cart             = lazy(() => import("../pages/Cart"));
const AgentDashboard   = lazy(() => import("../pages/AgentDashboard"));
const NotFound         = lazy(() => import("../pages/NotFound"));

/* ── Page loading fallback featuring the warm cream background & mascot ── */
const PageLoader: React.FC = () => (
  <div
    className="flex min-h-screen w-full items-center justify-center"
    style={{
      backgroundColor: "#FAF7F2",
      backgroundImage: "radial-gradient(circle, #DDD6FE 1.2px, transparent 1.2px)",
      backgroundSize: "30px 30px",
    }}
  >
    <div
      className="flex flex-col items-center gap-4 rounded-3xl border p-8 shadow-xl"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderColor: "#E8E2D9",
        boxShadow: "0 12px 36px rgba(124, 58, 237, 0.12)",
      }}
    >
      <ShopMindLogo variant="full" size="md" />
      <div className="flex items-center gap-1.5 mt-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-purple-600 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400" />
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
          <Route path="/search"      element={<SearchResults />} />
          <Route path="/compare"     element={<CompareProducts />} />
          <Route path="/products/external/:productId" element={<ProductDetails />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* ── Category 3-level navigation ── */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:mainCategory" element={<SubCategories />} />
          <Route path="/categories/:mainCategory/:subCategory" element={<CategoryProducts />} />

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

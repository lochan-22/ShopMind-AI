import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";

const Home = lazy(() => import("../pages/Home"));
const SearchResults = lazy(() => import("../pages/SearchResults"));
const CompareProducts = lazy(() => import("../pages/CompareProducts"));
const Categories = lazy(() => import("../pages/Categories"));
const SubCategories = lazy(() => import("../pages/SubCategories"));
const CategoryProducts = lazy(() => import("../pages/CategoryProducts"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart"));
const Deals = lazy(() => import("../pages/Deals"));
const About = lazy(() => import("../pages/About"));
const AgentWorkspace = lazy(() => import("../pages/AgentWorkspace"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/compare" element={<CompareProducts />} />
        <Route path="/products/external/:productId" element={<ProductDetails />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* Three-level collection browsing */}
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:mainCategory" element={<SubCategories />} />
        <Route path="/categories/:mainCategory/:subCategory" element={<CategoryProducts />} />

        <Route path="/deals" element={<Deals />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<MainLayout hideFooter />}>
        <Route path="/agent" element={<AgentWorkspace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;

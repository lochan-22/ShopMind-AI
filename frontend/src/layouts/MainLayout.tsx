import { lazy, Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CompareTray } from "../components/product/CompareTray";
import { AgentLauncher } from "../agent/components/AgentLauncher";
import { useAgent } from "../agent/AgentContext";
import { LogoMark } from "../components/brand/Logo";

// The concierge (and its markdown renderer) loads only when first opened.
const AgentPanel = lazy(() => import("../agent/components/AgentPanel").then((module) => ({ default: module.AgentPanel })));

/** Scroll to the top on forward navigation; back/forward keeps the browser's position. */
const ScrollManager = () => {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search, navigationType]);
  return null;
};

const PageFallback = () => (
  <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-label="Loading page">
    <div className="relative">
      <span className="pulse-ring absolute inset-0 rounded-full bg-iris/30" aria-hidden="true" />
      <LogoMark className="relative h-14 w-14" />
    </div>
  </div>
);

export const MainLayout = ({ hideFooter = false }: { hideFooter?: boolean }) => {
  const location = useLocation();
  const { isOpen } = useAgent();
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          {/* Keyed by path so each route plays its entrance transition. */}
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      <CompareTray />
      <AgentLauncher />
      {isOpen && (
        <Suspense fallback={null}>
          <AgentPanel />
        </Suspense>
      )}
    </div>
  );
};

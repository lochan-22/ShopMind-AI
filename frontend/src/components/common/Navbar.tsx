import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ShopMindLogo from "./ShopMindLogo";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/search?q=deals" },
  { label: "Compare", href: "/compare" },
  { label: "About", href: "/#how-it-works" },
];

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerNavigate = useNavigate();
  const location = useLocation();

  const navigate = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    routerNavigate(href);
  };

  const isItemActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/" && !location.hash;
    }
    if (href.startsWith("/#")) {
      return location.hash === href.replace("/", "");
    }
    if (href.includes("?")) {
      const [path, search] = href.split("?");
      return location.pathname === path && location.search.includes(search);
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4 transition-all">
      <div className="mx-auto max-w-7xl">
        {/* Pill-like Glass Navbar Container */}
        <div
          className="flex h-14 sm:h-16 items-center justify-between rounded-full border px-4 sm:px-6 shadow-sm transition-all"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderColor: "rgba(232, 226, 217, 0.85)",
            boxShadow: "0 4px 20px rgba(13, 11, 30, 0.04), 0 1px 3px rgba(13, 11, 30, 0.02)",
          }}
        >
          {/* LEFT: Logo & Brand Name horizontally aligned and vertically centered */}
          <div className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 select-none flex-shrink-0 cursor-pointer focus:outline-none transition-transform hover:opacity-95"
              aria-label="ShopMind AI home"
            >
              <ShopMindLogo variant="full" size="sm" />
            </button>
          </div>

          {/* CENTER: Navigation Links with Purple Active State */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5" role="navigation">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-all duration-150 ${
                    active
                      ? "text-[#7C3AED] font-semibold bg-purple-50"
                      : "text-[#5A5248] hover:text-[#7C3AED] hover:bg-purple-50/70"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Actions (Cart & Sign In Pill Button) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <button
              aria-label="Cart"
              onClick={() => navigate("/cart")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5A5248] transition-colors hover:bg-purple-50 hover:text-[#7C3AED]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>

            {/* Sign In Pill Button */}
            <button
              type="button"
              className="h-9 rounded-full px-5 text-[13px] font-bold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                boxShadow: "0 3px 12px rgba(124, 58, 237, 0.28)",
              }}
            >
              Sign In
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-[#5A5248] transition hover:bg-purple-50"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu Card */}
        {mobileOpen && (
          <div
            className="mt-2 md:hidden rounded-2xl border border-[#E8E2D9] px-4 py-3 shadow-xl flex flex-col gap-1 transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(20px)",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(item.href);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-left text-[14px] font-medium transition-all ${
                    active
                      ? "text-[#7C3AED] font-bold bg-purple-50"
                      : "text-[#5A5248] hover:bg-purple-50 hover:text-[#7C3AED]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="mt-2 pt-2 border-t border-[#E8E2D9] flex gap-2">
              <button
                type="button"
                className="flex-1 h-10 rounded-full text-[13.5px] font-bold text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
              >
                Sign In
              </button>
              <button
                type="button"
                aria-label="Cart"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/cart");
                }}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-[#E8E2D9] text-[#7A7068]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import ShopMindLogo from "./ShopMindLogo";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
  { label: "Compare", href: "/compare" },
  { label: "About", href: "/about" },
];

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerNavigate = useNavigate();
  const location = useLocation();

  const handleNav = (href: string) => {
    if (href === "search-focus") {
      if (location.pathname === "/") {
        const el = document.getElementById("hero-search-input");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
          return;
        }
      }
      routerNavigate("/?focus=search");
      return;
    }
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
      return location.pathname === "/" && !location.hash && !location.search.includes("focus=search");
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
          className="flex h-14 sm:h-16 items-center justify-between rounded-full border px-4 sm:px-6 shadow-xs transition-all"
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
              onClick={() => handleNav("/")}
              className="flex items-center gap-2 select-none flex-shrink-0 cursor-pointer focus:outline-none transition-transform hover:opacity-95"
              aria-label="ShopMind AI home"
            >
              <ShopMindLogo variant="full" size="sm" />
            </button>
          </div>

          {/* CENTER: Navigation Links (Home | Categories | Deals | Compare | About | Search icon) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5" role="navigation">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNav(item.href)}
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

            {/* Recognizable Search Icon Button immediately after About and before Cart */}
            <button
              type="button"
              onClick={() => handleNav("search-focus")}
              aria-label="Search products"
              title="Search products"
              className="group relative flex h-8.5 w-8.5 items-center justify-center rounded-full text-[#5A5248] transition-all duration-150 hover:bg-purple-50 hover:text-[#7C3AED] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Search className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
            </button>
          </nav>

          {/* RIGHT: Actions (Cart Button) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              aria-label="Cart"
              onClick={() => routerNavigate("/cart")}
              className="relative flex h-9.5 px-3.5 items-center gap-2 rounded-full border border-[#E8E2D9] bg-white text-[#5A5248] shadow-xs transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-[#7C3AED]"
            >
              <svg
                width="17"
                height="17"
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
              <span className="text-[13px] font-semibold">Cart</span>
            </button>
          </div>

          {/* Mobile Right: Search quick button & Hamburger Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleNav("search-focus")}
              aria-label="Search products"
              title="Search products"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#5A5248] transition hover:bg-purple-50 hover:text-[#7C3AED]"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#5A5248] transition hover:bg-purple-50"
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
                    handleNav(item.href);
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

            {/* Mobile Search Item */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleNav("search-focus");
              }}
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-[14px] font-medium text-[#5A5248] transition-all hover:bg-purple-50 hover:text-[#7C3AED]"
            >
              <Search className="h-4 w-4 text-[#7C3AED]" />
              <span>Search products</span>
            </button>

            <div className="mt-2 pt-2 border-t border-[#E8E2D9]">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  routerNavigate("/cart");
                }}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-[#E8E2D9] bg-white text-[#5A5248] text-[13.5px] font-semibold transition hover:bg-purple-50 hover:text-[#7C3AED]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>View Cart</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

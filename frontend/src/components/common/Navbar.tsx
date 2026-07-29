import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100/60 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Left — Logo */}
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="flex items-center gap-2.5 select-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z"
                fill="white"
                strokeWidth="0"
              />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">
            ShopMind AI
          </span>
        </button>

        {/* Center — Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {["Home", "Products", "Categories"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => window.location.assign(item === "Home" ? "/" : item === "Products" ? "/products" : "/categories")}
              className="rounded-lg px-4 py-2 text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right — Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cart */}
          <button
            aria-label="Cart"
            onClick={() => window.location.assign("/cart")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>

          {/* Sign In */}
          <button className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13.5px] font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50">
            Sign in
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/90 backdrop-blur-xl px-6 py-4 flex flex-col gap-1">
          {["Home", "Products", "Categories"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => window.location.assign(item === "Home" ? "/" : item === "Products" ? "/products" : "/categories")}
              className="rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              {item}
            </button>
          ))}
          <div className="mt-3 flex gap-2">
            <button className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-[13.5px] font-medium text-gray-700 hover:bg-gray-50 transition">
              Sign in
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

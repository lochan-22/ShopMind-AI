import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { Logo, LogoMark } from "../brand/Logo";
import { useCart } from "../../contexts/CartContext";
import { useAgent } from "../../agent/AgentContext";
import { cn } from "../../utils/cn";
import { SearchOverlay } from "./SearchOverlay";

export const NAV_LINKS = [
  { label: "Collections", to: "/categories" },
  { label: "Live Market", to: "/deals" },
  { label: "Compare", to: "/compare" },
  { label: "Concierge", to: "/agent" },
  { label: "About", to: "/about" },
];

const MobileMenu = ({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) => {
  const { totalQuantity } = useCart();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;

  return createPortal(
    <div className="fade-in fixed inset-0 z-[60] flex flex-col bg-paper lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Link to="/" onClick={onClose} aria-label="ShopMind AI home">
          <Logo framed />
        </Link>
        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-line" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          onClose();
          onSearch();
        }}
        className="mx-5 mt-8 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-left text-[15px] text-faint"
      >
        <Search className="h-4 w-4" /> Describe what you need…
      </button>
      <nav className="mt-6 flex flex-col px-5" aria-label="Mobile">
        {[{ label: "Home", to: "/" }, ...NAV_LINKS, { label: `Cart${totalQuantity ? ` (${totalQuantity})` : ""}`, to: "/cart" }].map((link, index) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "rise-in flex items-center justify-between border-b border-line py-4 text-[1.6rem] font-medium tracking-tight",
                isActive ? "text-ink" : "text-ink/55",
              )
            }
            style={{ ["--rise-index" as string]: index }}
          >
            {link.label}
            <ArrowRight className="h-5 w-5 text-faint" />
          </NavLink>
        ))}
      </nav>
      <p className="mt-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-faint">Live prices · Honest analysis · No invented specs</p>
    </div>,
    document.body,
  );
};

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalQuantity } = useCart();
  const { openAgent } = useAgent();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
        <div
          className={cn(
            "mx-auto flex h-14 max-w-[1240px] items-center gap-2 rounded-full border pl-4 pr-2 transition-[background-color,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] sm:pl-5",
            scrolled
              ? "border-line/80 bg-surface/80 shadow-[0_12px_40px_-20px_rgb(11_13_16/0.35)] backdrop-blur-xl"
              : "border-line/60 bg-surface/70 backdrop-blur-lg",
          )}
        >
          <Link to="/" className="-ml-2 mr-2 shrink-0 rounded-full sm:-ml-3" aria-label="ShopMind AI home">
            <LogoMark className="h-10 w-10 sm:hidden" />
            <span className="hidden sm:block">
              <Logo framed />
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-full px-3.5 py-2 text-[13.5px] transition-colors duration-300",
                    isActive ? "bg-sunken text-ink" : "text-muted hover:text-ink",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-2.5 rounded-full border border-line bg-paper/70 pl-3.5 pr-2 text-[13px] text-faint transition-colors hover:border-line-strong hover:text-muted md:flex"
              aria-label="Search products"
            >
              <Search className="h-4 w-4" />
              <span className="pr-6">Search anything</span>
              <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">Ctrl K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-sunken md:hidden"
              aria-label="Search products"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-sunken" aria-label={`Cart, ${totalQuantity} items`}>
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalQuantity > 0 && (
                <span key={totalQuantity} className="pop-in tabular absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-jade-600 px-1 text-[10px] font-semibold text-white">
                  {totalQuantity > 99 ? "99+" : totalQuantity}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={openAgent}
              className="hidden h-10 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white transition-colors hover:bg-jade-700 sm:flex"
            >
              <Sparkles className="h-3.5 w-3.5 text-jade-300" />
              Ask ShopMind
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-sunken lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} onSearch={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
};

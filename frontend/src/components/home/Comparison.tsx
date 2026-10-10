import React from "react";
import { X, Check } from "lucide-react";
import { useInView } from "./useInView";
import ShopMindText from "../common/ShopMindText";
import { ShoppingCartDoodle, SmartShoppingBadge } from "../common/DecorativeAnnotations";

interface ComparisonRow {
  traditional: string;
  ai: string;
}

const ROWS: ComparisonRow[] = [
  {
    traditional: "Search keywords manually across multiple tabs",
    ai: "Describe what you want naturally — AI extracts intent",
  },
  {
    traditional: "Browse hundreds of cluttered sponsored listings",
    ai: "Live SerpApi search filters directly for real products",
  },
  {
    traditional: "Manually track fluctuating prices on different sites",
    ai: "Automatic multi-seller offer discovery & best-price highlight",
  },
  {
    traditional: "Open tabs to manually compare specs and reviews",
    ai: "Side-by-side spec comparison table with AI recommendation",
  },
  {
    traditional: "Guess whether a seller offer is genuine or in-stock",
    ai: "Live stock status and transparent seller breakdowns",
  },
  {
    traditional: "Get lost in checkout funnels and affiliate traps",
    ai: "Direct link to the exact seller product offer page",
  },
];

const Comparison: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* ── Background Atmospheric Dotted Grid & Arcs ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Atmospheric glow blobs */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #E9D5FF 0%, #C4B5FD 50%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #FED7AA 0%, #FB923C 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Side Doodles in Margins */}
      <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
        <SmartShoppingBadge />
      </div>

      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
        <ShoppingCartDoodle />
      </div>

      <div ref={ref} className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]"
          >
            The Modern Difference
          </span>
          <h2
            className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]"
          >
            Why Switch to <ShopMindText />?
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7A7068]">
            See how smart live discovery turns what you describe into your best shopping deal.
          </p>
        </div>

        {/* 2-Column Comparison Container with High Visual Rhythm */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Traditional Shopping Card */}
          <div
            style={{
              boxShadow: "0 4px 20px rgba(13, 11, 30, 0.04)",
            }}
            className={`rounded-3xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 backdrop-blur-md transition-all duration-700 ease-out hover:shadow-lg ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#A89F95]">
                Traditional Shopping
              </h3>
              <span className="rounded-full bg-[#F5F0E8] px-2.5 py-0.5 text-[10px] font-bold text-[#7A7068]">
                Manual &amp; Slow
              </span>
            </div>

            <ul className="mt-6 flex flex-col gap-4">
              {ROWS.map((row) => (
                <li key={row.traditional} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
                    <X className="h-3 w-3 text-[#DC2626]" strokeWidth={2.5} />
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed text-[#7A7068]">
                    {row.traditional}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ShopMind AI Card */}
          <div
            style={{
              transitionDelay: inView ? "120ms" : "0ms",
              background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4C1D95 100%)",
              boxShadow: "0 16px 40px rgba(124, 58, 237, 0.35)",
            }}
            className={`relative overflow-hidden rounded-3xl border border-[#9333EA] p-6 sm:p-8 transition-all duration-700 ease-out hover:shadow-2xl hover:scale-[1.01] ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Background Glow Blobs */}
            <span className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl select-none" />
            <span className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-orange-400/20 blur-2xl select-none" />

            <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
                <ShopMindText light />
              </h3>
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                All • Live Deals
              </span>
            </div>

            <ul className="relative z-10 mt-6 flex flex-col gap-4">
              {ROWS.map((row) => (
                <li key={row.ai} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/25">
                    <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed text-white">
                    {row.ai}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
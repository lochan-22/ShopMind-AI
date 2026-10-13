import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useInView } from "./useInView";
import { MAIN_CATEGORIES } from "../../data/categoryData";

/* Per-category accent colors */
const CATEGORY_ACCENTS: Array<{ bg: string; border: string; text: string; glow: string }> = [
  { bg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)", border: "#C4B5FD", text: "#6D28D9", glow: "rgba(124, 58, 237, 0.15)" },
  { bg: "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)", border: "#FDBA74", text: "#C2410C", glow: "rgba(234, 88, 12, 0.15)" },
  { bg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", border: "#FCD34D", text: "#D97706", glow: "rgba(217, 119, 6, 0.15)" },
  { bg: "linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)", border: "#93C5FD", text: "#1D4ED8", glow: "rgba(29, 78, 216, 0.15)" },
  { bg: "linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)", border: "#F472B6", text: "#BE185D", glow: "rgba(190, 24, 93, 0.15)" },
  { bg: "linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 100%)", border: "#86EFAC", text: "#15803D", glow: "rgba(21, 128, 61, 0.15)" },
  { bg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)", border: "#FED7AA", text: "#C2410C", glow: "rgba(194, 65, 12, 0.15)" },
  { bg: "linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)", border: "#FCA5A5", text: "#B91C1C", glow: "rgba(185, 28, 28, 0.15)" },
  { bg: "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)", border: "#FCD34D", text: "#B45309", glow: "rgba(180, 83, 9, 0.15)" },
  { bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", border: "#BBF7D0", text: "#15803D", glow: "rgba(21, 128, 61, 0.15)" },
  { bg: "linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)", border: "#C4B5FD", text: "#6D28D9", glow: "rgba(109, 40, 217, 0.15)" },
];

const Categories: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full py-20 overflow-hidden border-b border-[#E8E2D9]/60"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      {/* ── Background Atmosphere & Technical Arcs ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #FED7AA 0%, #FB923C 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #DDD6FE 0%, #A855F7 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]"
          >
            Browse All Departments
          </span>
          <h2
            className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]"
          >
            Shop Across Categories
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7A7068]">
            Explore all {MAIN_CATEGORIES.length} live shopping departments and hundreds of subcategories.
          </p>
        </div>

        {/* 11 Department Cards Grid — 2-col mobile / 3-col tablet / 4-col desktop */}
        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {MAIN_CATEGORIES.map((category, index) => {
            const accent = CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => navigate(`/categories/${category.slug}`)}
                style={{
                  transitionDelay: inView ? `${index * 25}ms` : "0ms",
                  boxShadow: "0 2px 10px rgba(13, 11, 30, 0.04)",
                }}
                className={`group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-[#E8E2D9] bg-white/95 px-4 py-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-xl ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                {/* Emoji Icon Container */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: accent.bg,
                    boxShadow: `0 4px 12px ${accent.glow}`,
                  }}
                >
                  <span>{category.emoji}</span>
                </div>

                {/* Title & Count */}
                <div className="flex flex-col items-center">
                  <span
                    className="text-sm font-bold leading-tight text-[#0D0B1E] line-clamp-2 group-hover:text-[#7C3AED] transition-colors"
                  >
                    {category.label}
                  </span>
                  <span className="mt-0.5 text-[11px] text-[#A89F95]">
                    {category.subcategories.length} subcategories
                  </span>
                </div>

                {/* Hover indicator arrow */}
                <ArrowRight
                  className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                  style={{ color: accent.text }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
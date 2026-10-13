import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";
import { MAIN_CATEGORIES } from "../data/categoryData";

/**
 * Level 1 — Main Categories page.
 * Shows every top-level shopping department. No SerpApi call is made here.
 * Clicking a category navigates to /categories/:slug (Level 2 — subcategories).
 */
const Categories: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageBackground>
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
            >
              <LayoutGrid className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "#7C3AED" }}
            >
              All Departments
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "#0D0B1E" }}
          >
            Shop by Category
          </h1>
          <p className="mt-2 text-base" style={{ color: "#7A7068" }}>
            Discover live product listings across every major department
          </p>
        </div>

        {/* Decorative curved divider */}
        <svg
          aria-hidden="true"
          className="mb-8 w-full opacity-30"
          height="2"
          viewBox="0 0 800 2"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0" y1="1" x2="800" y2="1"
            stroke="url(#divGrad)"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="divGrad">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="30%" stopColor="#7C3AED" stopOpacity="1" />
              <stop offset="70%" stopColor="#F97316" stopOpacity="1" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Main category grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MAIN_CATEGORIES.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => navigate(`/categories/${category.slug}`)}
              className="group flex flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #FDFAF7 100%)",
                border: "1.5px solid #E8E2D9",
                boxShadow: "0 2px 8px rgba(13,11,30,0.05)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = "#C4B5FD";
                el.style.boxShadow = "0 8px 24px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.10)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = "#E8E2D9";
                el.style.boxShadow = "0 2px 8px rgba(13,11,30,0.05)";
              }}
            >
              {/* Emoji icon */}
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform duration-200 group-hover:scale-110"
                  style={{ background: "linear-gradient(135deg, #F5F3FF, #FFF7ED)" }}
                  aria-hidden="true"
                >
                  {category.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold truncate" style={{ color: "#0D0B1E" }}>
                    {category.label}
                  </h2>
                  <p className="text-[11px] mt-0.5" style={{ color: "#A89F95" }}>
                    {category.subcategories.length} subcategories
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#7A7068" }}>
                {category.description}
              </p>

              {/* CTA row */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide transition-colors"
                  style={{ color: "#7C3AED" }}
                >
                  Browse →
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: "#EDE9FE", color: "#7C3AED" }}
                >
                  Live results
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </PageBackground>
  );
};

export default Categories;


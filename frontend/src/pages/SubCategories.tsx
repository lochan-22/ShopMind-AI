import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, AlertTriangle } from "lucide-react";
import Navbar from "../components/common/Navbar";
import PageBackground from "../components/common/PageBackground";
import { findMainCategory } from "../data/categoryData";

/**
 * Level 2 — Subcategories page.
 * Route: /categories/:mainCategory
 */
const SubCategories: React.FC = () => {
  const { mainCategory = "" } = useParams<{ mainCategory: string }>();
  const navigate = useNavigate();

  const category = findMainCategory(mainCategory);

  return (
    <PageBackground>
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/categories")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 hover:-translate-y-px"
          style={{
            background: "#FFFFFF",
            borderColor: "#E8E2D9",
            color: "#5A5248",
            boxShadow: "0 1px 4px rgba(13,11,30,0.06)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </button>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-1.5 text-xs"
          style={{ color: "#A89F95" }}
        >
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="transition-colors hover:underline"
            style={{ color: "#7C3AED" }}
          >
            Categories
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold" style={{ color: "#0D0B1E" }}>
            {category ? `${category.emoji} ${category.label}` : mainCategory}
          </span>
        </nav>

        {/* Unknown category */}
        {!category && (
          <div
            className="flex flex-col items-center justify-center rounded-3xl border py-20 text-center"
            style={{
              background: "#FFF5F5",
              borderColor: "#FECACA",
              boxShadow: "0 4px 20px rgba(220,38,38,0.08)",
            }}
          >
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="mt-4 text-sm font-semibold" style={{ color: "#DC2626" }}>
              Category not found.
            </p>
            <button
              type="button"
              onClick={() => navigate("/categories")}
              className="mt-4 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
            >
              Back to Categories
            </button>
          </div>
        )}

        {/* Subcategory grid */}
        {category && (
          <>
            {/* Page header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: "linear-gradient(135deg, #EDE9FE, #FFF7ED)" }}
                >
                  {category.emoji}
                </span>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: "#7C3AED" }}
                  >
                    {category.label}
                  </p>
                  <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight"
                    style={{ color: "#0D0B1E" }}
                  >
                    Shop by Subcategory
                  </h1>
                </div>
              </div>
            </div>

            {/* Decorative divider */}
            <svg
              aria-hidden="true"
              className="mb-8 w-full opacity-25"
              height="2"
              viewBox="0 0 800 2"
              preserveAspectRatio="none"
            >
              <line
                x1="0" y1="1" x2="800" y2="1"
                stroke="url(#divGrad2)"
                strokeWidth="2"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="divGrad2">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
                  <stop offset="40%" stopColor="#7C3AED" stopOpacity="1" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {category.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => navigate(`/categories/${category.slug}/${sub.slug}`)}
                  className="group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF, #FDFAF7)",
                    border: "1.5px solid #E8E2D9",
                    boxShadow: "0 1px 4px rgba(13,11,30,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "#C4B5FD";
                    el.style.boxShadow = "0 6px 20px rgba(124,58,237,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "#E8E2D9";
                    el.style.boxShadow = "0 1px 4px rgba(13,11,30,0.04)";
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#A89F95" }}
                  >
                    Browse
                  </span>
                  <h2
                    className="text-sm font-semibold leading-tight transition-colors group-hover:text-purple-700"
                    style={{ color: "#0D0B1E" }}
                  >
                    {sub.label}
                  </h2>
                  <span
                    className="mt-auto text-[11px] font-medium transition-colors group-hover:text-purple-600"
                    style={{ color: "#A89F95" }}
                  >
                    Live products →
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </PageBackground>
  );
};

export default SubCategories;


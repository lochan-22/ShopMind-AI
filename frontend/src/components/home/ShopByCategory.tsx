import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { useInView } from "./useInView";

interface CategoryItem {
  slug: string;
  name: string;
  subCount: string;
  badgeBg: string;
  badgeBorder: string;
  accentColor: string;
  imageUrl: string;
  fallbackEmoji: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    slug: "electronics",
    name: "Electronics",
    subCount: "17 categories",
    badgeBg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
    badgeBorder: "#C4B5FD",
    accentColor: "#7C3AED",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🎧",
  },
  {
    slug: "fashion",
    name: "Fashion",
    subCount: "12 categories",
    badgeBg: "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)",
    badgeBorder: "#FDBA74",
    accentColor: "#EA580C",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🧥",
  },
  {
    slug: "home-kitchen",
    name: "Home & Living",
    subCount: "11 categories",
    badgeBg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
    badgeBorder: "#FCD34D",
    accentColor: "#D97706",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🛋️",
  },
  {
    slug: "footwear",
    name: "Footwear",
    subCount: "8 categories",
    badgeBg: "linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)",
    badgeBorder: "#93C5FD",
    accentColor: "#2563EB",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "👟",
  },
  {
    slug: "beauty",
    name: "Beauty & Personal Care",
    subCount: "7 categories",
    badgeBg: "linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)",
    badgeBorder: "#F472B6",
    accentColor: "#DB2777",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "💄",
  },
  {
    slug: "sports",
    name: "Sports & Fitness",
    subCount: "8 categories",
    badgeBg: "linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 100%)",
    badgeBorder: "#86EFAC",
    accentColor: "#16A34A",
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🏋️",
  },
  {
    slug: "automotive",
    name: "Automotive",
    subCount: "6 categories",
    badgeBg: "linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)",
    badgeBorder: "#FCA5A5",
    accentColor: "#DC2626",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🚗",
  },
  {
    slug: "books",
    name: "Books & Education",
    subCount: "5 categories",
    badgeBg: "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)",
    badgeBorder: "#FCD34D",
    accentColor: "#B45309",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "📚",
  },
  {
    slug: "baby-kids",
    name: "Baby & Kids",
    subCount: "6 categories",
    badgeBg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
    badgeBorder: "#FED7AA",
    accentColor: "#EA580C",
    imageUrl: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🧸",
  },
  {
    slug: "pets",
    name: "Pet Supplies",
    subCount: "5 categories",
    badgeBg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    badgeBorder: "#BBF7D0",
    accentColor: "#15803D",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🐕",
  },
  {
    slug: "smart-tech",
    name: "Smart Tech & Toys",
    subCount: "6 categories",
    badgeBg: "linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)",
    badgeBorder: "#C4B5FD",
    accentColor: "#7C3AED",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80",
    fallbackEmoji: "🤖",
  },
];

const ShopByCategory: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full py-14 overflow-hidden border-b border-[#E8E2D9]/70"
      style={{ backgroundColor: "#F8F4EE" }}
    >
      {/* Subtle dotted background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.10) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0B1E]">
              Shop by Category
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#7A7068]">
              Explore top categories and find the best products with AI.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
          >
            View All Categories
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Categories Responsive Grid — 2-col mobile / 3-col tablet / 5-col desktop */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => navigate(`/categories/${cat.slug}`)}
              style={{
                transitionDelay: inView ? `${idx * 25}ms` : "0ms",
                boxShadow: "0 2px 8px rgba(13,11,30,0.04)",
              }}
              className={`group relative flex flex-col items-center rounded-2xl border border-[#E8E2D9] bg-white p-3 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Product preview box */}
              <div
                className="relative flex h-28 sm:h-32 w-full items-center justify-center overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105"
                style={{ background: cat.badgeBg }}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    e.currentTarget.style.display = "none";
                  }}
                  className="h-full w-full object-cover mix-blend-multiply opacity-95 transition-transform duration-300 group-hover:scale-110"
                />
                <span className="absolute text-2xl pointer-events-none opacity-0" aria-hidden="true">
                  {cat.fallbackEmoji}
                </span>
              </div>

              {/* Title & Count */}
              <div className="mt-2.5 flex w-full flex-col items-center">
                <span className="text-[13px] sm:text-[14px] font-bold leading-tight text-[#0D0B1E] line-clamp-2 group-hover:text-[#7C3AED] transition-colors">
                  {cat.name}
                </span>
                <span className="mt-0.5 text-[11px] text-[#A89F95]">
                  {cat.subCount}
                </span>
              </div>

              {/* Mini Plus Button */}
              <div
                className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#EDE9FE] text-[#7C3AED] transition-all duration-200 group-hover:bg-[#7C3AED] group-hover:text-white"
              >
                <Plus className="h-3 w-3" strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;

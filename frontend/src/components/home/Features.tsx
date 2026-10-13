import React from "react";
import {
  Bot,
  SearchCheck,
  Sparkles,
  Tag,
  GitCompare,
  MessageCircle,
  Store,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";
import ShopMindText from "../common/ShopMindText";
import { LaptopDoodle, HeadphonesDoodle, FindDealsBadge } from "../common/DecorativeAnnotations";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  iconBg: string;
  iconColor: string;
  glowColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: Bot,
    title: "AI Shopping Assistant",
    description: "Understand natural-language shopping requests and turn them into targeted product queries.",
    iconBg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
    iconColor: "#7C3AED",
    glowColor: "rgba(124, 58, 237, 0.18)",
  },
  {
    icon: SearchCheck,
    title: "Live Product Search",
    description: "Discover live product listings fetched in real-time via SerpApi & Google Shopping.",
    iconBg: "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)",
    iconColor: "#EA580C",
    glowColor: "rgba(234, 88, 12, 0.18)",
  },
  {
    icon: Sparkles,
    title: "Smart Discovery",
    description: "Find matching products with exact specs, reviews, and ratings instead of endless scrolling.",
    iconBg: "linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)",
    iconColor: "#6D28D9",
    glowColor: "rgba(109, 40, 217, 0.18)",
  },
  {
    icon: Tag,
    title: "Price Comparison",
    description: "Compare prices across all discovered sellers and highlight the absolute best price.",
    iconBg: "linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)",
    iconColor: "#DC2626",
    glowColor: "rgba(220, 38, 38, 0.18)",
  },
  {
    icon: GitCompare,
    title: "Side-by-Side Comparison",
    description: "Compare any two live products side-by-side with spec breakdowns and AI recommendation.",
    iconBg: "linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)",
    iconColor: "#4F46E5",
    glowColor: "rgba(79, 70, 229, 0.18)",
  },
  {
    icon: MessageCircle,
    title: "AI Explanation",
    description: "Get concise breakdowns of pros, cons, and key differences in plain language.",
    iconBg: "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)",
    iconColor: "#D97706",
    glowColor: "rgba(217, 119, 6, 0.18)",
  },
  {
    icon: Store,
    title: "Multi-Seller Offers",
    description: "View all available retailers, stock availability, and shipping notes in one transparent view.",
    iconBg: "linear-gradient(135deg, #F0FDFA 0%, #99F6E4 100%)",
    iconColor: "#0D9488",
    glowColor: "rgba(13, 148, 136, 0.18)",
  },
  {
    icon: ExternalLink,
    title: "Direct Store Links",
    description: (
      <>
        <ShopMindText showAi={false} /> links directly to the exact seller offer page for seamless checkout.
      </>
    ),
    iconBg: "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)",
    iconColor: "#C2410C",
    glowColor: "rgba(194, 65, 12, 0.18)",
  },
];

const Features: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      className="relative w-full py-20 overflow-hidden border-b border-[#E8E2D9]/60"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      {/* ── Background Atmosphere & Dotted Grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Ambient peach glow blob (left) */}
      <div
        className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #FED7AA 0%, #FB923C 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Ambient lavender glow blob (right) */}
      <div
        className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full opacity-25 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #DDD6FE 0%, #A855F7 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Technical curved arc in background */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-10 select-none"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M0 450 C 350 400, 600 520, 950 460 C 1200 420, 1350 500, 1440 460"
          stroke="#7C3AED"
          strokeWidth="1.2"
          strokeDasharray="6 6"
        />
        <circle cx="220" cy="180" r="16" stroke="#7C3AED" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="1280" cy="380" r="22" stroke="#F97316" strokeWidth="0.8" strokeDasharray="4 4" />
      </svg>

      {/* ── Decorative Drawings in Margins ── */}
      <div className="absolute left-2 sm:left-6 top-1/3 hidden xl:block pointer-events-none">
        <LaptopDoodle />
      </div>

      <div className="absolute right-4 sm:right-10 top-1/4 hidden xl:block pointer-events-none">
        <HeadphonesDoodle />
      </div>

      <div className="absolute right-2 sm:right-6 top-2/3 hidden xl:block pointer-events-none">
        <FindDealsBadge />
      </div>

      {/* ── Main Content Container ── */}
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
            Built for Modern Shoppers
          </span>
          <h2
            className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]"
          >
            Core Capabilities
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7A7068]">
            Smart tools designed to simplify your shopping decisions and save you money.
          </p>
        </div>

        {/* 8 Feature Cards Grid (2 rows of 4) */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                style={{
                  transitionDelay: inView ? `${idx * 40}ms` : "0ms",
                  boxShadow: "0 2px 12px rgba(13, 11, 30, 0.04)",
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border border-[#E8E2D9] bg-white/95 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-xl ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                {/* Decorative technical crosshair in corner */}
                <span
                  className="pointer-events-none absolute top-3 right-3 text-[10px] font-mono opacity-20 group-hover:opacity-70 transition-opacity"
                  style={{ color: feat.iconColor }}
                >
                  +
                </span>

                <div>
                  {/* Icon Box */}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: feat.iconBg,
                      boxShadow: `0 4px 14px ${feat.glowColor}`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feat.iconColor }} strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-sm sm:text-base font-bold text-[#0D0B1E] group-hover:text-[#7C3AED] transition-colors">
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-[#7A7068]">
                    {feat.description}
                  </p>
                </div>

                {/* Subtle bottom accent line on hover */}
                <div
                  className="mt-4 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full"
                  style={{ background: feat.iconColor }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
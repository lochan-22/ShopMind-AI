import React from "react";
import { Search, Scale, Bot, Zap } from "lucide-react";

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  glowColor: string;
  badgeAccent: string;
}

const BENEFITS: BenefitItem[] = [
  {
    icon: <Search className="h-5 w-5" strokeWidth={2.2} />,
    title: "Find Faster",
    desc: "Search in natural language",
    iconBg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
    iconColor: "#7C3AED",
    glowColor: "rgba(124, 58, 237, 0.15)",
    badgeAccent: "#7C3AED",
  },
  {
    icon: <Scale className="h-5 w-5" strokeWidth={2.2} />,
    title: "Compare Better",
    desc: "Compare products and seller prices",
    iconBg: "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)",
    iconColor: "#EA580C",
    glowColor: "rgba(234, 88, 12, 0.15)",
    badgeAccent: "#EA580C",
  },
  {
    icon: <Bot className="h-5 w-5" strokeWidth={2.2} />,
    title: "AI Recommendations",
    desc: "Get personalized suggestions",
    iconBg: "linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)",
    iconColor: "#6D28D9",
    glowColor: "rgba(109, 40, 217, 0.15)",
    badgeAccent: "#6D28D9",
  },
  {
    icon: <Zap className="h-5 w-5" strokeWidth={2.2} />,
    title: "Shop Smarter",
    desc: "Reach the best deals faster",
    iconBg: "linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)",
    iconColor: "#4F46E5",
    glowColor: "rgba(79, 70, 229, 0.15)",
    badgeAccent: "#4F46E5",
  },
];

export const FeatureStrip: React.FC = () => {
  return (
    <section className="relative w-full border-b border-[#E8E2D9] py-8 overflow-hidden bg-white">
      {/* ── Background Atmosphere & Technical Details ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 select-none"
        style={{
          backgroundColor: "#FFFFFF",
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.08) 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Subtle atmospheric peach & purple glow blobs */}
      <div
        className="pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 h-44 w-44 rounded-full opacity-25 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #FED7AA 0%, #FB923C 50%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 h-44 w-44 rounded-full opacity-25 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #DDD6FE 0%, #A855F7 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* ── Content Container ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item) => (
            <div
              key={item.title}
              className="group relative flex items-center gap-3.5 rounded-2xl border border-[#E8E2D9] bg-white/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg"
              style={{
                boxShadow: "0 2px 10px rgba(13, 11, 30, 0.04)",
              }}
            >
              {/* Decorative technical corner crosshair */}
              <span
                className="pointer-events-none absolute top-2 right-2.5 text-[9px] font-mono opacity-20 group-hover:opacity-60 transition-opacity"
                style={{ color: item.badgeAccent }}
              >
                +
              </span>

              {/* Glowing Icon Container */}
              <div
                className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-108"
                style={{
                  background: item.iconBg,
                  color: item.iconColor,
                  boxShadow: `0 4px 14px ${item.glowColor}`,
                }}
              >
                {item.icon}
              </div>

              {/* Benefit Text Content */}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#0D0B1E] group-hover:text-[#7C3AED] transition-colors">
                  {item.title}
                </span>
                <span className="mt-0.5 text-xs text-[#7A7068] leading-tight">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureStrip;


import React from "react";
import {
  Mic2,
  LineChart,
  Heart,
  Brain,
  Bell,
  Truck,
  Bot,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";
import ShopMindText from "../common/ShopMindText";

interface FutureFeature {
  icon: LucideIcon;
  title: string;
}

const FEATURES: FutureFeature[] = [
  { icon: Mic2, title: "Voice Shopping Assistant" },
  { icon: LineChart, title: "Historical Price Tracking" },
  { icon: Heart, title: "Smart Universal Wishlist" },
  { icon: Brain, title: "Personal AI Shopping Memory" },
  { icon: Bell, title: "Price Drop Notifications" },
  { icon: Truck, title: "Unified Order Tracking" },
  { icon: Bot, title: "Autonomous Deal Matcher" },
  { icon: Percent, title: "AI Coupon & Discount Finder" },
];

const FutureFeatures: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      className="relative w-full py-20 overflow-hidden border-b border-[#E8E2D9]/70"
      style={{ backgroundColor: "#F8F5F0" }}
    >
      {/* ── Background Dotted Grid & Atmospheric Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full opacity-20 blur-3xl select-none"
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
            Roadmap
          </span>
          <h2
            className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]"
          >
            What's Coming Next
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7A7068]">
            Exciting capabilities scheduled on the <ShopMindText /> product roadmap.
          </p>
        </div>

        {/* 8 Dashed Roadmap Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                style={{
                  transitionDelay: inView ? `${idx * 40}ms` : "0ms",
                }}
                className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#DDD6FE] bg-white/75 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-solid hover:border-purple-400 hover:bg-white hover:shadow-xl ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                {/* Coming Soon Pill */}
                <span
                  className="rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#7C3AED]"
                >
                  Coming Soon
                </span>

                {/* Icon Circle Container with Purple Glow */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] text-[#7C3AED] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md"
                  style={{ boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)" }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.9} />
                </div>

                {/* Feature Title */}
                <h3 className="text-xs sm:text-sm font-bold leading-tight text-[#0D0B1E] group-hover:text-[#7C3AED] transition-colors">
                  {feat.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FutureFeatures;
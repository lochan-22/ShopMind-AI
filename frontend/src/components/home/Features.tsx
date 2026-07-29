import React from "react";
import {
  Bot,
  Mic,
  GitCompare,
  Sparkles,
  SearchCheck,
  Navigation,
  MessageCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  { icon: Bot, title: "AI Shopping Agent", description: "A dedicated agent that understands your needs and shops on your behalf." },
  { icon: Mic, title: "Voice Shopping", description: "Speak your request naturally and let ShopMind AI take it from there." },
  { icon: GitCompare, title: "Product Comparison", description: "Instantly compare specs, prices, and ratings side by side." },
  { icon: Sparkles, title: "Personalized Recommendations", description: "Suggestions tuned to your budget, brand, and preferences." },
  { icon: SearchCheck, title: "Smart Search", description: "Understands intent, not just keywords, for more relevant results." },
  { icon: Navigation, title: "Automatic Navigation", description: "Jumps straight to the right product pages without manual browsing." },
  { icon: MessageCircle, title: "AI Product Explanation", description: "Clear, plain-language reasoning behind every recommendation." },
  { icon: Zap, title: "Fast Product Discovery", description: "Find the right option in seconds, not endless scrolling." },
];

const Features: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-gradient-to-b from-white via-indigo-50/40 to-white py-20">
      <div ref={ref} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Features
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            Everything ShopMind AI brings to your shopping experience, built in.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                style={{ transitionDelay: inView ? `${index * 60}ms` : "0ms" }}
                className={`group flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-200/50 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-sm shadow-indigo-300/40 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-4.5 w-4.5 h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
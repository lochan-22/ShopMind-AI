import React from "react";
import {
  Mic2,
  LineChart,
  Heart,
  Brain,
  Bell,
  Truck,
  Store,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";

interface FutureFeature {
  icon: LucideIcon;
  title: string;
}

const futureFeatures: FutureFeature[] = [
  { icon: Mic2, title: "Voice AI" },
  { icon: LineChart, title: "Price Tracking" },
  { icon: Heart, title: "Wishlist" },
  { icon: Brain, title: "Personal AI Shopping Memory" },
  { icon: Bell, title: "Smart Notifications" },
  { icon: Truck, title: "Order Tracking" },
  { icon: Store, title: "Multi-store Price Comparison" },
  { icon: Percent, title: "AI Deals Finder" },
];

const FutureFeatures: React.FC = () => {
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
            Future Features
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            What's coming next as ShopMind AI keeps getting smarter.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {futureFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                style={{ transitionDelay: inView ? `${index * 60}ms` : "0ms" }}
                className={`group relative flex flex-col items-start gap-3 rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-5 shadow-sm backdrop-blur-sm transition-all duration-700 ease-out hover:-translate-y-1 hover:border-solid hover:shadow-lg hover:shadow-indigo-200/50 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <span className="absolute right-4 top-4 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-500">
                  Coming Soon
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-sm shadow-indigo-300/40 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-4.5 w-4.5 h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {feature.title}
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
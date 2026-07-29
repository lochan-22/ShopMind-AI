import React from "react";
import { X, Check } from "lucide-react";
import { useInView } from "./useInView";

interface ComparisonRow {
  traditional: string;
  ai: string;
}

const rows: ComparisonRow[] = [
  { traditional: "Search manually", ai: "AI understands intent" },
  { traditional: "Browse hundreds of listings", ai: "AI finds the best products" },
  { traditional: "Read specifications", ai: "AI summarizes for you" },
  { traditional: "Compare products yourself", ai: "AI compares automatically" },
  { traditional: "Click page after page", ai: "AI navigates automatically" },
  { traditional: "Add products manually", ai: "AI adds to cart" },
];

const Comparison: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-white/60 py-20">
      <div ref={ref} className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Why ShopMind AI?
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            The difference between shopping alone and shopping with an AI agent.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Traditional Shopping */}
          <div
            className={`rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm transition-all duration-700 ease-out sm:p-8 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Traditional Shopping
            </h3>
            <ul className="mt-6 flex flex-col gap-4">
              {rows.map((row) => (
                <li key={row.traditional} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  </span>
                  <span className="text-sm text-slate-500">{row.traditional}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ShopMind AI */}
          <div
            style={{ transitionDelay: inView ? "120ms" : "0ms" }}
            className={`relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 shadow-lg shadow-indigo-300/40 transition-all duration-700 ease-out sm:p-8 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <h3 className="relative text-sm font-semibold uppercase tracking-wide text-indigo-100">
              ShopMind AI
            </h3>
            <ul className="relative mt-6 flex flex-col gap-4">
              {rows.map((row) => (
                <li key={row.ai} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
                  </span>
                  <span className="text-sm font-medium text-white">{row.ai}</span>
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
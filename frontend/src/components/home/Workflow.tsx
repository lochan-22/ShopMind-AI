import React from "react";
import { useInView } from "./useInView";
import ShopMindText from "../common/ShopMindText";

interface WorkflowStep {
  stepNum: string;
  label: string;
  sublabel: string;
}

const STEPS: WorkflowStep[] = [
  { stepNum: "01", label: "User Request", sublabel: "Natural language query" },
  { stepNum: "02", label: "Intent Parsing", sublabel: "Extracts brand & budget" },
  { stepNum: "03", label: "Live Querying", sublabel: "Queries SerpApi engine" },
  { stepNum: "04", label: "Google Shopping", sublabel: "Fetches live market data" },
  { stepNum: "05", label: "Normalization", sublabel: "Standardizes schema" },
  { stepNum: "06", label: "Deduplication", sublabel: "Merges duplicate listings" },
  { stepNum: "07", label: "Product Cards", sublabel: "Renders live results" },
  { stepNum: "08", label: "Comparison", sublabel: "Side-by-side analysis" },
  { stepNum: "09", label: "Price Parsing", sublabel: "Finds lowest seller price" },
  { stepNum: "10", label: "ShopMind Page", sublabel: "Product details & offers" },
  { stepNum: "11", label: "Seller Link", sublabel: "Selects best deal URL" },
  { stepNum: "12", label: "Store Purchase", sublabel: "Checkout on retailer site" },
];

const Workflow: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* ── Background Technical Atmosphere ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Ambient gradient glow */}
      <div
        className="pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl select-none"
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
            Under the Hood
          </span>
          <h2
            className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]"
          >
            The <ShopMindText /> Architecture
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7A7068]">
            Transparent 12-step pipeline powering real-time product discovery.
          </p>
        </div>

        {/* 12-Step Responsive Pipeline Grid */}
        <div className="relative mt-14">
          {/* Subtle horizontal timeline track behind cards on desktop */}
          <div
            className="pointer-events-none absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 opacity-25 hidden xl:block"
            style={{
              background: "linear-gradient(90deg, #7C3AED 0%, #EA580C 50%, #7C3AED 100%)",
            }}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
            {STEPS.map((step, idx) => {
              const isOrange = idx % 2 !== 0;
              const accentColor = isOrange ? "#EA580C" : "#7C3AED";
              const accentBg = isOrange
                ? "linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)"
                : "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)";

              return (
                <div
                  key={step.stepNum}
                  style={{
                    transitionDelay: inView ? `${idx * 25}ms` : "0ms",
                    boxShadow: "0 2px 10px rgba(13, 11, 30, 0.04)",
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-[#E8E2D9] bg-white/95 p-3.5 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-lg ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >
                  {/* Subtle top indicator dot */}
                  <span
                    className="mx-auto mb-2 h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{ background: accentColor }}
                  />

                  <div>
                    {/* Step Number Tag */}
                    <div
                      className="inline-flex rounded-lg px-2 py-0.5 text-xs font-black tracking-wider transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: accentBg,
                        color: accentColor,
                      }}
                    >
                      {step.stepNum}
                    </div>

                    <h3 className="mt-2 text-[11.5px] font-bold leading-tight text-[#0D0B1E]">
                      {step.label}
                    </h3>
                  </div>

                  <p className="mt-1.5 text-[9.5px] text-[#A89F95] leading-snug">
                    {step.sublabel}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
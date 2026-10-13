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
    <section
      className="relative w-full py-20 overflow-hidden border-b border-[#E8E2D9]/70"
      style={{ background: "linear-gradient(180deg, #F5F0FB 0%, #FAF7F2 100%)" }}
    >
      {/* ── Background Technical Atmosphere ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Subtle background workflow connector lines & directional arrows behind cards */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25 select-none hidden lg:block"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <marker id="wf-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A78BFA" />
          </marker>
        </defs>
        <path
          d="M 120 280 L 800 280"
          stroke="#DDD6FE"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          markerEnd="url(#wf-arrow)"
        />
        <path
          d="M 800 480 L 120 480"
          stroke="#DDD6FE"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          markerEnd="url(#wf-arrow)"
        />
      </svg>

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

        {/* 12-Step Responsive Pipeline Grid — 1-col mobile / 2-col tablet / 3-col desktop */}
        <div className="relative mt-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                  className={`group relative flex flex-col justify-between rounded-2xl border border-[#E8E2D9] bg-white/95 p-4 sm:p-5 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-lg ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >
                  {/* Subtle top indicator dot */}
                  <span
                    className="mx-auto mb-2.5 h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-150"
                    style={{ background: accentColor }}
                  />

                  <div>
                    {/* Step Number Tag */}
                    <div
                      className="inline-flex rounded-lg px-2.5 py-0.5 text-xs font-black tracking-wider transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: accentBg,
                        color: accentColor,
                      }}
                    >
                      {step.stepNum}
                    </div>

                    <h3 className="mt-2.5 text-[14px] font-bold leading-tight text-[#0D0B1E]">
                      {step.label}
                    </h3>
                  </div>

                  <p className="mt-2 text-[12px] text-[#A89F95] leading-snug">
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
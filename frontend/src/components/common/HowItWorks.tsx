import React from "react";

interface Step {
  icon: string;
  title: string;
  description: string;
  step: number;
}

const steps: Step[] = [
  {
    step: 1,
    icon: "🎤",
    title: "Voice or Text Input",
    description: "The user speaks or types naturally.",
  },
  {
    step: 2,
    icon: "🧠",
    title: "AI Understands Intent",
    description:
      "The AI analyzes the request and extracts products, brands, price range, and preferences.",
  },
  {
    step: 3,
    icon: "🔍",
    title: "Search & Compare",
    description: "The AI searches products and compares the best options.",
  },
  {
    step: 4,
    icon: "🛒",
    title: "Performs Shopping Actions",
    description:
      "The AI can open products, add items to the cart, and navigate automatically.",
  },
  {
    step: 5,
    icon: "✅",
    title: "Ready for Checkout",
    description: "The user reviews the order before confirming.",
  },
];

const StepCard: React.FC<Step & { isLast: boolean }> = ({
  icon,
  title,
  description,
  step,
  isLast,
}) => (
  <div className="group relative flex flex-col items-center flex-1 min-w-0">

    {/* Connector line — horizontal on desktop */}
    {!isLast && (
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-[2.15rem] left-[calc(50%+2.25rem)] right-[calc(-50%+2.25rem)] h-px z-0"
        style={{
          background:
            "linear-gradient(to right, #e0e7ff, #f0abfc, #e0e7ff)",
        }}
      />
    )}

    {/* Icon bubble */}
    <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] flex-shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-white text-2xl shadow-sm transition-all duration-300 group-hover:border-indigo-100 group-hover:shadow-md"
      style={{
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
      }}
    >
      <span role="img" aria-label={title}>{icon}</span>

      {/* Step badge */}
      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white shadow-sm">
        {step}
      </span>
    </div>

    {/* Text */}
    <div className="mt-5 flex flex-col items-center gap-1.5 text-center px-2">
      <h3 className="text-[14px] font-semibold tracking-tight text-gray-900 leading-snug">
        {title}
      </h3>
      <p className="text-[12.5px] leading-relaxed text-gray-400 max-w-[140px]">
        {description}
      </p>
    </div>
  </div>
);

/* ── Mobile vertical step ── */
const MobileStep: React.FC<Step & { isLast: boolean }> = ({
  icon,
  title,
  description,
  step,
  isLast,
}) => (
  <div className="flex gap-4">

    {/* Left column: bubble + line */}
    <div className="flex flex-col items-center">
      <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-xl shadow-sm">
        <span role="img" aria-label={title}>{icon}</span>
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[9px] font-semibold text-white">
          {step}
        </span>
      </div>

      {!isLast && (
        <div
          aria-hidden="true"
          className="mt-2 w-px flex-1 min-h-[2.5rem]"
          style={{
            background: "linear-gradient(to bottom, #e0e7ff, #f0abfc)",
          }}
        />
      )}
    </div>

    {/* Right column: text */}
    <div className="flex flex-col gap-0.5 pt-1 pb-6">
      <h3 className="text-[14px] font-semibold tracking-tight text-gray-900">
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-gray-400 max-w-xs">
        {description}
      </p>
    </div>
  </div>
);

const HowItWorks: React.FC = () => (
  <section className="w-full px-6 py-24 overflow-hidden">
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-16 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          <span className="text-[12.5px] font-medium tracking-wide text-gray-500">
            How it works
          </span>
        </div>

        <h2 className="max-w-xl text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-gray-900">
          How ShopMind AI Works
        </h2>

        <p className="max-w-sm text-[15px] leading-relaxed text-gray-400">
          From a simple request to an intelligent shopping experience.
        </p>
      </div>

      {/* Desktop timeline */}
      <div className="hidden lg:flex items-start justify-between gap-0 relative">
        {steps.map((step, i) => (
          <StepCard key={step.step} {...step} isLast={i === steps.length - 1} />
        ))}
      </div>

      {/* Mobile vertical timeline */}
      <div className="flex flex-col lg:hidden">
        {steps.map((step, i) => (
          <MobileStep key={step.step} {...step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
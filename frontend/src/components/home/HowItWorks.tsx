import React from "react";
import {
  MessageSquareText,
  BrainCircuit,
  SearchCheck,
  ThumbsUp,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: MessageSquareText,
    title: "Describe what you need",
    description: "Type or speak naturally, just like you'd tell a friend what you're shopping for.",
  },
  {
    icon: BrainCircuit,
    title: "AI understands your intent",
    description: "ShopMind AI extracts brand, category, budget, and what matters most to you.",
  },
  {
    icon: SearchCheck,
    title: "AI searches products",
    description: "It scans the catalog in real time to find every option that fits your request.",
  },
  {
    icon: ThumbsUp,
    title: "AI recommends the best option",
    description: "Results are ranked and explained so you know exactly why it's the right pick.",
  },
  {
    icon: ShoppingBag,
    title: "AI shops with you",
    description: "From comparison to checkout, ShopMind AI stays with you through the whole journey.",
  },
];

const HowItWorks: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-white/60 py-20">
      <div
        ref={ref}
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            How ShopMind AI Works
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            Five simple steps between what you type and the perfect product in your cart.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-200/50 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <span className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-400/20 to-purple-500/20 blur-xl transition-transform duration-500 group-hover:scale-125" />

                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Step 0{index + 1}
                </span>

                <div className="relative mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-300/40 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>

                <h3 className="relative mt-4 text-sm font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-xs leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
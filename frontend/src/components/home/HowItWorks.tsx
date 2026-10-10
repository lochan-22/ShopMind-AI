import React from "react";
import {
  MessageSquare,
  Bot,
  Search,
  Star,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";
import ShopMindText from "../common/ShopMindText";
import { ShoppingCartDoodle, SmartShoppingBadge } from "../common/DecorativeAnnotations";

interface Step {
  stepNum: number;
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  accent: string;
  bg: string;
}

const STEPS: Step[] = [
  {
    stepNum: 1,
    icon: MessageSquare,
    title: "Describe",
    description: "Tell us what you need in natural language.",
    accent: "#7C3AED",
    bg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
  },
  {
    stepNum: 2,
    icon: Bot,
    title: "AI Search",
    description: (
      <>
        <ShopMindText showAi={false} /> searches live products.
      </>
    ),
    accent: "#7C3AED",
    bg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
  },
  {
    stepNum: 3,
    icon: Search,
    title: "Compare",
    description: "Compare products and seller prices.",
    accent: "#7C3AED",
    bg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
  },
  {
    stepNum: 4,
    icon: Star,
    title: "Recommend",
    description: "Get personalized AI suggestions.",
    accent: "#7C3AED",
    bg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
  },
  {
    stepNum: 5,
    icon: ShoppingBag,
    title: "Shop",
    description: "Open the best deal from trusted sellers.",
    accent: "#7C3AED",
    bg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
  },
];

const HowItWorks: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* ── Background Atmosphere & Dotted Grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Atmospheric glow blobs */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #E9D5FF 0%, #C4B5FD 50%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #FED7AA 0%, #FB923C 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Decorative badges & doodles floating on the sides */}
      <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
        <SmartShoppingBadge />
      </div>

      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
        <ShoppingCartDoodle />
      </div>

      <div ref={ref} className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]"
          >
            How <ShopMindText /> Works
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7A7068]">
            Five simple steps between what you describe and the best seller deal.
          </p>
        </div>

        {/* 5 Circular Steps Timeline */}
        <div className="relative mt-14">
          {/* Connecting Curved Dashed Track (Desktop) */}
          <svg
            className="pointer-events-none absolute top-7 left-[8%] right-[8%] w-[84%] h-12 hidden lg:block"
            viewBox="0 0 1000 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 30 C 120 10, 150 50, 250 30 C 350 10, 400 50, 500 30 C 600 10, 650 50, 750 30 C 850 10, 900 50, 1000 30"
              stroke="#C4B5FD"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  style={{
                    transitionDelay: inView ? `${idx * 80}ms` : "0ms",
                  }}
                  className={`group relative flex flex-col items-center text-center transition-all duration-500 ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                >
                  {/* Step Icon Circle with Number Badge */}
                  <div className="relative flex items-center justify-center">
                    {/* Number Badge */}
                    <span
                      className="absolute -top-1.5 -left-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
                      style={{ background: "#7C3AED" }}
                    >
                      {step.stepNum}
                    </span>

                    {/* Outer glow ring */}
                    <div
                      className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-200 bg-white p-3 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-purple-400 group-hover:shadow-lg"
                      style={{
                        boxShadow: "0 4px 14px rgba(124,58,237,0.12)",
                      }}
                    >
                      <div
                        className="flex h-full w-full items-center justify-center rounded-xl"
                        style={{ background: step.bg }}
                      >
                        <Icon className="h-6 w-6 text-[#7C3AED]" strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className="mt-4 text-sm font-bold text-[#0D0B1E] group-hover:text-[#7C3AED] transition-colors"
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#7A7068] leading-relaxed max-w-[170px]">
                    {step.description}
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
export default HowItWorks;
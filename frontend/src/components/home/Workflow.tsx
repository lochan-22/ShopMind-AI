import React from "react";
import {
  User,
  BrainCircuit,
  Search,
  Filter,
  GitCompare,
  MessageSquare,
  ExternalLink,
  ShoppingCart,
  CreditCard,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";

interface WorkflowStep {
  icon: LucideIcon;
  label: string;
}

const workflowSteps: WorkflowStep[] = [
  { icon: User, label: "User Request" },
  { icon: BrainCircuit, label: "AI Understands" },
  { icon: Search, label: "Searches Products" },
  { icon: Filter, label: "Filters Products" },
  { icon: GitCompare, label: "Compares Products" },
  { icon: MessageSquare, label: "Explains Recommendation" },
  { icon: ExternalLink, label: "Opens Product Page" },
  { icon: ShoppingCart, label: "Adds to Cart" },
  { icon: CreditCard, label: "Checkout" },
];

const Workflow: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-white/60 py-20">
      <div ref={ref} className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto max-w-xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            How the AI Agent Works
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            One continuous flow, from your request to a completed checkout.
          </p>
        </div>

        <div className="mt-14 flex flex-col items-center">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === workflowSteps.length - 1;
            return (
              <div key={step.label} className="flex w-full flex-col items-center">
                <div
                  style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
                  className={`flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200/50 ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-sm shadow-indigo-300/40">
                    <Icon className="h-4.5 w-4.5 h-5 w-5 text-white" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {step.label}
                  </span>
                </div>

                {!isLast && (
                  <ChevronDown
                    className={`my-1.5 h-5 w-5 text-indigo-300 transition-opacity duration-700 ${
                      inView ? "opacity-100" : "opacity-0"
                    }`}
                    strokeWidth={2}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
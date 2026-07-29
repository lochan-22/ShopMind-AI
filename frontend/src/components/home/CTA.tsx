import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useInView } from "./useInView";

const CTA: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  const handleStartShopping = () => {
    const searchEl = document.getElementById("hero-search");
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = searchEl.querySelector("input");
      input?.focus();
    }
  };

  return (
    <section className="w-full py-20">
      <div
        ref={ref}
        className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-6 py-16 text-center shadow-xl shadow-indigo-300/40 sm:px-12 sm:py-20">
          <span className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <span className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" strokeWidth={1.75} />
            </div>

            <h2 className="mt-6 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to Shop Smarter?
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-indigo-100">
              Let ShopMind AI search, compare and recommend the perfect product for you.
            </p>

            <button
              type="button"
              onClick={handleStartShopping}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm sm:text-base font-medium text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start Shopping with AI
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
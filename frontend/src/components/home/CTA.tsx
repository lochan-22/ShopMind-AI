import React from "react";
import { ArrowRight } from "lucide-react";
import { useInView } from "./useInView";
import ShopMindText from "../common/ShopMindText";
import { HandDrawnAnnotation } from "../common/DecorativeAnnotations";

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
    <section className="relative w-full py-20 overflow-hidden">
      <div
        ref={ref}
        className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div
          className="relative overflow-hidden rounded-[2.5rem] px-6 py-12 sm:px-12 sm:py-16 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #180B38 0%, #2E126E 50%, #150833 100%)",
            boxShadow: "0 24px 60px rgba(24, 11, 56, 0.45)",
          }}
        >
          {/* ── Background Glow Blobs & Tech Graphics ── */}
          <span
            className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl opacity-35 select-none"
            style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 70%)" }}
          />
          <span
            className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl opacity-25 select-none"
            style={{ background: "radial-gradient(circle, #F97316 0%, transparent 70%)" }}
          />

          {/* Technical arc graphics in background */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-10 select-none"
            viewBox="0 0 1200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="1000" cy="80" r="160" stroke="white" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="1000" cy="80" r="220" stroke="white" strokeWidth="0.8" strokeDasharray="3 8" />
            <circle cx="200" cy="350" r="140" stroke="#F97316" strokeWidth="1" strokeDasharray="5 5" />
          </svg>

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Left Content Column */}
            <div className="flex flex-col items-start lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Let <ShopMindText light /> <br />
                Find the Best Products for You
              </h2>
              <p className="mt-3.5 text-sm sm:text-base text-purple-200 leading-relaxed">
                Smarter search. Better comparison. More confident shopping.
              </p>

              <button
                type="button"
                onClick={handleStartShopping}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm sm:text-base font-bold text-[#2E126E] shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:bg-purple-50"
              >
                Start Searching
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Right Mascot & Orbiting Gadgets Column */}
            <div className="relative flex items-center justify-center lg:col-span-5">
              {/* Glowing Aura Ring */}
              <div
                className="pointer-events-none absolute h-56 w-56 rounded-full blur-3xl opacity-40 select-none"
                style={{ background: "radial-gradient(circle, #A855F7 0%, #7C3AED 50%, transparent 80%)" }}
              />

              {/* Floating 3D Mascot Orb */}
              <div className="relative z-10">
                <img
                  src="/shopmind-mascot-transparent.png"
                  alt="ShopMind AI Mascot"
                  className="h-36 w-36 sm:h-44 sm:w-44 object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                  style={{
                    filter: "drop-shadow(0 12px 24px rgba(124, 58, 237, 0.45))",
                  }}
                />
              </div>

              {/* Floating mini gadgets */}
              <div className="pointer-events-none absolute -top-4 right-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xl shadow-lg animate-bounce-slow select-none">
                🎧
              </div>
              <div className="pointer-events-none absolute -bottom-2 left-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xl shadow-lg animate-bounce-slow select-none" style={{ animationDelay: "1s" }}>
                💻
              </div>

              {/* Handwritten Gold/Peach Annotation */}
              <div className="absolute -top-7 right-2 sm:right-0">
                <HandDrawnAnnotation
                  text="More Choices Better Deals"
                  color="#FDBA74"
                  arrowDirection="down-left"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
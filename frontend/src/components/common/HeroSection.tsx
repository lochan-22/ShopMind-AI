import React from "react";

const suggestions = [
  "Gaming laptops",
  "Sony headphones",
  "Running shoes",
  "Smartphones under ₹30000",
];

const HeroSection: React.FC = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 py-24 overflow-hidden">

      {/* Subtle background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.07) 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(236,72,153,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Badge */}
      <div className="mb-8 flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-1.5 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[12.5px] font-medium text-gray-500 tracking-wide">
          Powered by AI
        </span>
      </div>

      {/* Heading */}
      <h1 className="max-w-2xl text-center text-[clamp(2.6rem,6vw,4rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-gray-900">
        Hi, I'm ShopMind AI
      </h1>

      {/* Subtitle */}
      <p className="mt-5 max-w-lg text-center text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-gray-400 font-normal">
        Tell me what you want, and I'll shop for you.
      </p>

      {/* Search + Mic row */}
      <div className="mt-12 w-full max-w-2xl flex items-center gap-3">

        {/* Search input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="What are you looking for today?"
            className="w-full h-14 rounded-2xl border border-gray-200 bg-white pl-11 pr-5 text-[15px] text-gray-800 placeholder-gray-400 shadow-sm outline-none ring-0 transition focus:border-gray-300 focus:shadow-md focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Microphone button */}
        <button
          aria-label="Search by voice"
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 active:scale-95"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <span className="text-[12.5px] font-medium text-gray-400 self-center mr-1">
          Try:
        </span>
        {suggestions.map((label) => (
          <button
            key={label}
            className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[13px] font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 active:scale-95"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Subtle bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent -z-10"
      />
    </section>
  );
};

export default HeroSection;
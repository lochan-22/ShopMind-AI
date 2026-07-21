import React from "react";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "🔍",
    title: "Smart Product Search",
    description: "Search products using natural language.",
  },
  {
    icon: "🎤",
    title: "Voice Shopping",
    description: "Talk naturally instead of typing.",
  },
  {
    icon: "⚖️",
    title: "Compare Products",
    description: "Compare products instantly.",
  },
  {
    icon: "🛒",
    title: "Smart Cart",
    description: "Add, remove and update products using AI.",
  },
  {
    icon: "⭐",
    title: "Personalized Recommendations",
    description: "Receive recommendations based on your needs.",
  },
  {
    icon: "🤖",
    title: "Autonomous Shopping",
    description: "The AI plans and performs shopping actions for you.",
  },
];

const FeatureCard: React.FC<Feature> = ({ icon, title, description }) => (
  <div className="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md">
    {/* Subtle hover glow */}
    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 70%)" }}
    />

    {/* Icon */}
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-xl transition-colors duration-300 group-hover:border-indigo-100 group-hover:bg-indigo-50">
      <span role="img" aria-label={title}>{icon}</span>
    </div>

    {/* Text */}
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">
        {title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-gray-400">
        {description}
      </p>
    </div>

    {/* Bottom accent line */}
    <div className="absolute bottom-0 left-6 right-6 h-px scale-x-0 rounded-full bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 transition-transform duration-300 group-hover:scale-x-100" />
  </div>
);

const AIFeatures: React.FC = () => (
  <section className="w-full px-6 py-24">
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-14 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span className="text-[12.5px] font-medium tracking-wide text-gray-500">
            Capabilities
          </span>
        </div>

        <h2 className="max-w-xl text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-gray-900">
          What ShopMind AI Can Do
        </h2>

        <p className="max-w-md text-[15px] leading-relaxed text-gray-400">
          A full AI shopping assistant — from search to checkout — built to understand you.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  </section>
);

export default AIFeatures;
import React from "react";
import AgentPanel from "../components/agent/AgentPanel";

const AgentDemo: React.FC = () => (
  <div className="relative min-h-screen w-full overflow-hidden bg-white">

    {/* ── Background layer ── */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Base radial glow — top center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Soft pink accent — bottom right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 85% 90%, rgba(236,72,153,0.05) 0%, transparent 60%)",
        }}
      />
      {/* Subtle purple — bottom left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 10% 80%, rgba(139,92,246,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Fine dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top fade to mask dot grid bleed */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </div>

    {/* ── Page content ── */}
    <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-16">

      {/* Eyebrow badge */}
      <div className="mb-8 flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-1.5 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-[12.5px] font-medium tracking-wide text-gray-500">
          Live Agent View
        </span>
      </div>

      {/* Heading */}
      <h1 className="max-w-xl text-center text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-gray-900">
        Watch ShopMind AI Think
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-md text-center text-[15.5px] leading-relaxed text-gray-400">
        The AI plans every shopping action before executing it.
      </p>

      {/* Divider rule */}
      <div className="mt-10 mb-2 flex items-center gap-4 w-full max-w-sm">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
        <span className="text-[11.5px] font-medium tracking-widest text-gray-300 uppercase">
          Agent activity
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      {/* Agent panel */}
      <div className="w-full">
        <AgentPanel />
      </div>

      {/* Bottom disclaimer */}
      <p className="mt-2 text-center text-[12px] text-gray-300 max-w-xs leading-relaxed">
        No actions are performed without your final confirmation.
        ShopMind AI operates transparently at every step.
      </p>
    </div>
  </div>
);

export default AgentDemo;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, ArrowRight } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";
import ShopMindText from "../components/common/ShopMindText";
import { useAgent } from "../agent/context/AgentContext";
import HeroVisual from "../components/home/HeroVisual";
import FeatureStrip from "../components/home/FeatureStrip";
import ShopByCategory from "../components/home/ShopByCategory";
import TrendingProducts from "../components/home/TrendingProducts";
import HowItWorks from "../components/home/HowItWorks";
import Features from "../components/home/Features";
import Comparison from "../components/home/Comparison";
import Categories from "../components/home/Categories";
import Workflow from "../components/home/Workflow";
import FutureFeatures from "../components/home/FutureFeatures";
import CTA from "../components/home/CTA";
import {
  WatercolorSplash,
  PaintArches,
  EyeglassesDoodle,
} from "../components/common/DecorativeAnnotations";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { openAgent } = useAgent();
  const [query, setQuery] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <PageBackground>
      <Navbar />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative w-full overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20">
        {/* Subtle peach atmospheric gradient (bottom-left) */}
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 h-96 w-96 rounded-full opacity-35 blur-3xl select-none"
          style={{
            background: "radial-gradient(circle, #FED7AA 0%, #FB923C 45%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Subtle purple glow (top-right) */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-30 blur-3xl select-none"
          style={{
            background: "radial-gradient(circle, #DDD6FE 0%, #A855F7 45%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Watercolor brush stroke washes */}
        <WatercolorSplash type="top-left" />
        <WatercolorSplash type="top-right" />

        {/* Eyeglasses doodle top-left */}
        <div className="absolute top-8 left-8 sm:left-14 hidden xl:block pointer-events-none">
          <EyeglassesDoodle />
        </div>

        {/* Peach terracotta curved paint arches */}
        <div className="absolute bottom-4 left-2 sm:left-6 hidden xl:block pointer-events-none">
          <PaintArches />
        </div>

        {/* Thin curved technical lines & abstract geometric overlays */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-15 select-none"
          viewBox="0 0 1440 650"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M-50 480 C 250 450, 400 580, 750 510 C 1100 440, 1300 530, 1500 480"
            stroke="#7C3AED"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <path
            d="M100 20 C 350 90, 500 30, 850 110 C 1150 180, 1350 60, 1500 120"
            stroke="#F97316"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle cx="280" cy="120" r="18" stroke="#7C3AED" strokeWidth="0.8" strokeDasharray="2 3" />
          <line x1="270" y1="120" x2="290" y2="120" stroke="#7C3AED" strokeWidth="1" />
          <line x1="280" y1="110" x2="280" y2="130" stroke="#7C3AED" strokeWidth="1" />

          <circle cx="1250" cy="240" r="28" stroke="#A855F7" strokeWidth="0.8" strokeDasharray="3 4" />
          <circle cx="1250" cy="240" r="14" stroke="#F97316" strokeWidth="0.6" />
        </svg>

        {/* Hero Container */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">

            {/* LEFT / CENTER: Text, Search, Flow */}
            <div className="flex flex-col items-start text-left lg:col-span-7">
              {/* Companion Badge */}
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/85 px-4 py-1.5 text-xs font-semibold text-[#5A5248] shadow-sm backdrop-blur-md"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
                <span>Your AI Shopping Companion</span>
              </div>

              {/* Strong ShopMind AI Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0D0B1E] leading-[1.12]">
                Shop Smarter <br />
                with <ShopMindText />
              </h1>

              {/* Supporting Description */}
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#7A7068]">
                Describe what you're looking for. <ShopMindText /> searches
                live products, compares seller deals, and helps you find the right option.
              </p>

              {/* Natural-Language Shopping Search Field & Buttons */}
              <form
                onSubmit={handleSubmit}
                id="hero-search"
                className="mt-8 flex w-full max-w-xl flex-col gap-2.5 sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A89F95]"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. best laptop for college under ₹60000"
                    className="w-full rounded-2xl border border-[#E8E2D9] bg-white py-3.5 pl-11 pr-4 text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-[#A89F95] shadow-sm focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                      boxShadow: "0 4px 14px rgba(124,58,237,0.32)",
                    }}
                  >
                    Search
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={openAgent}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#DDD6FE] bg-white/90 px-4 py-3.5 text-xs sm:text-sm font-bold text-[#7C3AED] transition-all hover:bg-purple-50 shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
                    AI Assistant
                  </button>
                </div>
              </form>

              {/* Shopping Workflow Indicator */}
              <div
                className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-[#E8E2D9] bg-white/75 px-4 py-1.5 text-[11px] font-semibold text-[#5A5248] backdrop-blur-sm shadow-sm"
              >
                <span>User Intent</span>
                <span className="text-[#7C3AED]">→</span>
                <span>AI Search</span>
                <span className="text-[#7C3AED]">→</span>
                <span>Live Comparison</span>
                <span className="text-[#7C3AED]">→</span>
                <span className="font-bold text-[#EA580C]">Best Offer</span>
              </div>
            </div>

            {/* VISUAL AREA: Mascot Orb & Decorative Product Outlines */}
            <div className="relative flex items-center justify-center lg:col-span-5">
              <HeroVisual />
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. FEATURE / BENEFIT STRIP (4 PREMIUM TRANSLUCENT CARDS) ── */}
      <FeatureStrip />

      {/* ── 3. SHOP BY CATEGORY SECTION (11 REAL VISUAL DEPARTMENT CARDS) ── */}
      <ShopByCategory />

      {/* ── 4. TRENDING PRODUCTS SECTION (6 REAL PRODUCT CARDS) ── */}
      <TrendingProducts />

      {/* ── 5. HOW SHOPMIND AI WORKS (5-STEP CIRCULAR TIMELINE) ── */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* ── 6. CORE CAPABILITIES (8 FEATURE CARDS WITH PASTEL ACCENTS) ── */}
      <div id="features">
        <Features />
      </div>

      {/* ── 7. WHY SWITCH TO SHOPMIND AI (HIGH-CONTRAST COMPARISON) ── */}
      <Comparison />

      {/* ── 8. SHOP ACROSS CATEGORIES (11 REAL DEPARTMENTS GRID) ── */}
      <Categories />

      {/* ── 9. THE SHOPMIND AI ARCHITECTURE (12-STEP PIPELINE) ── */}
      <Workflow />

      {/* ── 10. WHAT'S COMING NEXT (8 ROADMAP CARDS) ── */}
      <FutureFeatures />

      {/* ── 11. CALL TO ACTION BANNER (MIDNIGHT INDIGO CAPSULE) ── */}
      <CTA />

      {/* ── 12. FOOTER ── */}
      <Footer />

      {/* Gentle bounce animation for orbiting product outlines */}
      <style>{`
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3.8s ease-in-out infinite;
        }
      `}</style>
    </PageBackground>
  );
};

export default Home;


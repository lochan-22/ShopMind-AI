import React from "react";
import {
  Sparkles,
  Search,
  Layers,
  GitCompare,
  TrendingUp,
  Cpu,
  ExternalLink,
  Mail,
  Code2,
  Server,
  Database,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";
import ShopMindText from "../components/common/ShopMindText";

/* Clean vector icons for GitHub and LinkedIn */
const GithubIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const About: React.FC = () => {
  const navigate = useNavigate();

  const capabilities = [
    {
      icon: Search,
      title: "Live Product Discovery",
      description:
        "Queries Google Shopping in real time through SerpApi to fetch live retail listings, pricing, and availability across top Indian merchants.",
      accent: "#7C3AED",
      bg: "bg-purple-50",
    },
    {
      icon: Layers,
      title: "Product Normalization & Deduplication",
      description:
        "Standardizes raw catalog fields and merges duplicate listings across disparate stores into clean, unified multi-seller product profiles.",
      accent: "#EA580C",
      bg: "bg-orange-50",
    },
    {
      icon: GitCompare,
      title: "Multi-Seller Offer Comparison",
      description:
        "Compares real-time prices, store ratings, shipping conditions, and retailer reliability side-by-side so you can secure the best value.",
      accent: "#2563EB",
      bg: "bg-blue-50",
    },
    {
      icon: TrendingUp,
      title: "Best-Value Ranking",
      description:
        "Evaluates price competitiveness, customer ratings, and budget fit algorithmically to surface legitimate top deals instead of ad-sponsored ranks.",
      accent: "#16A34A",
      bg: "bg-green-50",
    },
    {
      icon: Cpu,
      title: "AI Shopping Decision Engine",
      description:
        "Parses natural-language user queries into structured shopping intent (budget, brand, category, and criteria) and produces evidence-based top picks.",
      accent: "#9333EA",
      bg: "bg-purple-50",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Describe what you want",
      desc: "Type a natural question like 'Best laptop under ₹60,000 for college' with your budget and needs.",
    },
    {
      step: "02",
      title: "Search live product listings",
      desc: "ShopMind AI retrieves live market results directly from Google Shopping India via SerpApi.",
    },
    {
      step: "03",
      title: "Normalize and organize results",
      desc: "Listings are cleansed, deduplicated, and organized into standardized product cards.",
    },
    {
      step: "04",
      title: "Compare product details & offers",
      desc: "Review side-by-side seller deals, verified specifications, ratings, and price variations.",
    },
    {
      step: "05",
      title: "Review AI recommendations & shop",
      desc: "Examine the curated Top 5 picks and visit the retailer directly for final checkout.",
    },
  ];

  const techStack = [
    {
      name: "React 19 & TypeScript",
      category: "Frontend UI",
      desc: "Component-driven, responsive application with strict type safety.",
      icon: Code2,
    },
    {
      name: "FastAPI & Python",
      category: "Backend Engine",
      desc: "High-performance asynchronous REST API powering search and normalization.",
      icon: Server,
    },
    {
      name: "SerpApi & Google Shopping",
      category: "Live Market Data",
      desc: "Retrieves genuine real-time product prices and merchant URLs.",
      icon: Database,
    },
    {
      name: "Google Gemini API",
      category: "AI Intelligence",
      desc: "Powers structured intent extraction and contextual shopping decision analysis.",
      icon: Sparkles,
    },
  ];

  return (
    <PageBackground>
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── 1. HERO SECTION ── */}
        <section className="text-center py-8 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-4 py-1.5 text-xs font-bold text-[#7C3AED]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Shopping Platform</span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-[#0D0B1E]">
            About <ShopMindText />
          </h1>

          <p className="mt-4 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-[#5A5248]">
            ShopMind AI makes online shopping simpler by helping users discover products, compare sellers, evaluate prices, and make informed purchasing decisions.
          </p>
        </section>

        {/* ── 2. WHAT SHOPMIND AI DOES ── */}
        <section className="mt-10 sm:mt-14">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
              Core Engine
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0D0B1E]">
              What ShopMind AI Does
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#7A7068]">
              A complete pipeline engineered to solve scattered shopping information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="rounded-2xl border border-[#E8E2D9] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${cap.bg}`}
                    >
                      <Icon className="h-5 w-5" style={{ color: cap.accent }} />
                    </div>
                    <h3 className="text-base font-bold text-[#0D0B1E] mb-2">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Quick Action Card */}
            <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 shadow-md text-white flex flex-col justify-between">
              <div>
                <Sparkles className="h-7 w-7 text-purple-200 mb-3" />
                <h3 className="text-lg font-bold">Try It in Action</h3>
                <p className="mt-2 text-xs sm:text-sm text-purple-100 leading-relaxed">
                  Search any electronic gadget, footwear, or appliance to see live intent parsing and seller comparisons.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/?focus=search")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#7C3AED] transition-all hover:bg-purple-50 shadow-sm"
              >
                <span>Try Live Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── 3. HOW IT WORKS WORKFLOW ── */}
        <section className="mt-16 sm:mt-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
              Step-by-Step Flow
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0D0B1E]">
              How ShopMind AI Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#7A7068]">
              Transparent, automated decision path from query to checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-[#E8E2D9] bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-purple-200 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex rounded-lg bg-purple-100 px-2.5 py-0.5 text-xs font-black text-[#7C3AED] mb-3">
                    {step.step}
                  </div>
                  <h3 className="text-sm font-bold text-[#0D0B1E] mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#7A7068] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. CONFIRMED TECHNOLOGY STACK ── */}
        <section className="mt-16 sm:mt-24">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
              Verified Infrastructure
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0D0B1E]">
              Technologies Used
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#7A7068]">
              Built with a modern, high-speed full-stack architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="rounded-2xl border border-[#E8E2D9] bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-[#7C3AED] mb-3">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#A89F95]">
                    {tech.category}
                  </p>
                  <h3 className="text-sm font-bold text-[#0D0B1E] mt-0.5 mb-1.5">
                    {tech.name}
                  </h3>
                  <p className="text-xs text-[#5A5248] leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. DEVELOPER & CONTACT ── */}
        <section className="mt-16 sm:mt-24 mb-10">
          <div className="rounded-3xl border border-[#E8E2D9] bg-white/95 p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
                  Project Creator
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-black text-[#0D0B1E]">
                  Created by Lochan P Anchalkar
                </h2>
                <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#5A5248] leading-relaxed">
                  ShopMind AI was developed as an advanced software project to demonstrate production-grade AI shopping decision pipelines, real-time SerpApi product integration, and multi-seller normalization.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href="mailto:lochanap2005@gmail.com?subject=ShopMind%20AI%20Support"
                  title="Send email to lochanap2005@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E2D9] bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5A5248] shadow-xs transition-all hover:border-purple-300 hover:text-[#7C3AED]"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>

                <a
                  href="https://github.com/lochan-22"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E2D9] bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5A5248] shadow-xs transition-all hover:border-purple-300 hover:text-[#7C3AED]"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3 text-[#A89F95]" />
                </a>

                <a
                  href="https://linkedin.com/in/lochan-p-anchalkar-6b70b02a6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-purple-700"
                >
                  <LinkedinIcon className="h-4 w-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 text-purple-200" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Shared Footer in normal document flow */}
      <Footer />
    </PageBackground>
  );
};

export default About;

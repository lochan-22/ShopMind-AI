import React from "react";
import {
  Mic,
  Brain,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  Target,
  Bell,
  Cpu,
  BarChart3,
  ShoppingCart,
  GitCompare,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import PageBackground from "../components/common/PageBackground";
import { ProductCard } from "../components/product/ProductCard";
import type { Product } from "../services/productService";
import ShopMindText from "../components/common/ShopMindText";

const timelineSteps = [
  "Voice input received: 'I need Sony wireless headphones under ₹5000'",
  "AI parsed intent: Brand = Sony, Category = Headphones, Budget = ₹5000",
  "Product catalog search executed: 12 matching products found",
  "Filtering applied: Excluded over-budget & unrated items",
  "AI reasoning completed: Selected Sony WH-1000XM5 as top recommendation",
];

const thinkingLines = [
  "Executing intent parsing pipeline...",
  "Query: brand='Sony' AND category='Headphones' AND price <= 5000",
  "Found 12 candidate products in database",
  "Filtering out of stock items...",
  "Calculating AI recommendation score...",
  "Top match: Sony WH-1000XM5 (Score: 96%)",
  "Generating natural language explanation...",
  "Task completed successfully in 1.8s",
];

const recommendedProduct: Product = {
  id: 1,
  product_id: "demo-wh1000xm5",
  name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
  brand: "Sony",
  category: "Headphones",
  price: 4499,
  rating: 4.7,
  review_count: 3245,
  image: "https://placehold.co/400x400",
  description:
    "Industry-leading noise cancellation with premium sound quality, 30-hour battery life, and crystal-clear hands-free calling.",
  stock: true,
  offers: [
    {
      price: 4499,
      currency: "INR",
      stock_status: "in_stock",
      source_name: "boAt",
      product_url: "https://www.google.com",
      is_best_price: true,
    },
  ],
};

const agentStats = [
  { label: "Search Accuracy", value: "98.4%", icon: <Target className="h-5 w-5" style={{ color: "#7C3AED" }} /> },
  { label: "Tasks Completed", value: "1,248", icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
  { label: "Avg Response Time", value: "1.4s", icon: <Zap className="h-5 w-5 text-orange-500" /> },
  { label: "Price Savings", value: "18%", icon: <Tag className="h-5 w-5 text-purple-600" /> },
  { label: "User Satisfaction", value: "4.9/5", icon: <ShieldCheck className="h-5 w-5 text-blue-600" /> },
];

const roadmapFeatures = [
  { label: "Voice Search AI", icon: <Mic className="h-5 w-5 text-purple-600" /> },
  { label: "Price Drop Alerts", icon: <Bell className="h-5 w-5 text-purple-600" /> },
  { label: "Multi-Store Compare", icon: <GitCompare className="h-5 w-5 text-purple-600" /> },
  { label: "Smart Recommendations", icon: <Brain className="h-5 w-5 text-purple-600" /> },
  { label: "Autonomous Checkout", icon: <ShoppingCart className="h-5 w-5 text-purple-600" /> },
  { label: "Real-Time Tracking", icon: <BarChart3 className="h-5 w-5 text-purple-600" /> },
];

const AgentDashboard: React.FC = () => {
  return (
    <PageBackground>
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
              }}
            >
              <Cpu className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "#0D0B1E" }}>
              AI Shopping Agent Dashboard
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed sm:mx-0" style={{ color: "#7A7068" }}>
            Watch <ShopMindText /> understand your request, search live products, compare
            offers, reason about decisions, and streamline your shopping tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Voice Command Card */}
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{
                background: "linear-gradient(135deg, #FFFFFF, #FDFAF7)",
                borderColor: "#E8E2D9",
                boxShadow: "0 4px 16px rgba(13, 11, 30, 0.05)",
              }}
            >
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div
                  className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
                  }}
                >
                  <Mic className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
                    Voice Command Simulation
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-bold" style={{ color: "#0D0B1E" }}>
                    &ldquo;I need Sony wireless headphones under ₹5000&rdquo;
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
                  style={{ background: "#F0FDF4", color: "#16A34A" }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Processed
                </span>
              </div>
            </div>

            {/* AI Reasoning Timeline */}
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{
                background: "linear-gradient(135deg, #FFFFFF, #FDFAF7)",
                borderColor: "#E8E2D9",
                boxShadow: "0 4px 16px rgba(13, 11, 30, 0.05)",
              }}
            >
              <h2 className="mb-6 text-lg sm:text-xl font-bold" style={{ color: "#0D0B1E" }}>
                AI Reasoning Timeline
              </h2>
              <ol className="relative space-y-5 border-l pl-6" style={{ borderColor: "#E8E2D9" }}>
                {timelineSteps.map((step, idx) => (
                  <li key={idx} className="relative">
                    <span
                      className="absolute -left-[1.9rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ background: "#7C3AED" }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <p className="text-sm sm:text-base font-semibold" style={{ color: "#5A5248" }}>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* AI Thinking Panel */}
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{
                background: "#0D0B1E",
                borderColor: "#2E2847",
                boxShadow: "0 12px 36px rgba(13, 11, 30, 0.25)",
              }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #F97316)" }}
                >
                  <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  AI Execution Log
                </h2>
                <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
              <div className="space-y-2.5 font-mono text-xs sm:text-sm">
                {thinkingLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-slate-300">
                    <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-purple-400" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* AI Decision Card */}
            <div
              className="rounded-3xl border p-6"
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #F8F5FF 100%)",
                borderColor: "#C4B5FD",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.08)",
              }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
                >
                  <Target className="h-4.5 w-4.5" strokeWidth={2} />
                </div>
                <h2 className="text-base sm:text-lg font-bold" style={{ color: "#0D0B1E" }}>
                  AI Decision Breakdown
                </h2>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 border" style={{ borderColor: "#E8E2D9" }}>
                  <span style={{ color: "#7A7068" }}>Brand</span>
                  <span className="font-bold" style={{ color: "#0D0B1E" }}>Sony</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 border" style={{ borderColor: "#E8E2D9" }}>
                  <span style={{ color: "#7A7068" }}>Category</span>
                  <span className="font-bold" style={{ color: "#0D0B1E" }}>Headphones</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 border" style={{ borderColor: "#E8E2D9" }}>
                  <span style={{ color: "#7A7068" }}>Budget</span>
                  <span className="font-bold" style={{ color: "#0D0B1E" }}>₹5,000</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 border" style={{ borderColor: "#E8E2D9" }}>
                  <span style={{ color: "#7A7068" }}>Confidence</span>
                  <span className="font-bold text-emerald-600">96%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 border" style={{ borderColor: "#E8E2D9" }}>
                  <span style={{ color: "#7A7068" }}>Latency</span>
                  <span className="font-bold" style={{ color: "#0D0B1E" }}>1.8s</span>
                </div>
              </div>
            </div>

            {/* Recommended Product */}
            <div>
              <h2 className="mb-4 text-base sm:text-lg font-bold" style={{ color: "#0D0B1E" }}>
                Top Recommendation
              </h2>
              <ProductCard product={recommendedProduct} />
            </div>
          </div>
        </div>

        {/* Agent Statistics */}
        <div className="mt-12">
          <h2 className="mb-6 text-lg sm:text-xl font-bold" style={{ color: "#0D0B1E" }}>
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {agentStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border p-5 text-center transition-all hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #FDFAF7)",
                  borderColor: "#E8E2D9",
                }}
              >
                <div
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "#EDE9FE" }}
                >
                  {stat.icon}
                </div>
                <p className="text-xl font-extrabold" style={{ color: "#0D0B1E" }}>{stat.value}</p>
                <p className="mt-1 text-xs" style={{ color: "#7A7068" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="mt-12">
          <h2 className="mb-6 text-lg sm:text-xl font-bold" style={{ color: "#0D0B1E" }}>
            Upcoming Agent Capabilities
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roadmapFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 rounded-2xl border p-5"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF, #FAF7F2)",
                  borderColor: "#E8E2D9",
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "#EDE9FE" }}
                >
                  {feature.icon}
                </div>
                <p className="text-sm font-bold" style={{ color: "#0D0B1E" }}>
                  {feature.label}
                </p>
                <Bell className="ml-auto h-4 w-4" style={{ color: "#C4B5FD" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default AgentDashboard;

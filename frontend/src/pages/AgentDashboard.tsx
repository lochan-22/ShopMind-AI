import React from "react";
import type { Product } from "../services/productService";
import Navbar from "../components/common/Navbar";
import { ProductCard } from "../components/product/ProductCard";
import {
  Mic,
  CheckCircle2,
  Brain,
  Sparkles,
  Target,
  Clock,
  Gauge,
  Search,
  ScanSearch,
  ShieldCheck,
  Bell,
  Mic2,
  TrendingDown,
  PackageCheck,
  Store,
  Ticket,
  Truck,
} from "lucide-react";

const recommendedProduct: Product = {
  id: 1001,
  name: "WH-1000XM5 Wireless Noise Cancelling Headphones",
  brand: "Sony",
  category: "Headphones",
  price: 4499,
  rating: 4.7,
  review_count: 3245,
  image: null,
  description: "Premium wireless noise-cancelling headphones.",
  stock: true,
};

const timelineSteps: string[] = [
  "Voice converted to text",
  "Intent detected",
  "Product category identified",
  "Budget extracted",
  "Brand detected",
  "Search started",
  "Products ranked",
  "Best recommendation selected",
  "Cart updated",
];

const thinkingLines: string[] = [
  "Understanding user request...",
  "Searching products...",
  "Comparing specifications...",
  "Checking prices...",
  "Ranking products...",
  "Selecting best value...",
  "Ready to add to cart...",
];

const agentStats: { label: string; value: string; icon: React.ReactNode }[] = [
  {
    label: "Products Analysed",
    value: "248",
    icon: <ScanSearch className="h-5 w-5 text-indigo-500" />,
  },
  {
    label: "Products Compared",
    value: "36",
    icon: <Search className="h-5 w-5 text-indigo-500" />,
  },
  {
    label: "Decision Accuracy",
    value: "97%",
    icon: <ShieldCheck className="h-5 w-5 text-indigo-500" />,
  },
  {
    label: "Avg Processing Time",
    value: "1.8s",
    icon: <Clock className="h-5 w-5 text-indigo-500" />,
  },
  {
    label: "Confidence Score",
    value: "94%",
    icon: <Gauge className="h-5 w-5 text-indigo-500" />,
  },
];

const roadmapFeatures: { label: string; icon: React.ReactNode }[] = [
  { label: "Voice Shopping", icon: <Mic2 className="h-5 w-5 text-violet-500" /> },
  { label: "Price Prediction", icon: <TrendingDown className="h-5 w-5 text-violet-500" /> },
  { label: "Order Automation", icon: <PackageCheck className="h-5 w-5 text-violet-500" /> },
  { label: "Multi-store Comparison", icon: <Store className="h-5 w-5 text-violet-500" /> },
  { label: "Coupon Finder", icon: <Ticket className="h-5 w-5 text-violet-500" /> },
  { label: "Delivery Prediction", icon: <Truck className="h-5 w-5 text-violet-500" /> },
];

const AgentDashboard: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-600 shadow-md shadow-violet-300/50">
              <Brain className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              AI Shopping Agent Dashboard
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-500 sm:mx-0">
            Watch ShopMind AI understand your request, search products, compare
            options, reason about decisions, and complete shopping tasks
            automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Voice Command Card */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-600 shadow-md shadow-violet-300/50">
                  <Mic className="h-6 w-6 text-white" strokeWidth={2} />
                  <span className="absolute -inset-1 -z-10 animate-ping rounded-2xl bg-violet-400/30" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-violet-500">
                    Voice Command
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-slate-900">
                    "I need Sony wireless headphones under ₹5000"
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Voice Received
                </span>
              </div>
            </div>

            {/* AI Reasoning Timeline */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50 sm:p-8">
              <h2 className="mb-6 text-lg sm:text-xl font-bold text-slate-900">
                AI Reasoning Timeline
              </h2>
              <ol className="relative space-y-5 border-l border-slate-200 pl-6">
                {timelineSteps.map((step, idx) => (
                  <li key={idx} className="relative">
                    <span className="absolute -left-[1.9rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-300/50">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </span>
                    <p className="text-sm sm:text-base font-medium text-slate-700">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* AI Thinking Panel */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-300/40 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-600">
                  <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  AI Thinking Panel
                </h2>
                <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
              <div className="space-y-2.5 font-mono text-xs sm:text-sm">
                {thinkingLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-slate-300">
                    <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-violet-400" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* AI Decision Card */}
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-lg shadow-indigo-100/50">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-300/50">
                  <Target className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  AI Decision
                </h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5">
                  <span className="text-slate-500">Brand</span>
                  <span className="font-semibold text-slate-800">Sony</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold text-slate-800">Headphones</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5">
                  <span className="text-slate-500">Budget</span>
                  <span className="font-semibold text-slate-800">₹5000</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5">
                  <span className="text-slate-500">Best Product</span>
                  <span className="max-w-[60%] truncate text-right font-semibold text-slate-800">
                    Sony WH-1000XM5
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5">
                  <span className="text-slate-500">Confidence Score</span>
                  <span className="font-semibold text-emerald-600">94%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5">
                  <span className="text-slate-500">Reasoning Score</span>
                  <span className="font-semibold text-emerald-600">96%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5">
                  <span className="text-slate-500">Processing Time</span>
                  <span className="font-semibold text-slate-800">1.8s</span>
                </div>
              </div>
            </div>

            {/* Recommended Product */}
            <div>
              <h2 className="mb-4 text-base sm:text-lg font-bold text-slate-900">
                Recommended Product
              </h2>
              <ProductCard product={recommendedProduct} />
            </div>
          </div>
        </div>

        {/* Agent Statistics */}
        <div className="mt-10">
          <h2 className="mb-6 text-lg sm:text-xl font-bold text-slate-900">
            Agent Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {agentStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  {stat.icon}
                </div>
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Features */}
        <div className="mt-10">
          <h2 className="mb-6 text-lg sm:text-xl font-bold text-slate-900">
            Future Features
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roadmapFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  {feature.icon}
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {feature.label}
                </p>
                <Bell className="ml-auto h-4 w-4 text-violet-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-10 mb-4 rounded-3xl border border-slate-200 bg-white/60 p-6 text-center shadow-sm sm:p-8">
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500">
            ShopMind AI automatically understands your shopping intent and
            performs shopping actions on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;

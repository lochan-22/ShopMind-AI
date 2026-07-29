import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, Loader2 } from "lucide-react";
import Navbar from "../components/common/Navbar";
import { search } from "../services/agentService";
import HowItWorks from "../components/home/HowItWorks";
import Features from "../components/home/Features";
import Comparison from "../components/home/Comparison";
import Categories from "../components/home/Categories";
import Workflow from "../components/home/Workflow";
import FutureFeatures from "../components/home/FutureFeatures";
import CTA from "../components/home/CTA";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await search(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`, {
        state: { query: query.trim(), products: response.matching_products },
      });
    } catch {
      setError("Something went wrong while processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 blur-xl opacity-30" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-300/50">
            <Sparkles className="h-9 w-9 text-white" strokeWidth={1.75} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
          Shop Smarter with ShopMind AI
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-500">
          Describe what you're looking for and let ShopMind AI understand your
          intent, search products, and recommend the best options for you.
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          id="hero-search"
          className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find Sony headphones under ₹5000"
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-3.5 pl-11 pr-4 text-sm sm:text-base text-slate-800 shadow-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm sm:text-base font-medium text-white shadow-lg shadow-indigo-300/40 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
        )}
      </div>

      <HowItWorks />
      <Features />
      <Comparison />
      <Categories />
      <Workflow />
      <FutureFeatures />
      <CTA />
    </div>
  );
};

export default Home;
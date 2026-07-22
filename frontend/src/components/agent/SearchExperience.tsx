import React from "react";

/* ── Types ── */
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  aiScore: number;
  isRecommended: boolean;
  tag: string;
  specs: string[];
}

/* ── Dummy data ── */
const products: Product[] = [
  {
    id: 1,
    name: "Sony WH-CH520 Wireless Headphones",
    price: 3490,
    originalPrice: 4990,
    rating: 4.4,
    reviewCount: 2841,
    aiScore: 94,
    isRecommended: true,
    tag: "Best Value",
    specs: ["30hr battery", "Bluetooth 5.2", "Foldable"],
  },
  {
    id: 2,
    name: "Sony MDR-ZX110 Wired Headphones",
    price: 1290,
    originalPrice: 1990,
    rating: 4.1,
    reviewCount: 5120,
    aiScore: 89,
    isRecommended: true,
    tag: "Budget Pick",
    specs: ["1.2m cable", "30mm driver", "Lightweight"],
  },
  {
    id: 3,
    name: "Sony WH-CH510 Wireless Headphones",
    price: 2990,
    originalPrice: 3990,
    rating: 4.2,
    reviewCount: 1763,
    aiScore: 85,
    isRecommended: false,
    tag: "Popular",
    specs: ["35hr battery", "Bluetooth 5.0", "USB-C"],
  },
  {
    id: 4,
    name: "Sony MDR-ZX310 On-Ear Headphones",
    price: 1890,
    originalPrice: 2490,
    rating: 3.9,
    reviewCount: 932,
    aiScore: 78,
    isRecommended: false,
    tag: "Comfort Fit",
    specs: ["1.2m cable", "30mm driver", "Swivel cups"],
  },
];

/* ── Helpers ── */
const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half && (
        <svg width="12" height="12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#E5E7EB">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

/* ── AI Score ring ── */
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color =
    score >= 90 ? "#6366f1" : score >= 80 ? "#8b5cf6" : "#a78bfa";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
          <circle
            cx="24" cy="24" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-gray-800">
          {score}%
        </span>
      </div>
      <span className="text-[10px] font-medium text-gray-400">AI Score</span>
    </div>
  );
};

/* ── Product image placeholder ── */
const ProductImagePlaceholder: React.FC<{ tag: string; recommended: boolean }> = ({
  tag,
  recommended,
}) => (
  <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0">
    {/* Headphone icon */}
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d1d5db"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>

    {/* Tag chip */}
    <div className="absolute top-2.5 left-2.5">
      <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10.5px] font-semibold text-gray-600 shadow-sm border border-gray-100">
        {tag}
      </span>
    </div>

    {/* Recommended badge */}
    {recommended && (
      <div className="absolute top-2.5 right-2.5">
        <span className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-0.5 text-[10.5px] font-semibold text-white shadow-sm">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          AI Pick
        </span>
      </div>
    )}
  </div>
);

/* ── Product card ── */
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md">

      <ProductImagePlaceholder
        tag={product.tag}
        recommended={product.isRecommended}
      />

      {/* Name + score */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex-1 text-[13.5px] font-semibold leading-snug tracking-tight text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        <ScoreRing score={product.aiScore} />
      </div>

      {/* Specs */}
      <div className="flex flex-wrap gap-1.5">
        {product.specs.map((s) => (
          <span
            key={s}
            className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10.5px] font-medium text-gray-500"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <StarRating rating={product.rating} />
        <span className="text-[12px] font-semibold text-gray-700">
          {product.rating}
        </span>
        <span className="text-[11.5px] text-gray-400">
          ({product.reviewCount.toLocaleString("en-IN")})
        </span>
      </div>

      {/* Price row */}
      <div className="flex items-baseline gap-2">
        <span className="text-[18px] font-bold tracking-tight text-gray-900">
          {formatINR(product.price)}
        </span>
        <span className="text-[12px] text-gray-400 line-through">
          {formatINR(product.originalPrice)}
        </span>
        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-emerald-600">
          {discount}% off
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button className="flex-1 h-9 rounded-xl border border-gray-200 bg-white text-[12.5px] font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95">
          Compare
        </button>
        <button className="flex-1 h-9 rounded-xl bg-gray-900 text-[12.5px] font-medium text-white transition hover:bg-gray-700 active:scale-95">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

/* ── Intent tags ── */
const IntentTag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5">
    <span className="text-[11px] font-medium text-gray-400">{label}</span>
    <span className="text-[12px] font-semibold text-gray-800">{value}</span>
  </div>
);

/* ── Action timeline step ── */
const ActionStep: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600">
      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <span className="text-[12.5px] font-medium text-gray-600">{label}</span>
  </div>
);

/* ── Root component ── */
const SearchExperience: React.FC = () => (
  <section className="w-full px-6 py-16">
    <div className="mx-auto max-w-6xl flex flex-col gap-6">

      {/* ── Top card: query + intent + timeline ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

        {/* Query bar */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <p className="flex-1 text-[14.5px] font-semibold tracking-tight text-gray-900">
            "Find Sony headphones under ₹5000"
          </p>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11.5px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Intent Recognized
          </span>
        </div>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">

          {/* Intent breakdown */}
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:border-b-0 sm:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Extracted Intent
            </p>
            <div className="flex flex-wrap gap-2">
              <IntentTag label="Brand" value="Sony" />
              <IntentTag label="Category" value="Headphones" />
              <IntentTag label="Budget" value="₹5,000" />
            </div>
          </div>

          {/* Action timeline */}
          <div className="flex flex-col gap-3 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Actions Taken
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Understanding request",
                "Searching products",
                "Comparing prices",
                "Selecting best products",
              ].map((step) => (
                <ActionStep key={step} label={step} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight text-gray-900">
            {products.length} products found
          </h2>
          <p className="text-[12.5px] text-gray-400">
            Ranked by AI relevance score
          </p>
        </div>
        <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-600">
          All under ₹5,000
        </span>
      </div>

      {/* ── Product grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  </section>
);

export default SearchExperience;
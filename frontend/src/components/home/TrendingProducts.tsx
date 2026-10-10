import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, ArrowRight } from "lucide-react";
import { useInView } from "./useInView";

interface TrendingItem {
  id: string;
  title: string;
  query: string;
  price: string;
  rating: number;
  reviews: string;
  store: "Amazon" | "Flipkart" | "Myntra";
  storeColor: string;
  imageUrl: string;
}

const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: "sony-wh-ch520",
    title: "Sony WH-CH520 Wireless Headphones",
    query: "Sony WH-CH520 Wireless Headphones",
    price: "₹4,499",
    rating: 4.5,
    reviews: "12,482",
    store: "Amazon",
    storeColor: "#FF9900",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "boat-wave-style",
    title: "boAt Wave Style Smart Watch",
    query: "boAt Wave Style Smart Watch",
    price: "₹1,299",
    rating: 4.3,
    reviews: "8,219",
    store: "Flipkart",
    storeColor: "#2874F0",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "hp-pavilion-15",
    title: "HP Pavilion 15 Laptop (16GB/512GB)",
    query: "HP Pavilion 15 Laptop 16GB 512GB SSD",
    price: "₹52,990",
    rating: 4.4,
    reviews: "9,482",
    store: "Amazon",
    storeColor: "#FF9900",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "nike-air-max",
    title: "Nike Air Max Running Shoes",
    query: "Nike Air Max Running Shoes",
    price: "₹7,499",
    rating: 4.6,
    reviews: "5,721",
    store: "Myntra",
    storeColor: "#FF3F6C",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "canon-eos-1500d",
    title: "Canon EOS 1500D DSLR Camera",
    query: "Canon EOS 1500D DSLR Camera with EF S18-55 is II Lens",
    price: "₹31,990",
    rating: 4.4,
    reviews: "4,211",
    store: "Amazon",
    storeColor: "#FF9900",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "oneplus-nord-buds-2",
    title: "OnePlus Nord Buds 2 True Wireless Earbuds",
    query: "OnePlus Nord Buds 2 True Wireless Earbuds",
    price: "₹2,299",
    rating: 4.5,
    reviews: "7,855",
    store: "Flipkart",
    storeColor: "#2874F0",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80",
  },
];

const TrendingProducts: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProductClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative w-full py-16 overflow-hidden">
      {/* ── Background Atmosphere & Dotted Grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 select-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Ambient peach & lavender glow blobs */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #FED7AA 0%, #FB923C 50%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl select-none"
        style={{ background: "radial-gradient(circle, #DDD6FE 0%, #A855F7 50%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D0B1E]">
              Trending Products
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#7A7068]">
              Popular products people are searching for right now.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/search?q=trending")}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
          >
            <span>View More</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Product Cards Row */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {TRENDING_ITEMS.map((item, idx) => {
            const isSaved = !!wishlist[item.id];
            return (
              <div
                key={item.id}
                onClick={() => handleProductClick(item.query)}
                style={{
                  transitionDelay: inView ? `${idx * 40}ms` : "0ms",
                  boxShadow: "0 2px 10px rgba(13,11,30,0.04)",
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border border-[#E8E2D9] bg-white/95 p-3.5 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-300 hover:shadow-xl ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {/* Wishlist button */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, item.id)}
                  aria-label="Save to wishlist"
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-200 hover:scale-110"
                >
                  <Heart
                    className="h-4 w-4"
                    style={{
                      color: isSaved ? "#EF4444" : "#A89F95",
                      fill: isSaved ? "#EF4444" : "none",
                    }}
                  />
                </button>

                {/* Product Image */}
                <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-[#FAF7F2] p-2">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-108"
                  />
                </div>

                {/* Details */}
                <div className="mt-3 flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold leading-tight text-[#0D0B1E] line-clamp-2 group-hover:text-[#7C3AED] transition-colors">
                      {item.title}
                    </h3>

                    {/* Star Rating */}
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className="flex items-center text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                      </div>
                      <span className="text-[11px] font-bold text-[#0D0B1E]">{item.rating}</span>
                      <span className="text-[10px] text-[#A89F95]">({item.reviews})</span>
                    </div>
                  </div>

                  {/* Price & Retailer badge */}
                  <div className="mt-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm sm:text-base font-extrabold text-[#0D0B1E]">
                        {item.price}
                      </span>
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-tight"
                        style={{
                          backgroundColor: `${item.storeColor}15`,
                          color: item.storeColor === "#FF9900" ? "#B45309" : item.storeColor,
                        }}
                      >
                        {item.store}
                      </span>
                    </div>

                    {/* View Product CTA */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(item.query);
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                        boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
                      }}
                    >
                      View Product
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;


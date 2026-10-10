import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Compass, Sparkles } from "lucide-react";
import PageBackground from "../components/common/PageBackground";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-xl">
          <div
            className="rounded-3xl border px-6 py-10 sm:px-10 sm:py-14 flex flex-col items-center text-center"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(20px)",
              borderColor: "#E8E2D9",
              boxShadow: "0 20px 60px rgba(124,58,237,0.12), 0 0 0 1px rgba(13,11,30,0.04)",
            }}
          >
            {/* Icon */}
            <div className="relative mb-6">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ background: "linear-gradient(135deg, #7C3AED, #F97316)" }}
              />
              <div
                className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 60%, #F97316 100%)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.40)",
                }}
              >
                <Compass className="h-11 w-11 sm:h-14 sm:w-14 text-white" strokeWidth={1.5} />
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full shadow-md"
                style={{ background: "#FFFFFF", border: "1px solid #E8E2D9" }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "#7C3AED" }} strokeWidth={2} />
              </div>
            </div>

            {/* 404 */}
            <p
              className="text-6xl sm:text-8xl font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #F97316 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              404
            </p>

            {/* Title */}
            <h1
              className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "#0D0B1E" }}
            >
              Page Not Found
            </h1>

            {/* Subtitle */}
            <p
              className="mt-4 max-w-md text-base sm:text-lg leading-relaxed"
              style={{ color: "#7A7068" }}
            >
              The page you're looking for doesn't exist. Head back and keep exploring.
            </p>

            {/* Divider */}
            <div
              className="my-8 h-px w-full max-w-xs"
              style={{
                background: "linear-gradient(90deg, transparent, #DDD6FE, transparent)",
              }}
            />

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.40)",
              }}
            >
              <Home className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Go Home
            </button>
          </div>

          <p className="mt-6 text-center text-xs sm:text-sm" style={{ color: "#A89F95" }}>
            Error code: 404 — this aisle doesn't exist.
          </p>
        </div>
      </div>
    </PageBackground>
  );
};

export default NotFound;
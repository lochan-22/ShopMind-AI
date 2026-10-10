import React from "react";

/**
 * Reusable warm-cream page background with subtle dot grid and
 * decorative SVG paint stroke accents.
 *
 * Usage: Wrap any page content inside <PageBackground>...</PageBackground>
 */
interface PageBackgroundProps {
  children: React.ReactNode;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** Show decorative paint strokes / blobs */
  decorative?: boolean;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({
  children,
  className = "",
  decorative = true,
}) => (
  <div
    className={`relative flex min-h-screen min-h-[100dvh] w-full flex-col ${className}`}
    style={{
      backgroundColor: "#FAF7F2",
      backgroundImage: "radial-gradient(circle, #DDD6FE 1.2px, transparent 1.2px)",
      backgroundSize: "30px 30px",
    }}
  >
    {decorative && (
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Purple glow blob — top right */}
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle at center, #A78BFA 0%, #7C3AED 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Orange glow blob — bottom left */}
        <div
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle at center, #FB923C 0%, #F97316 40%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        {/* Subtle top orange accent line */}
        <svg
          className="absolute top-0 left-0 w-full"
          height="4"
          viewBox="0 0 1440 4"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="topline" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="30%" stopColor="#7C3AED" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#F97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1440" height="4" fill="url(#topline)" />
        </svg>

        {/* Abstract paint stroke — upper left */}
        <svg
          className="absolute top-20 -left-8 opacity-[0.07]"
          width="200"
          height="120"
          viewBox="0 0 200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 80 Q 60 10, 120 60 Q 170 100, 190 40"
            stroke="#7C3AED"
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Abstract paint stroke — lower right */}
        <svg
          className="absolute bottom-20 -right-8 opacity-[0.08]"
          width="180"
          height="100"
          viewBox="0 0 180 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 50 Q 50 10, 100 50 Q 140 90, 170 40"
            stroke="#F97316"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )}

    {/* Content layer */}
    <div className="relative z-10 flex flex-1 flex-col">{children}</div>
  </div>
);

export default PageBackground;

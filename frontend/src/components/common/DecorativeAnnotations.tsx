import React from "react";

/**
 * Hand-drawn SVG annotations, brush strokes, watercolor splashes,
 * and tech doodles matching the ShopMind AI design reference.
 */

// 1. Hand-drawn text annotation with curved arrow
export const HandDrawnAnnotation: React.FC<{
  text: string;
  className?: string;
  arrowDirection?: "up-right" | "down-right" | "down-left" | "up-left";
  color?: string;
}> = ({ text, className = "", arrowDirection = "up-right", color = "#1E1040" }) => (
  <div className={`inline-flex items-center gap-1 select-none pointer-events-none ${className}`}>
    <span
      className="font-serif italic font-bold tracking-wide text-xs sm:text-sm whitespace-nowrap"
      style={{
        color,
        fontFamily: "'Caveat', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif",
        transform: "rotate(-4deg)",
      }}
    >
      {text}
    </span>
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {arrowDirection === "up-right" && (
        <path
          d="M3 17C7 15 14 11 19 4M19 4C15 4 13 5 13 5M19 4C18 7 18 10 18 10"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {arrowDirection === "down-right" && (
        <path
          d="M3 3C7 6 13 12 19 16M19 16C15 16 13 15 13 15M19 16C18 13 18 10 18 10"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {arrowDirection === "down-left" && (
        <path
          d="M21 3C17 6 11 12 5 16M5 16C9 16 11 15 11 15M5 16C6 13 6 10 6 10"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  </div>
);

// 2. Large Watercolor & Pastel Glow Splashes
export const WatercolorSplash: React.FC<{
  type: "top-left" | "top-right" | "mid-left" | "mid-right" | "bottom";
  className?: string;
}> = ({ type, className = "" }) => {
  if (type === "top-left") {
    return (
      <div className={`pointer-events-none absolute -top-10 -left-16 w-[420px] h-[360px] select-none opacity-40 blur-2xl ${className}`}>
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #DDD6FE 0%, #F5D0FE 45%, #FED7AA 75%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  if (type === "top-right") {
    return (
      <div className={`pointer-events-none absolute -top-12 -right-16 w-[440px] h-[380px] select-none opacity-35 blur-2xl ${className}`}>
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle at 70% 30%, #C4B5FD 0%, #E9D5FF 40%, #FFEDD5 80%, transparent 100%)",
          }}
        />
      </div>
    );
  }

  if (type === "mid-left") {
    return (
      <div className={`pointer-events-none absolute top-1/3 -left-20 w-[380px] h-[380px] select-none opacity-30 blur-2xl ${className}`}>
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle, #E9D5FF 0%, #DDD6FE 50%, transparent 80%)",
          }}
        />
      </div>
    );
  }

  if (type === "mid-right") {
    return (
      <div className={`pointer-events-none absolute top-1/2 -right-20 w-[380px] h-[380px] select-none opacity-30 blur-2xl ${className}`}>
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle, #FED7AA 0%, #FDBA74 40%, transparent 80%)",
          }}
        />
      </div>
    );
  }

  return null;
};

// 3. Peach / Terracotta Painterly Curved Arches (Top-Left under hero)
export const PaintArches: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`pointer-events-none select-none ${className}`}
    width="220"
    height="180"
    viewBox="0 0 220 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 170 C10 80, 70 20, 160 20 C200 20, 215 35, 215 35"
      stroke="#FDBA74"
      strokeWidth="9"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M25 170 C25 95, 80 40, 155 40 C190 40, 205 52, 205 52"
      stroke="#FED7AA"
      strokeWidth="7"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M40 170 C40 110, 90 60, 150 60 C180 60, 195 70, 195 70"
      stroke="#FB923C"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.45"
    />
    <path
      d="M55 170 C55 125, 100 80, 145 80"
      stroke="#F97316"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.35"
    />
  </svg>
);

// 4. Eyeglasses Wireframe Doodle (Left Hero)
export const EyeglassesDoodle: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`pointer-events-none select-none opacity-25 ${className}`}
    width="90"
    height="50"
    viewBox="0 0 90 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="5" y="10" width="32" height="28" rx="8" stroke="#7C3AED" strokeWidth="2.2" />
    <rect x="53" y="10" width="32" height="28" rx="8" stroke="#7C3AED" strokeWidth="2.2" />
    <path d="M37 20 C42 16 48 16 53 20" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M5 14 L0 10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
    <path d="M85 14 L90 10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 5. Hand-Drawn Shopping Cart Outline with Dotted Trail
export const ShoppingCartDoodle: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`pointer-events-none select-none ${className}`}
    width="140"
    height="100"
    viewBox="0 0 140 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Speed lines */}
    <path d="M5 30 L25 30" stroke="#7C3AED" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.4" />
    <path d="M10 45 L30 45" stroke="#7C3AED" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.4" />
    <path d="M5 60 L20 60" stroke="#7C3AED" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.4" />

    {/* Cart body */}
    <path
      d="M32 20 L42 20 L52 65 L108 65 L120 32 L46 32"
      stroke="#7C3AED"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
    <path d="M60 32 L65 65" stroke="#7C3AED" strokeWidth="1.4" opacity="0.5" />
    <path d="M78 32 L81 65" stroke="#7C3AED" strokeWidth="1.4" opacity="0.5" />
    <path d="M96 32 L97 65" stroke="#7C3AED" strokeWidth="1.4" opacity="0.5" />
    <path d="M50 48 L114 48" stroke="#7C3AED" strokeWidth="1.4" opacity="0.5" />

    {/* Wheels */}
    <circle cx="60" cy="78" r="8" stroke="#7C3AED" strokeWidth="2.2" opacity="0.6" />
    <circle cx="102" cy="78" r="8" stroke="#7C3AED" strokeWidth="2.2" opacity="0.6" />
  </svg>
);

// 6. "Smart Shopping Simplified" Badge on Purple Paint Stroke
export const SmartShoppingBadge: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}>
    {/* Paint swatch SVG */}
    <svg width="190" height="90" viewBox="0 0 190 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 35 C45 20, 140 15, 175 30 C185 48, 160 70, 120 75 C80 80, 20 75, 10 55 Z"
        fill="#DDD6FE"
        opacity="0.65"
      />
      <path
        d="M25 40 C60 30, 130 25, 165 38 C175 52, 145 68, 110 70 C75 72, 30 65, 20 50 Z"
        fill="#C4B5FD"
        opacity="0.5"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-6">
      <span
        className="font-serif italic font-extrabold text-sm sm:text-base tracking-tight"
        style={{
          color: "#4C1D95",
          fontFamily: "'Caveat', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif",
        }}
      >
        Smart
      </span>
      <span
        className="font-serif italic font-extrabold text-sm sm:text-base tracking-tight -mt-1"
        style={{
          color: "#4C1D95",
          fontFamily: "'Caveat', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif",
        }}
      >
        Shopping
      </span>
      <span
        className="font-serif italic font-bold text-xs sm:text-sm tracking-tight text-purple-700 -mt-1"
        style={{
          fontFamily: "'Caveat', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif",
        }}
      >
        Simplified
      </span>
    </div>
  </div>
);

// 7. "Find Better Deals Everyday" Badge on Peach/Orange Paint Stroke
export const FindDealsBadge: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}>
    {/* Paint swatch SVG */}
    <svg width="200" height="95" viewBox="0 0 200 95" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 30 C60 15, 150 18, 185 35 C195 55, 165 80, 115 82 C65 84, 15 75, 12 50 Z"
        fill="#FED7AA"
        opacity="0.65"
      />
      <path
        d="M30 35 C70 22, 140 25, 175 42 C180 58, 150 72, 105 75 C60 76, 25 68, 22 48 Z"
        fill="#FDBA74"
        opacity="0.5"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center rotate-3">
      <span
        className="font-serif italic font-extrabold text-sm sm:text-base tracking-tight"
        style={{
          color: "#9A3412",
          fontFamily: "'Caveat', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif",
        }}
      >
        Find
      </span>
      <span
        className="font-serif italic font-extrabold text-sm sm:text-base tracking-tight -mt-1"
        style={{
          color: "#9A3412",
          fontFamily: "'Caveat', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif",
        }}
      >
        Better Deals
      </span>
      <span
        className="font-serif italic font-bold text-xs sm:text-sm tracking-tight text-orange-700 -mt-1"
        style={{
          fontFamily: "'Caveat', 'Comic Sans MS', 'Segoe Print', cursive, sans-serif",
        }}
      >
        Everyday
      </span>
    </div>
  </div>
);

// 8. Wireframe Laptop Doodle
export const LaptopDoodle: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`pointer-events-none select-none opacity-30 ${className}`}
    width="110"
    height="75"
    viewBox="0 0 110 75"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="15" y="5" width="80" height="52" rx="4" stroke="#7C3AED" strokeWidth="2" />
    <rect x="22" y="11" width="66" height="40" rx="2" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 2" />
    <path d="M2 57 L108 57 L100 68 L10 68 Z" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

// 9. Floating 3D/Vector Headphone Graphic
export const HeadphonesDoodle: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`pointer-events-none select-none opacity-45 ${className}`}
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 55 C18 32 32 15 50 15 C68 15 82 32 82 55"
      stroke="#7C3AED"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M22 55 C22 36 34 22 50 22 C66 22 78 36 78 55"
      stroke="#A855F7"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Left Earcup */}
    <rect x="10" y="50" width="16" height="30" rx="8" fill="#7C3AED" />
    <rect x="13" y="54" width="10" height="22" rx="5" fill="#C4B5FD" />
    {/* Right Earcup */}
    <rect x="74" y="50" width="16" height="30" rx="8" fill="#7C3AED" />
    <rect x="77" y="54" width="10" height="22" rx="5" fill="#C4B5FD" />
  </svg>
);

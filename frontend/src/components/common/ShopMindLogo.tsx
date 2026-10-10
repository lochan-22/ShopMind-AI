import React from "react";

export interface ShopMindLogoProps {
  /** Logo variant: "full" includes mascot + text; "icon" includes mascot only. */
  variant?: "full" | "icon";
  /** Size variant: "xs" (24px), "sm" (34px), "md" (46px), "lg" (72px). Default is "sm". */
  size?: "xs" | "sm" | "md" | "lg";
  /** Optional container class name. */
  className?: string;
  /** Optional text color override for dark backgrounds. */
  lightText?: boolean;
}

export const ShopMindLogo: React.FC<ShopMindLogoProps> = ({
  variant = "full",
  size = "sm",
  className = "",
  lightText = false,
}) => {
  const iconSizes = {
    xs: "h-6 w-6",
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-20 w-20",
  };

  const textSizes = {
    xs: "text-xs",
    sm: "text-[15.5px]",
    md: "text-lg",
    lg: "text-3xl sm:text-4xl",
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Official ShopMind AI 3D Floating Orb Mascot */}
      <img
        src="/shopmind-mascot-transparent.png"
        alt="ShopMind AI Mascot"
        className={`${iconSizes[size]} object-contain shrink-0 filter drop-shadow-sm`}
      />

      {/* Brand Name Wordmark: ShopMind (Dark Navy / White) AI (Purple Gradient) */}
      {variant === "full" && (
        <span
          className={`${textSizes[size]} font-extrabold tracking-tight ${
            lightText ? "text-white" : "text-[#0D0B1E]"
          }`}
        >
          ShopMind{" "}
          <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-black">
            AI
          </span>
        </span>
      )}
    </div>
  );
};

export default ShopMindLogo;

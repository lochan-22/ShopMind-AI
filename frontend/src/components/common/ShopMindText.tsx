import React from "react";

export interface ShopMindTextProps {
  className?: string;
  lightText?: boolean;
  light?: boolean;
  showAi?: boolean;
}

export const ShopMindText: React.FC<ShopMindTextProps> = ({
  className = "",
  lightText = false,
  light = false,
  showAi = true,
}) => {
  const isLight = light || lightText;

  return (
    <span className={`font-bold tracking-tight inline-flex items-center ${className}`}>
      <span className={isLight ? "text-white" : "text-[#0D0B1E]"}>ShopMind</span>
      {showAi && (
        <span className="ml-1 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">
          AI
        </span>
      )}
    </span>
  );
};

export default ShopMindText;


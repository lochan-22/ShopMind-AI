import React from "react";
import { HandDrawnAnnotation } from "../common/DecorativeAnnotations";

/**
 * Decorative Product Outline SVG Illustrations
 * High-precision, subtle technical line art matching the futuristic shopping aesthetic.
 */

// 1. Headphones Outline
const HeadphonesOutline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-2xl border border-purple-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 ${className}`}
    style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.12)" }}
  >
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 26 C8 15.5 15.5 8 24 8 C32.5 8 40 15.5 40 26"
        stroke="#7C3AED"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M11 26 C11 17.5 17 11 24 11 C31 11 37 17.5 37 26"
        stroke="#A855F7"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Left Earcup */}
      <rect x="5" y="24" width="7" height="15" rx="3.5" fill="#7C3AED" />
      <rect x="10" y="26" width="3" height="11" rx="1.5" fill="#C4B5FD" />
      {/* Right Earcup */}
      <rect x="36" y="24" width="7" height="15" rx="3.5" fill="#7C3AED" />
      <rect x="35" y="26" width="3" height="11" rx="1.5" fill="#C4B5FD" />
    </svg>
  </div>
);

// 2. Laptop Outline
const LaptopOutline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-2xl border border-purple-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 ${className}`}
    style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.12)" }}
  >
    <svg width="40" height="32" viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Screen Lid */}
      <rect x="8" y="4" width="36" height="24" rx="3" stroke="#7C3AED" strokeWidth="2.4" fill="#F5F3FF" />
      <rect x="12" y="7" width="28" height="18" rx="1.5" stroke="#A855F7" strokeWidth="1" strokeDasharray="3 2" fill="#EDE9FE" />
      {/* Screen Camera */}
      <circle cx="26" cy="5.5" r="0.8" fill="#7C3AED" />
      {/* Base */}
      <path d="M2 30 L50 30 L46 35 L6 35 Z" stroke="#6D28D9" strokeWidth="2.2" strokeLinejoin="round" fill="#DDD6FE" />
      <line x1="22" y1="31" x2="30" y2="31" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// 3. Smartphone Outline
const SmartphoneOutline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-2xl border border-purple-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 ${className}`}
    style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.12)" }}
  >
    <svg width="28" height="38" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="26" height="40" rx="6" stroke="#7C3AED" strokeWidth="2.2" fill="#FAF5FF" />
      <rect x="7" y="6" width="20" height="34" rx="3" stroke="#C4B5FD" strokeWidth="1" fill="#EDE9FE" />
      {/* Dynamic island pill */}
      <rect x="13" y="4.5" width="8" height="2.2" rx="1.1" fill="#7C3AED" />
      {/* Home bar */}
      <line x1="12" y1="38" x2="22" y2="38" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// 4. Smartwatch Outline
const SmartwatchOutline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-2xl border border-purple-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 ${className}`}
    style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.12)" }}
  >
    <svg width="34" height="38" viewBox="0 0 42 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Strap Top */}
      <path d="M14 2 L28 2 L27 9 L15 9 Z" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.6" />
      {/* Watch Dial */}
      <rect x="8" y="9" width="26" height="28" rx="8" stroke="#7C3AED" strokeWidth="2.4" fill="#F5F3FF" />
      <circle cx="21" cy="23" r="8" stroke="#A855F7" strokeWidth="1.2" strokeDasharray="3 2" />
      <circle cx="21" cy="23" r="3" fill="#7C3AED" />
      {/* Crown button */}
      <rect x="34" y="18" width="3" height="6" rx="1" fill="#7C3AED" />
      {/* Strap Bottom */}
      <path d="M15 37 L27 37 L28 44 L14 44 Z" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.6" />
    </svg>
  </div>
);

// 5. Sneaker Outline
const SneakerOutline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-2xl border border-purple-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 ${className}`}
    style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.12)" }}
  >
    <svg width="42" height="28" viewBox="0 0 54 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sneaker contour */}
      <path
        d="M6 24 C6 24 8 18 12 16 C16 14 22 14 26 18 L36 18 C40 18 46 22 48 26 L5 26"
        stroke="#7C3AED"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FAF5FF"
      />
      {/* Sole */}
      <path
        d="M4 26 L50 26 C50 29 46 32 40 32 L10 32 C6 32 4 29 4 26 Z"
        fill="#DDD6FE"
        stroke="#6D28D9"
        strokeWidth="2"
      />
      {/* Collar & Laces */}
      <path d="M12 16 L15 10 C16 8 20 8 22 11 L24 16" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="14" x2="25" y2="17" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="18" x2="27" y2="21" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// 6. Camera Outline
const CameraOutline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-2xl border border-purple-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 ${className}`}
    style={{ boxShadow: "0 8px 24px rgba(124, 58, 237, 0.12)" }}
  >
    <svg width="38" height="32" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flash prism */}
      <path d="M18 6 L30 6 L33 11 L15 11 Z" stroke="#7C3AED" strokeWidth="1.8" fill="#EDE9FE" />
      {/* Camera body */}
      <rect x="4" y="11" width="40" height="24" rx="5" stroke="#7C3AED" strokeWidth="2.2" fill="#FAF5FF" />
      {/* Lens */}
      <circle cx="24" cy="23" r="8" stroke="#7C3AED" strokeWidth="2.2" fill="#EDE9FE" />
      <circle cx="24" cy="23" r="4.5" stroke="#A855F7" strokeWidth="1.4" fill="#C4B5FD" />
      {/* Shutter button */}
      <rect x="8" y="8" width="5" height="3" rx="1" fill="#7C3AED" />
      {/* Sensor dot */}
      <circle cx="38" cy="16" r="1.5" fill="#F97316" />
    </svg>
  </div>
);

// 7. Shopping Cart Badge
const ShoppingCartOutline: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 text-white shadow-xl transition-all hover:scale-110 ${className}`}
    style={{ boxShadow: "0 8px 25px rgba(124, 58, 237, 0.45)" }}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  </div>
);

/**
 * Main HeroVisual Component
 * Houses the official ShopMind AI 3D mascot prominently on the right, surrounded by:
 * - Concentric futuristic orbital rings
 * - Decorative product outlines (headphones, laptop, smartphone, smartwatch, sneaker, camera, shopping cart)
 * - Hand-drawn annotations (Better Choices, Compare Prices Save More, Shop with AI)
 */
export const HeroVisual: React.FC = () => {
  return (
    <div className="relative flex w-full items-center justify-center select-none">
      {/* ── Hand-Drawn Annotations Around the Showcase ── */}
      <div className="pointer-events-none absolute -top-7 left-4 sm:left-10 z-20">
        <HandDrawnAnnotation text="Better Choices" color="#0D0B1E" arrowDirection="up-right" />
      </div>

      <div className="pointer-events-none absolute -top-9 right-0 sm:right-4 z-20">
        <HandDrawnAnnotation text="Compare Prices Save More" color="#0D0B1E" arrowDirection="down-right" />
      </div>

      <div className="pointer-events-none absolute top-1/2 -right-4 sm:-right-10 z-20 hidden sm:block">
        <HandDrawnAnnotation text="Shop with AI" color="#0D0B1E" arrowDirection="up-right" />
      </div>

      {/* ── Layered Glow Aura Behind Mascot ── */}
      <div
        className="pointer-events-none absolute h-72 w-72 sm:h-80 sm:w-80 rounded-full blur-3xl opacity-35"
        style={{
          background: "radial-gradient(circle, #A855F7 0%, #7C3AED 40%, #FB923C 85%, transparent 100%)",
        }}
      />

      {/* ── Futuristic Concentric Orbital Rings ── */}
      <div className="relative flex h-80 w-80 sm:h-96 sm:w-96 items-center justify-center">

        {/* Outer Orbit Track */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full border border-purple-300/40"
          style={{
            borderStyle: "dashed",
            borderWidth: "1.5px",
          }}
        />

        {/* Middle Orbit Glow Ring */}
        <div
          className="pointer-events-none absolute inset-6 rounded-full border border-purple-200/60"
          style={{
            background: "radial-gradient(circle, rgba(237, 233, 254, 0.25) 0%, transparent 70%)",
          }}
        />

        {/* Inner Technical Arc Ring */}
        <svg
          className="pointer-events-none absolute inset-10 h-[calc(100%-5rem)] w-[calc(100%-5rem)] opacity-25"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="90" stroke="#7C3AED" strokeWidth="1" strokeDasharray="6 4" />
          <circle cx="100" cy="100" r="75" stroke="#F97316" strokeWidth="0.8" strokeDasharray="3 5" />
          {/* Technical crosshairs */}
          <line x1="100" y1="2" x2="100" y2="12" stroke="#7C3AED" strokeWidth="1.5" />
          <line x1="100" y1="188" x2="100" y2="198" stroke="#7C3AED" strokeWidth="1.5" />
          <line x1="2" y1="100" x2="12" y2="100" stroke="#7C3AED" strokeWidth="1.5" />
          <line x1="188" y1="100" x2="198" y2="100" stroke="#7C3AED" strokeWidth="1.5" />
        </svg>

        {/* ── Center: Official 3D ShopMind AI Mascot ── */}
        <div className="relative z-10 flex items-center justify-center">
          <img
            src="/shopmind-mascot-transparent.png"
            alt="ShopMind AI Mascot"
            className="h-48 w-48 sm:h-56 sm:w-56 object-contain filter drop-shadow-2xl transition-transform duration-700 hover:scale-105"
            style={{
              filter: "drop-shadow(0 14px 28px rgba(124, 58, 237, 0.35)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08))",
            }}
          />
        </div>

        {/* ── DECORATIVE PRODUCT OUTLINES AROUND MASCOT ── */}

        {/* 1. Headphones (Top Center-Left) */}
        <div className="pointer-events-none absolute -top-3 left-8 animate-bounce-slow" style={{ animationDelay: "0s" }}>
          <HeadphonesOutline />
        </div>

        {/* 2. Laptop (Top Right) */}
        <div className="pointer-events-none absolute top-2 -right-2 animate-bounce-slow" style={{ animationDelay: "0.8s" }}>
          <LaptopOutline />
        </div>

        {/* 3. Smartphone (Middle Right) */}
        <div className="pointer-events-none absolute top-32 -right-5 animate-bounce-slow" style={{ animationDelay: "1.6s" }}>
          <SmartphoneOutline />
        </div>

        {/* 4. Smartwatch (Bottom Right) */}
        <div className="pointer-events-none absolute bottom-6 right-2 animate-bounce-slow" style={{ animationDelay: "2.2s" }}>
          <SmartwatchOutline />
        </div>

        {/* 5. Camera (Bottom Center-Right) */}
        <div className="pointer-events-none absolute -bottom-4 right-20 animate-bounce-slow" style={{ animationDelay: "1.1s" }}>
          <CameraOutline />
        </div>

        {/* 6. Sneaker (Bottom Left) */}
        <div className="pointer-events-none absolute bottom-5 left-2 animate-bounce-slow" style={{ animationDelay: "1.9s" }}>
          <SneakerOutline />
        </div>

        {/* 7. Shopping Cart Badge (Lower-Left Orbit) */}
        <div className="pointer-events-none absolute -bottom-3 left-24 animate-bounce-slow" style={{ animationDelay: "0.4s" }}>
          <ShoppingCartOutline />
        </div>

      </div>
    </div>
  );
};

export default HeroVisual;

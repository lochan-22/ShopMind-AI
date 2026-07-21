import type { Config } from "tailwindcss";

/**
 * ShopMind AI design system — Tailwind CSS v4 companion config.
 *
 * Design tokens (colors, typography, spacing, radius, shadows, transitions)
 * are defined in CSS via @theme inside src/styles/tokens.css.
 *
 * This file enables IDE autocomplete and documents content paths.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
} satisfies Config;

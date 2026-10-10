import React from "react";
import ShopMindLogo from "./ShopMindLogo";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const links = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "About", href: "/#how-it-works" },
    { label: "Contact", href: "mailto:support@shopmind.ai" },
  ];

  return (
    <footer
      className="relative w-full border-t px-4 py-8 sm:px-6 lg:px-8 overflow-hidden select-none"
      style={{
        backgroundColor: "#FAF7F2",
        borderColor: "#E8E2D9",
      }}
    >
      {/* Subtle bottom atmospheric dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 select-none">
          <ShopMindLogo variant="full" size="xs" />
        </div>

        {/* Footer Navigation Links */}
        <nav className="flex items-center gap-6" aria-label="Footer navigation">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[13px] font-medium text-[#7A7068] transition-colors hover:text-[#7C3AED]"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-[12px] text-[#A89F95]">
          © {year} ShopMind AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
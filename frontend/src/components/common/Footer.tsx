import React from "react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const links = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <footer className="w-full border-t border-gray-100 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">

        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-900">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-gray-700">
            ShopMind AI
          </span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-5">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[12.5px] text-gray-400 transition hover:text-gray-700"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-[12px] text-gray-400">
          © {year} ShopMind AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ExternalLink, Sparkles } from "lucide-react";
import ShopMindLogo from "./ShopMindLogo";

/* Clean vector icons for GitHub and LinkedIn matching Feather/Lucide geometry */
const GithubIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const handleNav = (href: string) => {
    if (href.startsWith("mailto:") || href.startsWith("http:") || href.startsWith("https:")) {
      window.location.href = href;
      return;
    }
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      if (window.location.pathname === "/") {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      } else {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
        return;
      }
    }
    navigate(href);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "Deals", href: "/deals" },
    { label: "Compare", href: "/compare" },
    { label: "About", href: "/about" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact Support", href: "mailto:lochanap2005@gmail.com?subject=ShopMind%20AI%20Support", isExternal: true },
  ];

  return (
    <footer
      className="relative w-full border-t border-[#E5DFD5] pt-14 pb-28 sm:pt-16 sm:pb-32 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "#F3EFEA",
      }}
    >
      {/* Subtle atmospheric dot grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(124, 58, 237, 0.12) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Main 4-column responsive grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 pb-12">
          {/* Column 1: Brand & Tagline (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-6">
            <div className="flex items-center gap-2">
              <ShopMindLogo variant="full" size="sm" />
            </div>

            <p className="mt-4 text-xs sm:text-sm font-semibold tracking-wide text-[#7C3AED]">
              Shop smarter. Compare better. Choose confidently.
            </p>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#7A7068] max-w-sm">
              ShopMind AI helps you discover products, compare sellers, evaluate prices, and make smarter shopping decisions with AI.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#5A5248] shadow-2xs backdrop-blur-xs">
              <Sparkles className="h-3 w-3 text-[#7C3AED]" />
              <span>Real-Time Google Shopping Intelligence</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D0B1E]">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => handleNav(item.href)}
                    className="text-xs sm:text-[13px] font-medium text-[#7A7068] transition-colors hover:text-[#7C3AED] focus:outline-hidden focus-visible:text-[#7C3AED]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & Information (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D0B1E]">
              Legal & Info
            </h3>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  {item.isExternal ? (
                    <a
                      href={item.href}
                      title={item.label === "Contact Support" ? "Contact ShopMind AI Support (lochanap2005@gmail.com)" : item.label}
                      className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-[#7A7068] transition-colors hover:text-[#7C3AED] focus:outline-hidden focus-visible:text-[#7C3AED]"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNav(item.href)}
                      className="text-xs sm:text-[13px] font-medium text-[#7A7068] transition-colors hover:text-[#7C3AED] focus:outline-hidden focus-visible:text-[#7C3AED]"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Developer (3 cols on lg) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D0B1E]">
              Connect & Developer
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-[#7A7068]">
              Created by Lochan P Anchalkar. Reach out for project feedback, inquiries, or collaboration.
            </p>

            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="mailto:lochanap2005@gmail.com?subject=ShopMind%20AI%20Support"
                  title="Send email to lochanap2005@gmail.com"
                  className="group inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-[#5A5248] transition-colors hover:text-[#7C3AED] focus:outline-hidden focus-visible:text-[#7C3AED]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8E2D9] bg-white text-[#7C3AED] transition-all group-hover:border-purple-300 group-hover:bg-purple-50">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">lochanap2005@gmail.com</span>
                </a>
              </li>

              <li>
                <a
                  href="https://github.com/lochan-22"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-[#5A5248] transition-colors hover:text-[#7C3AED] focus:outline-hidden focus-visible:text-[#7C3AED]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8E2D9] bg-white text-[#7C3AED] transition-all group-hover:border-purple-300 group-hover:bg-purple-50">
                    <GithubIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>github.com/lochan-22</span>
                  <ExternalLink className="h-3 w-3 text-[#A89F95] opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>

              <li>
                <a
                  href="https://linkedin.com/in/lochan-p-anchalkar-6b70b02a6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-medium text-[#5A5248] transition-colors hover:text-[#7C3AED] focus:outline-hidden focus-visible:text-[#7C3AED]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8E2D9] bg-white text-[#7C3AED] transition-all group-hover:border-purple-300 group-hover:bg-purple-50">
                    <LinkedinIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="h-3 w-3 text-[#A89F95] opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-[#E8E2D9] pt-6" />

        {/* Copyright & Bottom Metadata Bar */}
        {/* Notice: Left and right placement keeps center clear for the fixed microphone button */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#A89F95]">
            © {year} ShopMind AI. All rights reserved.
          </p>

          <p className="text-xs text-[#A89F95]">
            AI Shopping Decision Engine · Google Shopping India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
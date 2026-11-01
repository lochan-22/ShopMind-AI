import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import { Logo } from "../brand/Logo";
import { GitHubIcon, LinkedInIcon } from "../brand/SocialIcons";
import { CREATOR, CREATOR_MAILTO } from "../../data/creator";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Ask ShopMind", to: "/search" },
      { label: "Curated collections", to: "/categories" },
      { label: "Live market", to: "/deals" },
      { label: "Compare products", to: "/compare" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Concierge", to: "/agent" },
      { label: "Your cart", to: "/cart" },
      { label: "About ShopMind", to: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms of service", to: "/terms" },
    ],
  },
];

const CONTACTS: { label: string; value: string; href: string; icon: ReactNode; external: boolean }[] = [
  { label: "Email", value: CREATOR.email, href: CREATOR_MAILTO, icon: <Mail className="h-4 w-4" />, external: false },
  { label: "GitHub", value: `github.com/${CREATOR.github.handle}`, href: CREATOR.github.url, icon: <GitHubIcon />, external: true },
  { label: "LinkedIn", value: CREATOR.name, href: CREATOR.linkedin.url, icon: <LinkedInIcon />, external: true },
];

export const Footer = () => (
  <footer className="relative overflow-hidden bg-night text-white">
    <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-jade-500/10 blur-3xl" aria-hidden="true" />
    <div className="container-x relative pb-10 pt-20">
      <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div className="max-w-sm">
          <Link to="/" aria-label="ShopMind AI home" className="-ml-1 inline-flex">
            <Logo variant="full" imgClassName="h-12 sm:h-14" />
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-white/55">
            An AI shopping assistant that reads what you need, checks live listings, and explains what's worth buying.
          </p>
          <p className="eyebrow mt-8 text-[10px] text-white/40">Get in touch</p>
          <ul className="mt-3 space-y-1">
            {CONTACTS.map((contact) => (
              <li key={contact.label}>
                <a
                  href={contact.href}
                  {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={`${contact.label}: ${contact.value}${contact.external ? " (opens in a new tab)" : ""}`}
                  className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/75 ring-1 ring-inset ring-white/10 transition-colors group-hover:text-white">
                    {contact.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10.5px] text-white/40">{contact.label}</span>
                    <span className="block truncate text-[13.5px] text-white/80 transition-colors group-hover:text-white">{contact.value}</span>
                  </span>
                  {contact.external && (
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/30 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="eyebrow text-[10px] text-white/40">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-20 select-none text-[clamp(3.5rem,13vw,10.5rem)] font-semibold leading-[0.85] tracking-[-0.06em] text-white/[0.06]" aria-hidden="true">
        ShopMind
      </p>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ShopMind AI. Prices and availability come from live retailer listings and can change.</p>
        <p>Analysis by OpenRouter models when available · Listings via Google Shopping</p>
      </div>
    </div>
  </footer>
);

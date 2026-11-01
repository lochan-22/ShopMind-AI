import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BrainCircuit, Database, Filter, Layers, Mail, Radar, ServerCog, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "../components/ui/Reveal";
import { Accent, SectionHeading } from "../components/ui/SectionHeading";
import { buttonClasses } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { GitHubIcon, LinkedInIcon } from "../components/brand/SocialIcons";
import { CREATOR, CREATOR_MAILTO } from "../data/creator";

const PIPELINE = [
  { icon: Sparkles, label: "Your request", detail: "Plain language, any budget" },
  { icon: BrainCircuit, label: "Intent", detail: "Category, budget, must-haves" },
  { icon: Radar, label: "Live listings", detail: "Google Shopping via SerpApi" },
  { icon: Filter, label: "Verification", detail: "Budget, category, specs, duplicates" },
  { icon: Layers, label: "Ranking", detail: "100-point transparent score" },
  { icon: ServerCog, label: "Insights", detail: "OpenRouter, or rule-based fallback" },
];

const STACK = [
  { title: "Interface", body: "React, TypeScript and Vite. Every price and spec on screen is rendered from the backend's response." },
  { title: "Decision engine", body: "A Python FastAPI service that parses intent, enforces hard limits, de-duplicates and scores every candidate." },
  { title: "Reasoning", body: "Language models through OpenRouter write the buying insights. If a model is unavailable, the engine says so and evaluates the listings itself." },
  { title: "Retrieval", body: "SerpApi fetches live Google Shopping listings with current prices, sellers and links. Keys never leave the server." },
];

const PROJECT_FOCUS = ["Intelligent product discovery", "Real-time shopping data integration", "AI-assisted purchasing decisions"];

const CREATOR_LINKS: { label: string; value: string; href: string; icon: ReactNode; external: boolean }[] = [
  { label: "Email", value: CREATOR.email, href: CREATOR_MAILTO, icon: <Mail className="h-[18px] w-[18px]" />, external: false },
  { label: "GitHub", value: `github.com/${CREATOR.github.handle}`, href: CREATOR.github.url, icon: <GitHubIcon className="h-[18px] w-[18px]" />, external: true },
  { label: "LinkedIn", value: CREATOR.name, href: CREATOR.linkedin.url, icon: <LinkedInIcon className="h-[18px] w-[18px]" />, external: true },
];

const ProjectCreator = () => (
  <section aria-labelledby="creator-heading" className="mt-24 border-t border-line pt-14 sm:mt-32 sm:pt-20">
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
      <Reveal>
        <p className="eyebrow text-muted">Project Creator</p>
        <h2 id="creator-heading" className="mt-5 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.75rem]">
          Designed and built by <Accent aurora>{CREATOR.name}</Accent>
        </h2>
        <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-muted">
          ShopMind AI is an independently developed AI shopping project. It turns a plain-language request into a reasoned shortlist, grounded in
          live retailer listings rather than a fixed catalogue.
        </p>
        <ul className="mt-8 space-y-3">
          {PROJECT_FOCUS.map((item, index) => (
            <li key={item} className="flex items-baseline gap-4 text-[14.5px] text-ink-2">
              <span className="font-mono text-[11px] text-faint">{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal index={1} className="lg:pt-10">
        <p className="eyebrow text-[10px] text-faint">Contact</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {CREATOR_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={`${link.label}: ${link.value}${link.external ? " (opens in a new tab)" : ""}`}
                className="group flex items-center gap-4 py-5 transition-colors"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-[background-color,color,border-color] duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                  {link.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11.5px] text-faint">{link.label}</span>
                  <span className="block truncate text-[15px] font-medium text-ink">{link.value}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition-[color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
);

const About = () => {
  useDocumentTitle("About");
  return (
    <div>
      <section className="container-x pb-20 pt-32 sm:pt-40">
        <div className="rise-in max-w-4xl">
          <p className="eyebrow text-muted">About ShopMind</p>
          <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[4.6rem]">
            Shopping is a research problem. <Accent aurora>We do the research.</Accent>
          </h1>
          <p className="mt-7 max-w-2xl text-[16.5px] leading-relaxed text-muted">
            Most stores show you everything and leave the deciding to you. ShopMind starts from what you need, narrows dozens of live listings to five
            that fit, and tells you why — including what each one gives up.
          </p>
        </div>
      </section>

      <section className="noise relative overflow-hidden bg-night text-white">
        <div className="pointer-events-none absolute -right-32 -top-20 h-[26rem] w-[26rem] rounded-full bg-jade-500/20 blur-[120px]" aria-hidden="true" />
        <div className="container-x relative py-24 sm:py-28">
          <SectionHeading tone="dark" eyebrow="The pipeline" title="From a sentence to a shortlist" description="Each stage runs on every search, in this order." />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-6">
            {PIPELINE.map((step, index) => (
              <Reveal key={step.label} index={index} className="group relative bg-night p-6 transition-colors duration-500 hover:bg-night-2">
                <li>
                  <span className="font-mono text-[11px] text-white/35">{String(index + 1).padStart(2, "0")}</span>
                  <step.icon className="mt-8 h-6 w-6 text-jade-300 transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.6} />
                  <p className="mt-4 font-medium tracking-tight">{step.label}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/50">{step.detail}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-24 sm:py-32">
        <SectionHeading
          eyebrow="How it's built"
          title={
            <>
              Four layers, <Accent>one rule</Accent>
            </>
          }
          description="The rule: product facts come from listings, and explanations come from analysis. The two are never mixed."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {STACK.map((item, index) => (
            <Reveal key={item.title} index={index} className="card p-7">
              <Database className="h-5 w-5 text-jade-600" strokeWidth={1.6} />
              <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{item.body}</p>
            </Reveal>
          ))}
        </div>

        <ProjectCreator />

        <Reveal className="mt-24 flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-line bg-surface p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">See it work on something you need.</h2>
            <p className="mt-2 text-[15px] text-muted">One sentence is enough to start.</p>
          </div>
          <Link to="/?focus=search" className={buttonClasses("primary", "lg")}>
            Start a search <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
};

export default About;

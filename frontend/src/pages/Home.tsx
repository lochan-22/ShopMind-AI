import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Compass,
  Filter,
  Gauge,
  ListFilter,
  MessagesSquare,
  Radar,
  Scale,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { SearchCommand } from "../components/search/SearchCommand";
import { CollectionTile } from "../components/category/CollectionTile";
import { Reveal } from "../components/ui/Reveal";
import { Accent, SectionHeading } from "../components/ui/SectionHeading";
import { buttonClasses } from "../components/ui/Button";
import { TypingIndicator } from "../agent/components/TypingIndicator";
import { LogoMark } from "../components/brand/Logo";
import { MAIN_CATEGORIES } from "../data/categoryData";
import { useAgent } from "../agent/AgentContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn } from "../utils/cn";

const HERO_CHIPS = [
  "Camera phone under ₹40,000",
  "RTX gaming laptop under ₹80,000",
  "ANC headphones for travel",
  "Air fryer for a family of four",
];

const STEPS = [
  {
    icon: ScanSearch,
    title: "Understand",
    body: "Your words become a brief: category, budget, must-haves, nice-to-haves and what matters most.",
  },
  {
    icon: Radar,
    title: "Retrieve",
    body: "Live Google Shopping listings are pulled in real time, with current prices, sellers and links.",
  },
  {
    icon: Filter,
    title: "Verify",
    body: "Over-budget, off-category and unverified listings are removed. Duplicates collapse into one.",
  },
  {
    icon: Trophy,
    title: "Rank & explain",
    body: "Every candidate earns a transparent score, and the strongest five come with a clear rationale.",
  },
];

const INSIGHT_SECTIONS = [
  { icon: Sparkles, title: "The short answer", body: "A direct reply to what you asked, in a sentence or two." },
  { icon: Compass, title: "Market landscape", body: "What this price segment typically offers right now." },
  { icon: Gauge, title: "Key decision criteria", body: "The specs that genuinely matter for your use." },
  { icon: Scale, title: "Market trade-offs", body: "Where products compromise, so nothing surprises you." },
  { icon: Trophy, title: "Final verdict", body: "A reasoned top pick and runner-up from real listings." },
  { icon: Wallet, title: "Budget verdict", body: "Whether the shortlist truly fits the number you gave." },
];

const SCORE_PARTS = [
  { label: "Fit to your request", points: 30, tone: "bg-jade-400" },
  { label: "Budget & value", points: 25, tone: "bg-sky-aurora" },
  { label: "Verified specs", points: 25, tone: "bg-iris" },
  { label: "Reputation", points: 15, tone: "bg-jade-200" },
  { label: "Listing quality", points: 5, tone: "bg-white/60" },
];

const PRINCIPLES = [
  {
    icon: BadgeCheck,
    title: "Facts come from listings",
    body: "Names, prices, sellers and links are taken from retrieved listings. The model explains — it never invents a spec or a price.",
  },
  {
    icon: ShieldCheck,
    title: "Hard limits stay hard",
    body: "Your budget, category and required features are enforced before ranking. No amount of persuasive text overrides them.",
  },
  {
    icon: ListFilter,
    title: "Clear about its sources",
    body: "When a language model writes the analysis you'll see “Powered by OpenRouter”. When it can't, you'll see “Market Evaluation”.",
  },
];

const Hero = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const search = (query: string) => navigate(`/search?q=${encodeURIComponent(query)}`);

  return (
    <section className="noise relative isolate overflow-hidden bg-night pb-24 pt-36 text-white sm:pb-32 sm:pt-44">
      {/* Aurora field */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="grid-fade absolute inset-0" />
        <div className="animate-float-a absolute -left-[10%] top-[8%] h-[30rem] w-[30rem] rounded-full bg-jade-500/30 blur-[110px]" />
        <div className="animate-float-b absolute right-[-8%] top-[-4%] h-[34rem] w-[34rem] rounded-full bg-iris/25 blur-[120px]" />
        <div className="animate-float-c absolute bottom-[-30%] left-[30%] h-[28rem] w-[40rem] rounded-full bg-sky-aurora/20 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
      </div>

      <div className="container-x relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="rise-in mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-white/70 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-ring absolute inset-0 rounded-full bg-jade-300" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-jade-300" />
            </span>
            Live listings · AI analysis · Prices in ₹
          </p>
          <h1
            className="rise-in mt-7 text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[4.4rem] lg:text-[5.3rem]"
            style={{ ["--rise-index" as string]: 1 }}
          >
            Tell us what you need.
            <br />
            <Accent aurora>We'll find what's worth buying.</Accent>
          </h1>
          <p
            className="rise-in mx-auto mt-6 max-w-2xl text-[15.5px] leading-relaxed text-white/60 sm:text-lg"
            style={{ ["--rise-index" as string]: 2 }}
          >
            ShopMind reads your request, checks live listings, sets aside what doesn't fit and explains its five strongest picks — with real
            prices and no invented specs.
          </p>
        </div>

        <div className="rise-in mx-auto mt-10 max-w-3xl" style={{ ["--rise-index" as string]: 3 }}>
          <SearchCommand variant="hero" animatedPlaceholder autoFocus={params.get("focus") === "search"} onSubmit={search} />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[12px] text-white/40">Try</span>
            {HERO_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => search(chip)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] text-white/70 transition-[background-color,border-color,color] duration-300 hover:border-white/25 hover:bg-white/[0.09] hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="rise-in mx-auto mt-16 grid max-w-3xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur" style={{ ["--rise-index" as string]: 4 }}>
          {[
            ["Top 5", "ranked recommendations"],
            ["100-pt", "transparent match score"],
            ["13", "curated collections"],
          ].map(([value, label]) => (
            <div key={label} className="px-3 py-4 text-center sm:px-6 sm:py-5">
              <p className="tabular text-lg font-semibold tracking-tight sm:text-2xl">{value}</p>
              <p className="mt-0.5 text-[11px] text-white/45 sm:text-[12.5px]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Collections = () => {
  const featured = MAIN_CATEGORIES.slice(0, 9);
  return (
    <section className="container-x py-24 sm:py-32">
      <SectionHeading
        eyebrow="Collections"
        title={
          <>
            Discover <Accent>curated</Accent> collections
          </>
        }
        description="Thirteen collections and more than a hundred focused aisles — each one opens onto live listings, or a ranked shortlist when you want ShopMind's opinion."
        action={
          <Link to="/categories" className={buttonClasses("secondary", "md")}>
            All collections <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mt-12 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((category, index) => (
          <Reveal key={category.slug} index={index} variant="scale" className={cn(index === 0 && "sm:col-span-2 lg:row-span-2")}>
            <CollectionTile category={category} size={index === 0 ? "large" : "default"} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const HowItThinks = () => (
  <section className="border-y border-line bg-surface/60">
    <div className="container-x py-24 sm:py-32">
      <SectionHeading
        align="center"
        eyebrow="Method"
        title={
          <>
            How ShopMind <Accent>thinks</Accent>
          </>
        }
        description="Four deliberate steps sit between your request and your shortlist. None of them is a popularity contest."
      />
      <ol className="relative mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-[2.15rem] hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent lg:block" aria-hidden="true" />
        {STEPS.map((step, index) => (
          <Reveal key={step.title} index={index} className="relative">
            <li className="card group h-full p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center justify-between">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white transition-colors duration-500 group-hover:bg-jade-600">
                  <step.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="font-display text-3xl italic text-line-strong">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

const InsightAnatomy = () => (
  <section className="noise relative overflow-hidden bg-night text-white">
    <div className="pointer-events-none absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-jade-500/15 blur-[120px]" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-iris/15 blur-[120px]" aria-hidden="true" />
    <div className="container-x relative py-24 sm:py-32">
      <SectionHeading
        tone="dark"
        eyebrow="What you get"
        title={
          <>
            Intelligent buying insights, <Accent aurora>not a wall of listings</Accent>
          </>
        }
        description="Every search returns six distinct pieces of analysis, each with its own job — followed by your Top-Tier Recommendations."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {INSIGHT_SECTIONS.map((section, index) => (
          <Reveal key={section.title} index={index} className="group bg-night p-7 transition-colors duration-500 hover:bg-night-2 sm:p-8">
            <section.icon className="h-5 w-5 text-jade-300 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.75} />
            <h3 className="mt-6 text-[17px] font-semibold tracking-tight">{section.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/55">{section.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-[10px] text-white/45">The match score</p>
            <p className="mt-2 text-lg font-medium tracking-tight">Five weighted dimensions, one hundred points, shown on every pick.</p>
          </div>
          <p className="tabular font-mono text-xs text-white/40">= 100 pts</p>
        </div>
        <div className="mt-6 flex h-3 overflow-hidden rounded-full">
          {SCORE_PARTS.map((part) => (
            <span key={part.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", part.tone)} style={{ width: `${part.points}%` }} />
          ))}
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-5">
          {SCORE_PARTS.map((part) => (
            <li key={part.label} className="flex items-center gap-2 text-white/65">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", part.tone)} />
              <span className="min-w-0">
                {part.label} <span className="tabular text-white/40">· {part.points}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
);

const Principles = () => (
  <section className="container-x py-24 sm:py-32">
    <SectionHeading
      eyebrow="Principles"
      title={
        <>
          Built on <Accent>real</Accent> listings
        </>
      }
      description="An assistant is only useful if you can trust it. These rules are enforced in the backend, not just promised here."
    />
    <div className="mt-12 grid gap-4 md:grid-cols-3">
      {PRINCIPLES.map((principle, index) => (
        <Reveal key={principle.title} index={index} className="card p-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jade-50 text-jade-700 ring-1 ring-inset ring-jade-200/70">
            <principle.icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{principle.title}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{principle.body}</p>
        </Reveal>
      ))}
    </div>
  </section>
);

const ConciergePromo = () => {
  const { openAgent } = useAgent();
  return (
    <section className="container-x pb-24 sm:pb-32">
      <Reveal className="card grid items-center gap-10 overflow-hidden p-7 sm:p-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow flex items-center gap-2 text-muted">
            <MessagesSquare className="h-3.5 w-3.5" /> Concierge
          </p>
          <h2 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[2.5rem]">
            Prefer to <Accent>talk it through?</Accent>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            Ask follow-up questions, refine your budget mid-conversation, or get a plain-English explanation of a spec. Product requests return live
            listing cards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={openAgent} className={buttonClasses("primary", "lg")}>
              <Sparkles className="h-4 w-4 text-jade-300" /> Start a conversation
            </button>
            <Link to="/agent" className={buttonClasses("secondary", "lg")}>
              Open full screen <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="relative rounded-[1.6rem] bg-paper p-5 ring-1 ring-inset ring-line sm:p-7" aria-hidden="true">
          <div className="dot-grid absolute inset-0 rounded-[inherit] opacity-50" />
          <div className="relative space-y-4">
            <p className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-ink px-4 py-2.5 text-[14px] text-white">
              Which matters more for night photos — megapixels or OIS?
            </p>
            <div className="flex gap-3">
              <LogoMark className="h-7 w-7" />
              <div className="rounded-[20px] rounded-tl-md bg-surface px-4 py-3 ring-1 ring-line">
                <TypingIndicator />
              </div>
            </div>
            <p className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-ink/90 px-4 py-2.5 text-[14px] text-white/90">
              Show me Sony headphones under ₹5,000
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

const FinalCall = () => {
  const navigate = useNavigate();
  return (
    <section className="container-x pb-24 sm:pb-32">
      <Reveal className="noise relative overflow-hidden rounded-[2rem] bg-night px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-float-a absolute -left-20 -top-20 h-80 w-80 rounded-full bg-jade-500/25 blur-[100px]" />
          <div className="animate-float-b absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-iris/25 blur-[100px]" />
        </div>
        <h2 className="relative mx-auto max-w-2xl text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[3.4rem]">
          Your next purchase, <Accent aurora>already narrowed down.</Accent>
        </h2>
        <p className="relative mx-auto mt-5 max-w-lg text-[15px] text-white/55">Describe it once. ShopMind does the comparing.</p>
        <div className="relative mx-auto mt-10 max-w-2xl text-left">
          <SearchCommand variant="hero" onSubmit={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)} placeholder="What are you shopping for?" />
        </div>
      </Reveal>
    </section>
  );
};

const Home = () => {
  useDocumentTitle(null);
  return (
    <>
      <Hero />
      <Collections />
      <HowItThinks />
      <InsightAnatomy />
      <Principles />
      <ConciergePromo />
      <FinalCall />
    </>
  );
};

export default Home;

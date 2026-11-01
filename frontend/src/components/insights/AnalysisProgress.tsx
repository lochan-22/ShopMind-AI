import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";
import { Skeleton } from "../ui/Skeleton";

/** The stages the backend decision engine runs, in order. */
const STAGES = [
  "Understanding your request",
  "Retrieving live listings",
  "Checking budget and requirements",
  "Ranking the strongest candidates",
  "Writing your buying insights",
];

/**
 * Loading view for the decision engine. The engine does not stream progress,
 * so stages advance on a timer as a guide to what is happening.
 */
export const AnalysisProgress = ({ query }: { query: string }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setStage(0);
    const timers = [2200, 6000, 10500, 15000].map((delay, index) => window.setTimeout(() => setStage(index + 1), delay));
    return () => timers.forEach(window.clearTimeout);
  }, [query]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" role="status" aria-live="polite">
      <div className="noise relative overflow-hidden rounded-[1.5rem] bg-night p-7 text-white sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 animate-float-a rounded-full bg-jade-500/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-4 h-56 w-56 animate-float-b rounded-full bg-iris/25 blur-3xl" aria-hidden="true" />
        <p className="eyebrow relative text-[10px] text-white/50">ShopMind is working</p>
        <p className="relative mt-3 line-clamp-2 text-lg font-medium leading-snug text-white">“{query}”</p>
        <ol className="relative mt-8 space-y-4">
          {STAGES.map((label, index) => {
            const done = index < stage;
            const active = index === stage;
            return (
              <li key={label} className={cn("flex items-center gap-3 text-sm transition-colors duration-500", done ? "text-white/60" : active ? "text-white" : "text-white/30")}>
                <span
                  className={cn(
                    "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
                    done ? "border-jade-400 bg-jade-400 text-night" : active ? "border-jade-300" : "border-white/15",
                  )}
                >
                  {done && <Check className="pop-in h-3.5 w-3.5" strokeWidth={3} />}
                  {active && (
                    <>
                      <span className="pulse-ring absolute inset-0 rounded-full bg-jade-300/40" />
                      <span className="h-2 w-2 rounded-full bg-jade-300" />
                    </>
                  )}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
        <p className="relative mt-8 text-xs text-white/40">Live retrieval usually takes 10–30 seconds.</p>
      </div>
      <div className="card space-y-4 p-6 sm:p-8" aria-hidden="true">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-5 w-full rounded-full" />
        <Skeleton className="h-5 w-11/12 rounded-full" />
        <Skeleton className="h-5 w-2/3 rounded-full" />
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

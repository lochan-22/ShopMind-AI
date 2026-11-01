import type { ReactNode } from "react";
import { Compass, Gauge, Info, Scale, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import type { AIAnalysis, ShoppingDecision } from "../../services/productService";
import { Reveal } from "../ui/Reveal";
import { cn } from "../../utils/cn";

/** True when two analysis paragraphs say essentially the same thing. */
export const isNearDuplicate = (a?: string | null, b?: string | null): boolean => {
  if (!a || !b) return false;
  const normA = a.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  const normB = b.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  if (normA === normB) return true;
  if (normA.length > 20 && normB.includes(normA.slice(0, 30))) return true;
  if (normB.length > 20 && normA.includes(normB.slice(0, 30))) return true;
  const wordsA = new Set(normA.split(" ").filter((word) => word.length > 3));
  const wordsB = new Set(normB.split(" ").filter((word) => word.length > 3));
  if (!wordsA.size || !wordsB.size) return false;
  let common = 0;
  for (const word of wordsA) if (wordsB.has(word)) common += 1;
  return common / Math.min(wordsA.size, wordsB.size) > 0.6;
};

/**
 * Honest source label: "OpenRouter" only when the backend confirms the model
 * actually produced the analysis.
 */
export const SourceIndicator = ({ analysis, tone = "light" }: { analysis: AIAnalysis; tone?: "light" | "dark" }) => {
  const isModel = analysis.analysis_source === "openrouter";
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-medium",
        tone === "dark" ? "bg-white/[0.08] text-white/80 ring-1 ring-inset ring-white/10" : "bg-surface text-ink-2 ring-1 ring-inset ring-line",
      )}
      title={
        isModel
          ? "This analysis was written by a language model via OpenRouter, using the retrieved listings."
          : "The AI model was unavailable, so ShopMind's rule-based evaluation of the live listings produced this analysis."
      }
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isModel ? "bg-jade-400" : "bg-gold")} />
      <span className="truncate">{isModel ? `Powered by OpenRouter${analysis.model ? ` · ${analysis.model}` : ""}` : "Market Evaluation"}</span>
    </span>
  );
};

const Panel = ({
  icon,
  label,
  children,
  className,
  index,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
  index: number;
}) => (
  <Reveal index={index} className={cn("card flex flex-col p-6 sm:p-7", className)}>
    <p className="eyebrow flex items-center gap-2 text-[10px] text-muted">
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sunken text-ink-2">{icon}</span>
      {label}
    </p>
    <div className="mt-4 flex-1">{children}</div>
  </Reveal>
);

export const InsightsPanel = ({ decision }: { decision: ShoppingDecision }) => {
  const analysis = decision.ai_analysis;
  const budget = decision.intent?.budget_max ?? decision.intent?.budget;
  const showSummary = analysis.summary?.trim() && !isNearDuplicate(analysis.summary, analysis.direct_answer);
  const lead = analysis.direct_answer?.trim() || (showSummary ? analysis.summary : "");
  const landscape = analysis.direct_answer?.trim() && showSummary ? analysis.summary : "";
  const verdict = analysis.final_recommendation?.trim() || analysis.top_pick_reason?.trim();
  const notes = [analysis.missing_information, analysis.limitations !== analysis.missing_information ? analysis.limitations : null].filter(
    (note): note is string => Boolean(note && note.trim()),
  );
  const diagnostics = decision.diagnostics;
  let index = 0;

  return (
    <section aria-labelledby="insights-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2 text-muted">
            <span className="h-px w-6 bg-line-strong" />
            Analysis
          </p>
          <h2 id="insights-heading" className="mt-3 text-[1.9rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2.3rem]">
            Intelligent Buying Insights
          </h2>
        </div>
        <SourceIndicator analysis={analysis} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {lead && (
          <Reveal index={index++} className="noise relative overflow-hidden rounded-[1.25rem] bg-night p-7 text-white sm:p-9 lg:col-span-2">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-jade-500/25 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-iris/20 blur-3xl" aria-hidden="true" />
            <p className="eyebrow relative flex items-center gap-2 text-[10px] text-white/50">
              <Sparkles className="h-3.5 w-3.5 text-jade-300" /> The short answer
            </p>
            <p className="relative mt-5 text-[1.2rem] font-normal leading-[1.55] tracking-[-0.01em] text-white/90 sm:text-[1.4rem]">{lead}</p>
          </Reveal>
        )}

        {verdict && (
          <Panel index={index++} icon={<Trophy className="h-3.5 w-3.5" />} label="Final verdict" className={cn(!lead && "lg:col-span-3")}>
            <p className="text-[15px] leading-relaxed text-ink-2">{verdict}</p>
          </Panel>
        )}

        {analysis.key_criteria?.length > 0 && (
          <Panel index={index++} icon={<Gauge className="h-3.5 w-3.5" />} label="Key decision criteria" className="lg:col-span-2">
            <ol className="grid gap-3 sm:grid-cols-2">
              {analysis.key_criteria.map((criterion, criterionIndex) => (
                <li key={criterion} className="flex gap-3 rounded-2xl bg-paper/80 p-4 ring-1 ring-inset ring-line/70">
                  <span className="font-display text-xl italic leading-none text-jade-600">{criterionIndex + 1}</span>
                  <span className="text-[13.5px] leading-relaxed text-ink-2">{criterion}</span>
                </li>
              ))}
            </ol>
          </Panel>
        )}

        {analysis.budget_verdict?.trim() && (
          <Panel index={index++} icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Budget verdict">
            {budget != null && (
              <p className="tabular mb-3 text-2xl font-semibold tracking-tight text-ink">
                Under ₹{budget.toLocaleString("en-IN")}
              </p>
            )}
            <p className="text-[14px] leading-relaxed text-ink-2">{analysis.budget_verdict}</p>
          </Panel>
        )}

        {landscape && (
          <Panel index={index++} icon={<Compass className="h-3.5 w-3.5" />} label="Market landscape" className={cn(!analysis.trade_offs && "lg:col-span-3")}>
            <p className="text-[14px] leading-relaxed text-ink-2">{landscape}</p>
          </Panel>
        )}

        {analysis.trade_offs?.trim() && (
          <Panel index={index++} icon={<Scale className="h-3.5 w-3.5" />} label="Market trade-offs" className={cn(landscape ? "lg:col-span-2" : "lg:col-span-3")}>
            <p className="text-[14px] leading-relaxed text-ink-2">{analysis.trade_offs}</p>
          </Panel>
        )}
      </div>

      {(notes.length > 0 || diagnostics) && (
        <Reveal index={index++} className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-line-strong bg-surface/50 px-5 py-4 text-[13px] text-muted lg:flex-row lg:items-center lg:justify-between">
          {notes.length > 0 && (
            <div className="flex gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
              <div className="space-y-1">
                {notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
          )}
          {diagnostics && (
            <dl className="tabular flex shrink-0 gap-5 font-mono text-[11px] uppercase tracking-wider">
              <div>
                <dt className="text-faint">Retrieved</dt>
                <dd className="text-ink">{diagnostics.total_retrieved}</dd>
              </div>
              <div>
                <dt className="text-faint">Qualified</dt>
                <dd className="text-jade-700">{diagnostics.qualifying_count}</dd>
              </div>
              <div>
                <dt className="text-faint">Excluded</dt>
                <dd className="text-ink">{diagnostics.disqualified_count}</dd>
              </div>
            </dl>
          )}
        </Reveal>
      )}
    </section>
  );
};

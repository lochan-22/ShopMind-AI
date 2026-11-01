import type { ReactNode } from "react";

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}

export const LegalPage = ({ eyebrow, title, updated, intro, children }: LegalPageProps) => (
  <div className="container-x pb-24 pt-32 sm:pt-40">
    <div className="mx-auto max-w-2xl">
      <div className="rise-in">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h1 className="mt-4 text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[3.2rem]">{title}</h1>
        <p className="mt-3 text-sm text-faint">Last updated {updated}</p>
        <p className="mt-8 text-[16px] leading-relaxed text-ink-2">{intro}</p>
      </div>
      <div className="prose-legal rise-in mt-6 border-t border-line pt-2" style={{ ["--rise-index" as string]: 1 }}>
        {children}
      </div>
    </div>
  </div>
);

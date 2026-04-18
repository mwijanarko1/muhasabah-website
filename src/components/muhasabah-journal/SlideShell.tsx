import type { ReactNode } from "react";

export function SlideShell({
  step,
  title,
  subtitle,
  hint,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <article className="pb-6 pt-2">
      <p className="font-mono-brand text-[10px] font-bold uppercase tracking-widest text-brand-accent dark:text-brand-periwinkle">
        Step {step} of 7
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-ink dark:text-brand-white">{title}</h2>
        {subtitle && (
          <span className="font-display text-lg font-medium text-brand-accent/60 dark:text-brand-periwinkle/50">
            {subtitle}
          </span>
        )}
      </div>
      <p className="font-body mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{hint}</p>
      <div className="mt-8 space-y-6">{children}</div>
    </article>
  );
}

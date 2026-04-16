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
      <p className="text-xs font-semibold uppercase tracking-wider text-[#8A4FFF] dark:text-[#C3BEF7]">
        Step {step} of 7
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && (
          <span className="text-lg font-medium text-[#8A4FFF]/70 dark:text-[#C3BEF7]/60">
            {subtitle}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{hint}</p>
      <div className="mt-6 space-y-4">{children}</div>
    </article>
  );
}

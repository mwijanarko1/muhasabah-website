import type { ReactNode } from "react";

const triadCaptionCell =
  "min-w-0 max-w-full break-words text-balance text-[10px] font-mono-brand font-bold uppercase leading-snug tracking-wider sm:text-[11px] sm:leading-tight sm:tracking-widest";

/** Three equal columns for left / center / right labels above a slider (aligns with track thirds). */
export function SliderTriadCaptions({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="mb-3 grid grid-cols-3 items-start gap-x-1 sm:gap-x-2">
      <span className={`${triadCaptionCell} text-left`}>{left}</span>
      <span className={`${triadCaptionCell} text-center`}>{center}</span>
      <span className={`${triadCaptionCell} text-right`}>{right}</span>
    </div>
  );
}

/** Numeric endpoints under a slider; same grid as {@link SliderTriadCaptions} for vertical alignment. */
export function SliderTriadTicks({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 items-baseline gap-x-1 font-mono-brand text-[10px] font-bold tabular-nums text-gray-400 sm:gap-x-2 sm:text-[11px] dark:text-gray-500">
      <span className="text-left">{left}</span>
      <span className="text-center text-gray-400/80 dark:text-gray-500/80">{center}</span>
      <span className="text-right">{right}</span>
    </div>
  );
}

/** Step 2 (Dhikr) rating shell — reused for journal steps 2–7 */
export function DoubleBezelRatingCard({ children }: { children: ReactNode }) {
  return (
    <div className="group relative">
      <div className="rounded-[2.5rem] bg-gradient-to-br from-brand-alice/60 to-brand-periwinkle/30 p-1.5 dark:from-[#1a1423]/40 dark:to-brand-periwinkle/10">
        <div className="relative overflow-hidden rounded-[calc(2.5rem-0.375rem)] bg-brand-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_32px_-12px_rgba(138,79,255,0.12)] dark:bg-[#1a1423]">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-accent/5 blur-3xl transition-opacity duration-700 group-hover:opacity-100 dark:bg-brand-accent/10"
            aria-hidden
          />
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function RatingCardHeader({
  eyebrow,
  description,
  trailing,
}: {
  eyebrow: string;
  description: string;
  trailing: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-3">
        <span className="inline-flex items-center rounded-full bg-brand-mint px-3 py-1 font-mono-brand text-[10px] font-bold uppercase tracking-widest text-brand-accent dark:bg-brand-accent/20 dark:text-brand-periwinkle">
          {eyebrow}
        </span>
        <p className="font-body text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      <div className="shrink-0">{trailing}</div>
    </div>
  );
}

export function RatingScoreNumeric({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex min-w-[3.5rem] shrink-0 flex-col items-end pt-0.5">
      <span className="inline-block w-full min-w-[2ch] font-mono-brand text-right text-4xl font-bold tabular-nums text-brand-accent transition-all duration-300">
        {value}
      </span>
      <span className="w-full font-mono-brand text-right text-[10px] font-bold tabular-nums text-gray-400 dark:text-gray-500">
        / {max}
      </span>
    </div>
  );
}

export function TenPointSliderTrack({
  value,
  onChange,
  ariaLabel,
  leftLabel = "Not yet",
  rightLabel = "Fully present",
}: {
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const pct = (value / 10) * 100;
  return (
    <>
      <div className="relative mb-6">
        <div className="relative h-2.5 w-full rounded-full bg-brand-alice dark:bg-gray-800">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-brand-accent transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={value}
            onChange={(e) => onChange(e.target.valueAsNumber)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={ariaLabel}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  i <= value ? "scale-100 bg-white/60" : "scale-50 bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute top-1/2 -mt-3.5 h-7 w-7 -translate-x-1/2 rounded-full border-4 border-brand-white bg-brand-accent shadow-lg shadow-brand-accent/30 transition-all duration-300 ease-out dark:border-gray-800"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between font-mono-brand text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </>
  );
}

export function TwentyPointSliderTrack({
  value,
  onChange,
  ariaLabel,
  leftLabel = "Struggled",
  rightLabel = "Excellent",
}: {
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const pct = (value / 20) * 100;
  return (
    <>
      <div className="relative mb-6">
        <div className="relative h-2.5 w-full rounded-full bg-brand-alice dark:bg-gray-800">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-brand-accent transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={value}
            onChange={(e) => onChange(e.target.valueAsNumber)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={ariaLabel}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-1 rounded-full transition-all duration-300 ${
                  i <= value ? "scale-100 bg-white/60" : "scale-50 bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute top-1/2 -mt-3.5 h-7 w-7 -translate-x-1/2 rounded-full border-4 border-brand-white bg-brand-accent shadow-lg shadow-brand-accent/30 transition-all duration-300 ease-out dark:border-gray-800"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between font-mono-brand text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </>
  );
}

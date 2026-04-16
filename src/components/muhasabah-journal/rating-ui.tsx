import type { ReactNode } from "react";

const triadCaptionCell =
  "min-w-0 max-w-full break-words text-balance text-[10px] font-medium uppercase leading-snug tracking-wide sm:text-[11px] sm:leading-tight sm:tracking-wider";

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
    <div className="grid grid-cols-3 items-baseline gap-x-1 text-[10px] font-medium tabular-nums text-gray-400 sm:gap-x-2 sm:text-[11px] dark:text-gray-500">
      <span className="text-left">{left}</span>
      <span className="text-center text-gray-500 dark:text-gray-400">{center}</span>
      <span className="text-right">{right}</span>
    </div>
  );
}

/** Step 2 (Dhikr) rating shell — reused for journal steps 2–7 */
export function DoubleBezelRatingCard({ children }: { children: ReactNode }) {
  return (
    <div className="group relative">
      <div className="rounded-[2rem] bg-gradient-to-br from-[#E5ECF4]/60 to-[#C3BEF7]/30 p-1.5 dark:from-[#1a1a2e]/40 dark:to-[#C3BEF7]/10">
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_24px_-8px_rgba(138,79,255,0.15)] dark:bg-[#231d2e] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_24px_-8px_rgba(0,0,0,0.4)]">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8A4FFF]/10 blur-3xl transition-opacity duration-700 group-hover:opacity-70 dark:bg-[#8A4FFF]/20"
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
      <div className="min-w-0 flex-1 space-y-2">
        <span className="inline-flex items-center rounded-full bg-[#EFFFFA]/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#8A4FFF] dark:bg-[#8A4FFF]/20 dark:text-[#C3BEF7]">
          {eyebrow}
        </span>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      <div className="shrink-0">{trailing}</div>
    </div>
  );
}

export function RatingScoreNumeric({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex min-w-[3.5rem] shrink-0 flex-col items-end pt-0.5">
      <span className="inline-block w-full min-w-[2ch] text-right text-4xl font-semibold tabular-nums text-[#8A4FFF] transition-all duration-300">
        {value}
      </span>
      <span className="w-full text-right text-xs font-medium tabular-nums text-gray-400 dark:text-gray-500">
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
      <div className="relative mb-4">
        <div className="relative h-3 w-full rounded-full bg-gray-100 dark:bg-gray-700/50">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#C3BEF7] to-[#8A4FFF] transition-all duration-150 ease-out"
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
                className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                  i <= value ? "scale-100 bg-white/80" : "scale-75 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute top-1/2 -mt-3 h-6 w-6 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(138,79,255,0.4)] ring-2 ring-[#8A4FFF] transition-all duration-150 ease-out dark:bg-[#8A4FFF] dark:shadow-[0_2px_8px_rgba(138,79,255,0.5)] dark:ring-[#C3BEF7]"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
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
      <div className="relative mb-4">
        <div className="relative h-3 w-full rounded-full bg-gray-100 dark:bg-gray-700/50">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#C3BEF7] to-[#8A4FFF] transition-all duration-150 ease-out"
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
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                  i <= value ? "scale-100 bg-white/80" : "scale-75 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute top-1/2 -mt-3 h-6 w-6 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(138,79,255,0.4)] ring-2 ring-[#8A4FFF] transition-all duration-150 ease-out dark:bg-[#8A4FFF] dark:shadow-[0_2px_8px_rgba(138,79,255,0.5)] dark:ring-[#C3BEF7]"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </>
  );
}

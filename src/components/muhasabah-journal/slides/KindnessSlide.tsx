import { useCallback, type Dispatch, type SetStateAction } from "react";
import { JournalNotes } from "../JournalNotes";
import {
  DoubleBezelRatingCard,
  RatingCardHeader,
  SliderTriadCaptions,
  SliderTriadTicks,
} from "../rating-ui";
import { SlideShell } from "../SlideShell";
import type { EntryState } from "../types";
import { useDeferredRangeCommit } from "../useDeferredRangeCommit";

type Props = {
  form: EntryState;
  setForm: Dispatch<SetStateAction<EntryState>>;
};

export function KindnessSlide({ form, setForm }: Props) {
  const commitKindness = useCallback(
    (n: number) =>
      setForm((prev) => (prev.kindness === n ? prev : { ...prev, kindness: n })),
    [setForm],
  );

  const { value: k, handlers: rangeHandlers } = useDeferredRangeCommit(
    form.kindness,
    commitKindness,
  );
  const scoreBg =
    k < 7
      ? "bg-rose-50 dark:bg-rose-950/30"
      : k < 14
        ? "bg-gray-50 dark:bg-gray-800/50"
        : "bg-emerald-50 dark:bg-emerald-950/30";
  const scoreText =
    k < 7
      ? "text-rose-500 dark:text-rose-400"
      : k < 14
        ? "text-gray-500 dark:text-gray-400"
        : "text-emerald-600 dark:text-emerald-400";

  return (
    <SlideShell
      step={4}
      title="Kindness & character"
      hint="Reflect on patience, forgiveness, charity, and good character"
    >
      <DoubleBezelRatingCard>
        <RatingCardHeader
          eyebrow="Character & conduct"
          description="How you treated others today (patience, forgiveness, charity, good character)."
          trailing={
            <div
              className={`flex min-w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-2xl px-4 py-3 shadow-sm transition-all duration-300 ${scoreBg}`}
            >
              <span
                className={`inline-block min-w-[2ch] font-mono-brand text-center text-3xl font-bold tabular-nums transition-colors duration-300 ${scoreText}`}
              >
                {k}
              </span>
              <span className="inline-block min-w-[2ch] font-mono-brand text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                / 20
              </span>
            </div>
          }
        />

        <SliderTriadCaptions
          left={<span className="text-rose-400 dark:text-rose-500">Struggled</span>}
          center={<span className="text-gray-400 dark:text-gray-500">Growing</span>}
          right={<span className="text-emerald-500 dark:text-emerald-400">Excellent</span>}
        />

        <div className="relative mb-4">
          <div className="absolute top-1/2 h-3 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-200 via-[#E5ECF4] to-emerald-200 dark:from-rose-900/40 dark:via-gray-700 dark:to-emerald-900/40" />

          <div
            className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-400 to-emerald-500"
            style={{ width: `${(k / 20) * 100}%` }}
          />

          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={k}
            className="relative z-10 h-12 w-full cursor-pointer appearance-none bg-transparent focus:outline-none"
            aria-label="Kindness score"
            {...rangeHandlers}
          />

          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: var(--color-brand-accent);
              cursor: pointer;
              box-shadow: 0 4px 14px rgba(138, 79, 255, 0.4);
              border: 3px solid white;
              transition:
                transform 0.15s ease,
                box-shadow 0.15s ease;
            }
            input[type="range"]::-webkit-slider-thumb:hover {
              transform: scale(1.1);
              box-shadow: 0 6px 20px rgba(138, 79, 255, 0.5);
            }
            input[type="range"]::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: var(--color-brand-accent);
              cursor: pointer;
              box-shadow: 0 4px 14px rgba(138, 79, 255, 0.4);
              border: 3px solid white;
              transition: transform 0.15s ease;
            }
          `}</style>
        </div>

        <SliderTriadTicks left="0" center="10" right="20" />
      </DoubleBezelRatingCard>

      <JournalNotes
        value={form.notes.kindness ?? ""}
        onChange={(v) =>
          setForm((prev) => ({
            ...prev,
            notes: { ...prev.notes, kindness: v },
          }))
        }
        placeholder="What acts of kindness did you show today? How did you handle difficult moments with others?"
        rows={4}
      />
    </SlideShell>
  );
}

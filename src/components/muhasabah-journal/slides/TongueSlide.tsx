import type { Dispatch, SetStateAction } from "react";
import { JournalNotes } from "../JournalNotes";
import { DoubleBezelRatingCard, RatingCardHeader } from "../rating-ui";
import { SlideShell } from "../SlideShell";
import type { EntryState } from "../types";

type Props = {
  form: EntryState;
  setForm: Dispatch<SetStateAction<EntryState>>;
};

export function TongueSlide({ form, setForm }: Props) {
  return (
    <SlideShell
      step={6}
      title="Tongue & distractions"
      hint="Reflect on speech, silence, and presence of mind"
    >
      <DoubleBezelRatingCard>
        <RatingCardHeader
          eyebrow="Speech & restraint"
          description="Gossip, argument, idle talk vs. purposeful, kind, or silent speech."
          trailing={
            <div
              className={`flex shrink-0 flex-col items-center rounded-2xl px-4 py-3 transition-all duration-300 ${
                form.tongueDistractions < 0
                  ? "bg-rose-50 dark:bg-rose-950/30"
                  : form.tongueDistractions > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              <span
                className={`text-3xl font-bold transition-colors duration-300 ${
                  form.tongueDistractions < 0
                    ? "text-rose-500 dark:text-rose-400"
                    : form.tongueDistractions > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {form.tongueDistractions > 0 ? "+" : ""}
                {form.tongueDistractions}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                / ±20
              </span>
            </div>
          }
        />

        <div className="mb-3 flex justify-between text-[11px] font-medium uppercase tracking-wider">
          <span className="text-rose-400 dark:text-rose-500">Regrettable speech</span>
          <span className="text-gray-400 dark:text-gray-500">Neutral</span>
          <span className="text-emerald-500 dark:text-emerald-400">Mindful restraint</span>
        </div>

        <div className="relative mb-4">
          <div className="absolute top-1/2 h-3 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-200 via-[#E5ECF4] to-emerald-200 dark:from-rose-900/40 dark:via-gray-700 dark:to-emerald-900/40" />

          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400 dark:bg-gray-500" />

          <div
            className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full transition-all duration-150 ${
              form.tongueDistractions < 0
                ? "right-1/2 bg-gradient-to-l from-rose-400 to-rose-500"
                : form.tongueDistractions > 0
                  ? "left-1/2 bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "hidden"
            }`}
            style={{
              width:
                form.tongueDistractions !== 0
                  ? `${(Math.abs(form.tongueDistractions) / 20) * 50}%`
                  : "0%",
            }}
          />

          <input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={form.tongueDistractions}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, tongueDistractions: e.target.valueAsNumber }))
            }
            className="relative z-10 h-12 w-full cursor-pointer appearance-none bg-transparent focus:outline-none"
          />

          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #8a4fff 0%, #c3bef7 100%);
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
              background: linear-gradient(135deg, #8a4fff 0%, #c3bef7 100%);
              cursor: pointer;
              box-shadow: 0 4px 14px rgba(138, 79, 255, 0.4);
              border: 3px solid white;
              transition: transform 0.15s ease;
            }
          `}</style>
        </div>

        <div className="flex justify-between text-[10px] font-medium text-gray-400 dark:text-gray-500">
          <span>-20</span>
          <span className="text-gray-500 dark:text-gray-400">0</span>
          <span>+20</span>
        </div>
      </DoubleBezelRatingCard>

      <JournalNotes
        value={form.notes.tongue ?? ""}
        onChange={(v) =>
          setForm((prev) => ({
            ...prev,
            notes: { ...prev.notes, tongue: v },
          }))
        }
        placeholder="What slipped from your tongue today? What did you hold back? Any moments of silence that served you well?"
        rows={4}
      />
    </SlideShell>
  );
}

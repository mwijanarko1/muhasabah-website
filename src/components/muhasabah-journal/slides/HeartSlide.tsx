import type { Dispatch, SetStateAction } from "react";
import { JournalNotes } from "../JournalNotes";
import {
  DoubleBezelRatingCard,
  RatingCardHeader,
  RatingScoreNumeric,
  TwentyPointSliderTrack,
} from "../rating-ui";
import { SlideShell } from "../SlideShell";
import type { EntryState } from "../types";

type Props = {
  form: EntryState;
  setForm: Dispatch<SetStateAction<EntryState>>;
};

export function HeartSlide({ form, setForm }: Props) {
  return (
    <SlideShell step={7} title="Heart & intention" hint="0–20 points">
      <DoubleBezelRatingCard>
        <RatingCardHeader
          eyebrow="Sincerity & heart"
          description="How present was your heart in worship today? Rate sincerity and spiritual connection."
          trailing={<RatingScoreNumeric value={form.heart} max={20} />}
        />
        <TwentyPointSliderTrack
          value={form.heart}
          onChange={(n) => setForm((prev) => ({ ...prev, heart: n }))}
          ariaLabel="Heart score"
          leftLabel="Distracted"
          rightLabel="Present"
        />
      </DoubleBezelRatingCard>

      <JournalNotes
        id="heart-notes"
        value={form.notes.heart ?? ""}
        onChange={(v) =>
          setForm((prev) => ({
            ...prev,
            notes: { ...prev.notes, heart: v },
          }))
        }
        placeholder="What softened your heart today? What distracted it?"
        rows={4}
      />

      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#C3BEF7]/50 bg-[#EFFFFA]/50 p-3 dark:border-[#8A4FFF]/20 dark:bg-[#8A4FFF]/5">
        <svg className="h-4 w-4 text-[#8A4FFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Almost complete — tap Continue to finish your muhasabah
        </span>
      </div>
    </SlideShell>
  );
}

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

export function KindnessSlide({ form, setForm }: Props) {
  return (
    <SlideShell step={4} title="Kindness & character" hint="0–20 points">
      <DoubleBezelRatingCard>
        <RatingCardHeader
          eyebrow="Character & conduct"
          description="How you treated others today (patience, forgiveness, charity, good character)."
          trailing={<RatingScoreNumeric value={form.kindness} max={20} />}
        />
        <TwentyPointSliderTrack
          value={form.kindness}
          onChange={(n) => setForm((prev) => ({ ...prev, kindness: n }))}
          ariaLabel="Kindness score"
          leftLabel="Struggled"
          rightLabel="Excellent"
        />
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

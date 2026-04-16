import type { Dispatch, SetStateAction } from "react";
import { JournalNotes } from "../JournalNotes";
import {
  DoubleBezelRatingCard,
  RatingCardHeader,
  RatingScoreNumeric,
  TenPointSliderTrack,
} from "../rating-ui";
import { SlideShell } from "../SlideShell";
import type { EntryState } from "../types";

type Props = {
  form: EntryState;
  setForm: Dispatch<SetStateAction<EntryState>>;
};

export function LearningSlide({ form, setForm }: Props) {
  return (
    <SlideShell step={5} title="Learning & growth" hint="Reflect on your pursuit of knowledge today">
      <DoubleBezelRatingCard>
        <RatingCardHeader
          eyebrow="Beneficial knowledge"
          description="Knowledge & self-improvement (Quran, skills, or lessons that drew you nearer to Allah)."
          trailing={<RatingScoreNumeric value={form.learning} max={10} />}
        />
        <TenPointSliderTrack
          value={form.learning}
          onChange={(n) => setForm((prev) => ({ ...prev, learning: n }))}
          ariaLabel="Learning score"
        />
      </DoubleBezelRatingCard>

      <JournalNotes
        value={form.notes.learning ?? ""}
        onChange={(v) =>
          setForm((prev) => ({
            ...prev,
            notes: { ...prev.notes, learning: v },
          }))
        }
        placeholder="What did you learn today? A verse, a hadith, a skill, or a life lesson..."
        rows={4}
      />
    </SlideShell>
  );
}

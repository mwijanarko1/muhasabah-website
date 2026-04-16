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

export function DhikrSlide({ form, setForm }: Props) {
  return (
    <SlideShell step={2} title="Dhikr & Quran" hint="0–10 points">
      <DoubleBezelRatingCard>
        <RatingCardHeader
          eyebrow="Remembrance & Recitation"
          description="Reflect on your engagement with dhikr and Quran today"
          trailing={<RatingScoreNumeric value={form.dhikrQuran} max={10} />}
        />
        <TenPointSliderTrack
          value={form.dhikrQuran}
          onChange={(n) => setForm((prev) => ({ ...prev, dhikrQuran: n }))}
          ariaLabel="Dhikr and Quran score"
        />
      </DoubleBezelRatingCard>

      <JournalNotes
        id="dhikr-quran-notes"
        value={form.notes.dhikrQuran ?? ""}
        onChange={(v) =>
          setForm((prev) => ({
            ...prev,
            notes: { ...prev.notes, dhikrQuran: v },
          }))
        }
        placeholder="What surahs did you read? How did the dhikr feel today?"
        rows={3}
      />
    </SlideShell>
  );
}

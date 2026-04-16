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

export function IbadatSlide({ form, setForm }: Props) {
  return (
    <SlideShell step={3} title="Other worship (Ibadat)" hint="0–10 points">
      <DoubleBezelRatingCard>
        <RatingCardHeader
          eyebrow="Voluntary worship"
          description="Tahajjud, charity, remembrance (score extra acts beyond fard)."
          trailing={<RatingScoreNumeric value={form.ibadat} max={10} />}
        />
        <TenPointSliderTrack
          value={form.ibadat}
          onChange={(n) => setForm((prev) => ({ ...prev, ibadat: n }))}
          ariaLabel="Ibadat score"
        />
      </DoubleBezelRatingCard>

      <JournalNotes
        value={form.notes.ibadat ?? ""}
        onChange={(v) =>
          setForm((prev) => ({
            ...prev,
            notes: { ...prev.notes, ibadat: v },
          }))
        }
        placeholder="What voluntary acts did you perform today? Any sunnah prayers, fasting, charity, or extra dhikr?"
        rows={4}
      />
    </SlideShell>
  );
}

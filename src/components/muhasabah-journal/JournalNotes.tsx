import { useId } from "react";

export function JournalNotes({
  id: idProp,
  value,
  onChange,
  placeholder = "A line or two…",
  rows = 3,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const genId = useId();
  const id = idProp ?? `reflection-notes-${genId}`;
  const len = (value ?? "").length;

  return (
    <div className="relative">
      <div className="rounded-[1.5rem] bg-brand-alice/50 p-1 dark:bg-gray-800/30">
        <div className="relative rounded-[calc(1.5rem-0.25rem)] bg-brand-white p-5 dark:bg-[#1a1423]">
          <label htmlFor={id} className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <svg
              className="h-4 w-4 shrink-0 text-brand-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            <span
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Reflection notes
            </span>
            <span
              className="text-xs text-gray-400 dark:text-gray-500"
              style={{ fontFamily: "var(--font-body)" }}
            >
              (optional)
            </span>
          </label>
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={500}
            className="w-full resize-none rounded-xl border-0 bg-brand-alice/30 p-4 text-[15px] leading-relaxed text-brand-ink placeholder:text-gray-400 focus:bg-brand-white focus:outline-none focus:ring-4 focus:ring-brand-accent/20 dark:bg-gray-950/50 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-gray-950/80"
            style={{ fontFamily: "var(--font-body)" }}
          />
          <div className="mt-2 flex justify-end">
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {len}/500
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

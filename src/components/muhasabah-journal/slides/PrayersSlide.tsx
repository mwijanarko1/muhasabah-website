import type { PrayerNotYetTime } from "../../../../convex/helpers";
import { PRAYER_ICONS } from "../constants";
import { SlideShell } from "../SlideShell";
import type { PrayerScores } from "../types";

type Props = {
  prayers: PrayerScores;
  prayerNotYetTime: PrayerNotYetTime;
  updatePrayer: (name: keyof PrayerScores, value: number) => void;
  togglePrayerNotYet: (name: keyof PrayerScores) => void;
};

export function PrayersSlide({
  prayers,
  prayerNotYetTime,
  updatePrayer,
  togglePrayerNotYet,
}: Props) {
  return (
    <SlideShell
      step={1}
      title="Prayers"
      subtitle="Salah"
      hint='Score only prayers that have started (0–2 each). Use "Not time yet" if that salah has not entered.'
    >
      <div className="space-y-4">
        {(
          [
            { key: "fajr", label: "Fajr" },
            { key: "dhuhr", label: "Dhuhr" },
            { key: "asr", label: "Asr" },
            { key: "maghrib", label: "Maghrib" },
            { key: "isha", label: "Isha" },
          ] as const
        ).map(({ key, label }, index) => {
          const notYet = prayerNotYetTime[key];
          const score = prayers[key];
          const PrayerIcon = PRAYER_ICONS[key];

          return (
            <div
              key={key}
              style={{ animationDelay: `${index * 80}ms` }}
              className={`
                        prayer-card-appear
                        group relative overflow-hidden rounded-3xl
                        border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                        ${notYet
                  ? "border-[#C3BEF7]/40 bg-[#E5ECF4]/50 dark:border-[#C3BEF7]/20 dark:bg-[#1a1a2e]/50"
                  : "border-[#8A4FFF]/20 bg-white dark:border-[#8A4FFF]/30 dark:bg-[#1a1a2e]/80"
                }
                        ${notYet ? "shadow-none" : "shadow-[0_4px_20px_-8px_rgba(138,79,255,0.15)] dark:shadow-[0_4px_20px_-8px_rgba(138,79,255,0.1)]"}
                      `}
            >
              <div
                className={`
                          absolute inset-0 opacity-0 transition-opacity duration-500
                          ${!notYet ? "group-hover:opacity-100" : ""}
                          bg-gradient-to-br from-[#8A4FFF]/5 via-transparent to-[#C3BEF7]/5
                          dark:from-[#8A4FFF]/10 dark:to-[#C3BEF7]/5
                        `}
              />

              <div className="relative p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                              flex h-10 w-10 items-center justify-center rounded-2xl
                              transition-all duration-300
                              ${notYet
                          ? "bg-[#E5ECF4] text-[#8A4FFF]/50 dark:bg-[#2a2a3e] dark:text-[#8A4FFF]/40"
                          : score === 2
                            ? "bg-[#8A4FFF] text-white shadow-lg shadow-[#8A4FFF]/25"
                            : score === 1
                              ? "bg-[#C3BEF7] text-[#5a3d99] dark:bg-[#C3BEF7]/70 dark:text-[#3d2666]"
                              : "bg-[#E5ECF4] text-[#8A4FFF] dark:bg-[#2a2a3e] dark:text-[#8A4FFF]"
                        }
                            `}
                    >
                      <PrayerIcon
                        className="h-[22px] w-[22px] shrink-0"
                        weight={notYet ? "duotone" : score === 2 ? "fill" : "duotone"}
                        aria-hidden
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold leading-tight text-gray-900 dark:text-white"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {label}
                    </h3>
                  </div>

                  <div
                    className={`
                              text-sm font-medium tabular-nums
                              transition-colors duration-300
                              ${notYet
                        ? "text-[#8A4FFF]/30 dark:text-[#8A4FFF]/20"
                        : "text-[#8A4FFF] dark:text-[#C3BEF7]"
                      }
                            `}
                    style={{ fontFamily: "var(--font-mono-brand)" }}
                  >
                    {notYet ? "—/2" : `${score}/2`}
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { value: 0, label: "Missed", icon: "○" },
                    { value: 1, label: "Late", icon: "◐" },
                    { value: 2, label: "On time", icon: "●" },
                  ].map((opt) => {
                    const isSelected = !notYet && score === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updatePrayer(key, opt.value)}
                        disabled={notYet}
                        className={`
                                  relative overflow-hidden rounded-2xl py-3.5 px-2
                                  text-sm font-medium
                                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                                  disabled:cursor-not-allowed disabled:opacity-30
                                  active:scale-[0.96]
                                  ${isSelected
                            ? "bg-[#8A4FFF] text-white shadow-lg shadow-[#8A4FFF]/30"
                            : "bg-[#E5ECF4]/60 text-gray-700 hover:bg-[#E5ECF4] dark:bg-[#2a2a3e]/60 dark:text-gray-300 dark:hover:bg-[#2a2a3e]"
                          }
                                `}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span className="relative z-10 flex flex-col items-center gap-1">
                          <span
                            className={`
                                      text-xs transition-transform duration-300
                                      ${isSelected ? "scale-110" : ""}
                                    `}
                            style={{ fontFamily: "var(--font-mono-brand)" }}
                          >
                            {opt.icon}
                          </span>
                          <span>{opt.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => togglePrayerNotYet(key)}
                  className={`
                            w-full rounded-2xl border-2 py-3 px-4
                            text-sm font-medium
                            transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                            active:scale-[0.98]
                            ${notYet
                      ? "border-[#8A4FFF] bg-[#8A4FFF]/5 text-[#8A4FFF] dark:border-[#C3BEF7] dark:bg-[#8A4FFF]/10 dark:text-[#C3BEF7]"
                      : "border-[#E5ECF4] bg-transparent text-gray-500 hover:border-[#C3BEF7]/50 hover:text-gray-700 dark:border-[#2a2a3e] dark:text-gray-400 dark:hover:border-[#8A4FFF]/30 dark:hover:text-gray-300"
                    }
                          `}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className={`
                                text-xs transition-transform duration-300
                                ${notYet ? "rotate-0" : "rotate-45"}
                              `}
                      style={{ fontFamily: "var(--font-mono-brand)" }}
                    >
                      {notYet ? "✕" : "+"}
                    </span>
                    {notYet ? "Prayer not yet due — tap to enable scoring" : "Not time yet (salah has not started)"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .prayer-card-appear {
          animation: cardAppear 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </SlideShell>
  );
}

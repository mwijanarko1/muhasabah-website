import { dateKeyInTimeZone } from "@/lib/dateKey";

export function getBrowserTodayDateKey(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return dateKeyInTimeZone(new Date(), tz);
}

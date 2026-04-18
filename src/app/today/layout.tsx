import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today’s Reflection - Muhasabah",
  description: "Complete today’s private Muhasabah reflection.",
  alternates: {
    canonical: "/today",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function TodayLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

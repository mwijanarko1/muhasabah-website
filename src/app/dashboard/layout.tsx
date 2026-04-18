import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Muhasabah",
  description: "View your private Muhasabah journal history and daily accountability summary.",
  alternates: {
    canonical: "/dashboard",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

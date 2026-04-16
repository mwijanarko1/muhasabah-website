import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Literata, Syne } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const fontDisplay = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fontBody = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EFFFFA" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1423" },
  ],
};

// Define metadata for better SEO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Muhasabah — Daily Self-Accountability Journal",
  description:
    "Track your daily spiritual accounting: prayers, dhikr, worship, kindness, learning, and heart presence.",
  keywords: ["Muhasabah", "Islamic", "Journal", "Self-Accountability", "Prayers"],
  authors: [{ name: "Created with Cursor Agent" }],
  creator: "Muhasabah",
  publisher: "Muhasabah",
  openGraph: {
    title: "Muhasabah — Daily Self-Accountability Journal",
    description:
      "Track your daily spiritual accounting: prayers, dhikr, worship, kindness, learning, and heart presence.",
    url: "/",
    siteName: "Muhasabah",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Muhasabah",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhasabah — Daily Self-Accountability Journal",
    description:
      "Track your daily spiritual accounting: prayers, dhikr, worship, kindness, learning, and heart presence.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} ${fontBody.className} antialiased bg-brand-white text-brand-ink dark:bg-[#1a1423] dark:text-brand-mint`}
      >
        <a
          href="#main-content"
          className="absolute -top-12 left-4 z-50 rounded-md bg-brand-accent px-4 py-2 text-white transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-brand-periwinkle focus:ring-offset-2 focus:ring-offset-brand-mint dark:focus:ring-offset-[#1a1423]"
        >
          Skip to main content
        </a>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}

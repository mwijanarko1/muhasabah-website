import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Literata, Syne } from "next/font/google";
import "./globals.css";
import { FirebaseAuthProvider } from "@/components/FirebaseAuthProvider";
import {
  buildWebApplicationJsonLd,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    types: {
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
  const webApplicationJsonLd = buildWebApplicationJsonLd();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} ${fontBody.className} antialiased bg-brand-white text-brand-ink dark:bg-[#1a1423] dark:text-brand-mint`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
        />
        <a
          href="#main-content"
          className="absolute -top-12 left-4 z-50 rounded-md bg-brand-accent px-4 py-2 text-white transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-brand-periwinkle focus:ring-offset-2 focus:ring-offset-brand-mint dark:focus:ring-offset-[#1a1423]"
        >
          Skip to main content
        </a>
        <FirebaseAuthProvider>
          {children}
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}

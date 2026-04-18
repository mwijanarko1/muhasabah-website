export const SITE_NAME = "Muhasabah";
export const SITE_TITLE = "Muhasabah - Daily Self-Accountability Journal";
export const SITE_DESCRIPTION =
  "Track daily Islamic self-accountability across prayers, dhikr, worship, conduct, learning, and heart presence.";

export const SITE_KEYWORDS = [
  "Muhasabah",
  "Islamic journal",
  "self-accountability",
  "daily reflection",
  "prayer tracker",
  "spiritual growth",
];

const DEFAULT_SITE_URL = "https://muhasabah-omega.vercel.app";

type ChangeFrequency = "weekly" | "monthly" | "yearly";
type MarkdownLine = string | (() => string);

export type PublicPage = {
  key: "home" | "privacy" | "terms";
  title: string;
  path: "/" | "/privacy" | "/terms";
  description: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  llmsPath: "/llms/home.md" | "/llms/privacy.md" | "/llms/terms.md";
  markdownTitle: string;
  markdownSections: ReadonlyArray<{
    heading: string;
    lines: readonly MarkdownLine[];
  }>;
};

const PUBLIC_PAGES = [
  {
    key: "home",
    title: "Home",
    path: "/",
    description:
      "Muhasabah is a minimalist web app for daily Islamic self-accountability and reflection.",
    priority: 1,
    changeFrequency: "weekly",
    llmsPath: "/llms/home.md",
    markdownTitle: SITE_NAME,
    markdownSections: [
      {
        heading: "Purpose",
        lines: [
          "Muhasabah helps people complete a daily reflection across prayers, dhikr and Quran, worship, kindness, learning, speech, and heart presence.",
          "The app supports anonymous daily completion on the current device and Google sign-in for synced history.",
        ],
      },
      {
        heading: "Public Links",
        lines: [
          () => `Start a reflection: ${buildAbsoluteUrl("/today")}`,
          () => `Privacy policy: ${buildAbsoluteUrl("/privacy")}`,
          () => `Terms of use: ${buildAbsoluteUrl("/terms")}`,
        ],
      },
    ],
  },
  {
    key: "privacy",
    title: "Privacy Policy",
    path: "/privacy",
    description:
      "Muhasabah explains how account data, journal data, technical data, cookies, service providers, and privacy requests are handled.",
    priority: 0.4,
    changeFrequency: "yearly",
    llmsPath: "/llms/privacy.md",
    markdownTitle: "Muhasabah Privacy Policy",
    markdownSections: [
      {
        heading: "Data Covered",
        lines: [
          "The policy covers Google sign-in account identifiers, journal content stored for signed-in sync, and technical settings such as timezone preference.",
          "Muhasabah states that it does not sell personal information and does not use advertising or analytics cookies by default.",
        ],
      },
      {
        heading: "Requests",
        lines: [
          "Visitors can use the contact details on the canonical privacy page to request access, correction, deletion, export, or other applicable privacy rights.",
          () => `Contact section: ${buildAbsoluteUrl("/privacy#contact")}`,
        ],
      },
    ],
  },
  {
    key: "terms",
    title: "Terms of Use",
    path: "/terms",
    description:
      "Muhasabah terms describe the personal journaling service, account responsibilities, submitted content, disclaimers, governing law, and contact path.",
    priority: 0.3,
    changeFrequency: "yearly",
    llmsPath: "/llms/terms.md",
    markdownTitle: "Muhasabah Terms of Use",
    markdownSections: [
      {
        heading: "Service",
        lines: [
          "Muhasabah is provided as a personal journaling tool for self-accountability.",
          "Users are responsible for their account credentials, submitted information, and lawful use of the service.",
        ],
      },
      {
        heading: "Content and Disclaimer",
        lines: [
          "Users retain rights to submitted content and grant Muhasabah a limited license to host, store, and process it to operate the service.",
          "The service is for personal reflection and is not professional religious, medical, or mental health advice.",
        ],
      },
    ],
  },
] as const satisfies readonly PublicPage[];

export function getSiteUrl(): string {
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (vercelUrl ? `https://${vercelUrl}` : DEFAULT_SITE_URL);

  try {
    return new URL(rawUrl).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function buildAbsoluteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function getIndexablePages(): readonly PublicPage[] {
  return PUBLIC_PAGES;
}

export function getLlmsDocuments(): readonly PublicPage[] {
  return PUBLIC_PAGES;
}

export function getLlmsDocumentByPath(documentPath: string): PublicPage | undefined {
  const normalizedPath = documentPath.startsWith("/") ? documentPath : `/llms/${documentPath}`;
  return PUBLIC_PAGES.find((page) => page.llmsPath === normalizedPath);
}

export function buildLlmsTxt(): string {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `Canonical site: ${buildAbsoluteUrl("/")}`,
    `Summary: ${SITE_DESCRIPTION}`,
    "",
    "Markdown companions:",
    ...PUBLIC_PAGES.map(
      (page) =>
        `- ${page.title}: ${buildAbsoluteUrl(page.llmsPath)} (canonical ${buildAbsoluteUrl(page.path)})`,
    ),
    "",
    "Canonical HTML pages are the primary indexable pages. Markdown companions are public, factual, and marked noindex, follow.",
  ];

  return `${lines.join("\n")}\n`;
}

export function buildLlmsMarkdown(page: PublicPage): string {
  const lines = [
    `# ${page.markdownTitle}`,
    "",
    `Canonical page: ${buildAbsoluteUrl(page.path)}`,
    "",
    page.description,
    "",
  ];

  for (const section of page.markdownSections) {
    lines.push(
      `## ${section.heading}`,
      "",
      ...section.lines.map((line) => (typeof line === "function" ? line() : line)),
      "",
    );
  }

  return `${lines.join("\n").trim()}\n`;
}

export function buildWebApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: buildAbsoluteUrl("/"),
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

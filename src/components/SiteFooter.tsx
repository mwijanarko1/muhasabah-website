"use client";

import Link from "next/link";

export function SiteFooter() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const contactHref = email
    ? `mailto:${encodeURIComponent(email)}`
    : "/privacy#contact";
  const contactIsMail = Boolean(email);

  return (
    <footer className="mt-auto border-t-2 border-brand-periwinkle/10 bg-brand-white/95 py-8 text-center text-sm font-body text-gray-700 dark:border-gray-800 dark:bg-gray-900/95 dark:text-gray-300">
      <nav aria-label="Legal and contact">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <li>
            <Link
              href="/privacy"
              className="font-bold text-brand-accent underline-offset-4 hover:underline dark:text-brand-periwinkle"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="font-bold text-brand-accent underline-offset-4 hover:underline dark:text-brand-periwinkle"
            >
              Terms
            </Link>
          </li>
          <li>
            <Link
              href="/llms.txt"
              className="font-bold text-brand-accent underline-offset-4 hover:underline dark:text-brand-periwinkle"
            >
              LLMs
            </Link>
          </li>
          <li>
            <a
              href={contactHref}
              className="font-bold text-brand-accent underline-offset-4 hover:underline dark:text-brand-periwinkle"
            >
              {contactIsMail ? "Contact" : "Contact / privacy requests"}
            </a>
          </li>
        </ul>
      </nav>
      <p className="mt-4 font-mono-brand text-[10px] uppercase tracking-widest text-gray-400">
        © 2024 Muhasabah
      </p>
    </footer>
  );
}

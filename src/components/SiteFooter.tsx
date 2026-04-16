"use client";

import Link from "next/link";

export function SiteFooter() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const contactHref = email
    ? `mailto:${encodeURIComponent(email)}`
    : "/privacy#contact";
  const contactIsMail = Boolean(email);

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/90 py-6 text-center text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300">
      <nav aria-label="Legal and contact">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <li>
            <Link
              href="/privacy"
              className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              Terms
            </Link>
          </li>
          <li>
            <a
              href={contactHref}
              className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              {contactIsMail ? "Contact" : "Contact / privacy requests"}
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

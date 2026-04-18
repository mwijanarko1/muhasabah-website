import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — Muhasabah",
  description:
    "How Muhasabah collects, uses, and protects your account and journal data.",
};

export default function PrivacyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white/90 dark:border-gray-700 dark:bg-gray-800/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/muhasabah"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to app
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 text-gray-800 dark:text-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Last updated: April 15, 2026
        </p>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Who we are</h2>
          <p>
            Muhasabah (“we”, “us”) provides a personal journal web application. This policy
            describes how we handle information when you use the service.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Information we collect
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Account data:</strong> When you sign in with Google, we receive identifiers
              from your Google account (such as your Google user ID and email address) through our
              authentication provider, processed by Firebase Authentication.
            </li>
            <li>
              <strong>Journal data:</strong> Content you enter in the app (scores, notes, optional
              text, and your selected calendar day) is stored in Firestore.
            </li>
            <li>
              <strong>Technical data:</strong> Your browser may send a timezone preference; we may
              store a timezone string to align journal days with your location.
            </li>
          </ul>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            How we use information
          </h2>
          <p>
            We use this information only to provide and secure the service: authentication,
            syncing your journal, and improving reliability. We do not sell your personal
            information.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Service providers
          </h2>
          <p>
            We use third-party services that process data on our behalf, including:{" "}
            <strong>Firebase</strong> (authentication and database infrastructure) and{" "}
            <strong>Google</strong> (sign-in). Their use of data is governed by their respective
            terms and privacy policies.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cookies and similar technologies
          </h2>
          <p>
            We use cookies and similar technologies that are necessary to keep you signed in and
            to protect your session. We do not use advertising or analytics cookies in the app by
            default. If we add optional analytics later, we will ask for your consent where
            required by law.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Children’s privacy
          </h2>
          <p>
            Muhasabah is not directed at children under 13, and we do not knowingly collect personal
            information from children under 13. If you believe we have collected such information,
            contact us and we will delete it promptly.
          </p>
        </section>

        <section id="data-rights" className="mt-8 space-y-4 scroll-mt-24">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your rights and choices
          </h2>
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or
            export your personal data, or to object to certain processing. You can revoke Google’s
            access to new sign-ins from your Google account settings. To request deletion of your
            account and journal data stored with us, or to exercise other rights, contact us using
            the details below.
          </p>
        </section>

        <section id="contact" className="mt-8 space-y-4 scroll-mt-24">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
          {contactEmail ? (
            <p>
              For privacy questions or requests:{" "}
              <a
                className="font-medium text-indigo-600 underline dark:text-indigo-400"
                href={`mailto:${encodeURIComponent(contactEmail)}`}
              >
                {contactEmail}
              </a>
              .
            </p>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              For privacy questions or requests, configure{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
                NEXT_PUBLIC_CONTACT_EMAIL
              </code>{" "}
              for this deployment so visitors can reach the operator.
            </p>
          )}
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Changes</h2>
          <p>
            We may update this policy from time to time. The “Last updated” date will change when
            we do. Continued use of the service after changes means you accept the updated policy.
          </p>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}

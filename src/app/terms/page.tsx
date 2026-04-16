import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Use (Muhasabah)",
  description: "Terms governing use of the Muhasabah journal application.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Use</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Last updated: April 15, 2026
        </p>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">The service</h2>
          <p>
            Muhasabah is a personal journaling tool for self-accountability. We provide it “as
            is” and may change or discontinue features with reasonable notice where practicable.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your account</h2>
          <p>
            You are responsible for your account credentials and for the accuracy of information
            you enter. You must not misuse the service, attempt to access others’ data, or use the
            service in violation of applicable law.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your content</h2>
          <p>
            You retain rights to the content you submit. You grant us a limited license to host,
            store, and process that content solely to operate the service for you. Do not submit
            unlawful content or content that infringes others’ rights.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Disclaimer</h2>
          <p>
            The service is for personal reflection and is not professional religious, medical, or
            mental health advice. We are not liable for decisions you make based on your use of the
            app. To the maximum extent permitted by law, we disclaim warranties and limit liability
            for indirect or consequential damages.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Governing law</h2>
          <p>
            These terms are governed by the laws applicable to the operator of this deployment,
            without regard to conflict-of-law rules. Courts in that jurisdiction will have
            exclusive venue unless mandatory consumer protections in your country say otherwise.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
          <p>
            See our{" "}
            <Link
              href="/privacy#contact"
              className="font-medium text-indigo-600 underline dark:text-indigo-400"
            >
              Privacy Policy
            </Link>{" "}
            for how to reach the operator regarding privacy and data requests.
          </p>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}

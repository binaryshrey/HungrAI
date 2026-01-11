"use client";
import Link from "next/link";

export default function CTA({ signInUrl }: { signInUrl: string }) {
  return (
    <div className="bg-black pt-20">
      <div className="relative isolate px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h4 className="text-3xl font-bold tracking-tight text-white sm:text-3xl">
              Smarter food choices starts here.
            </h4>
            <h4 className="text-3xl font-bold tracking-tight text-white sm:text-3xl">
              Start using HungrAI today!
            </h4>
            <p className="mt-6 text-sm leading-8 text-gray-500">
              Personalized meal recommendations, powered by Google Gemini.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href={signInUrl ? signInUrl : "/"}
                className="rounded-md bg-green-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

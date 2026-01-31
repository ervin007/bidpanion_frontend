"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { APP_NAME } from "@/config/config";

export default function LandingHeroMinimal() {
  return (
    <section className="w-full px-4 py-24 md:py-32">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          Build your SaaS{" "}
          <span className="text-violet-600 dark:text-violet-500">faster</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          {APP_NAME} gives you everything you need to launch your product.
          Authentication, payments, emails, and more - all ready to go.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-violet-600 px-8 font-medium text-white transition-colors hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
          >
            Get Started
          </Link>

          <Link
            href="#pricing"
            className="group inline-flex h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-8 font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            View Pricing
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

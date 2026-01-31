"use client";

import { Zap, Shield, CreditCard, Mail } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built on Next.js 15 with React 19 for optimal performance and developer experience.",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description:
      "Better-Auth with email/password, OAuth providers, and email verification built-in.",
  },
  {
    icon: CreditCard,
    title: "Payments Ready",
    description:
      "Stripe integration with subscriptions, one-time payments, and customer portal.",
  },
  {
    icon: Mail,
    title: "Transactional Emails",
    description:
      "Beautiful email templates with Resend integration for all your notifications.",
  },
];

export default function LandingFeaturesMinimal() {
  return (
    <section className="w-full bg-gray-50 px-4 py-24 dark:bg-gray-900/50">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            All the features to build and launch your SaaS product.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

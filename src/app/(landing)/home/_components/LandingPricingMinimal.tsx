"use client";

import PricingPlans from "@/components/pricing/PricingPlans";
import { APP_NAME } from "@/config/config";

export default function LandingPricingMinimal() {
  return (
    <section id="pricing" className="w-full px-4 py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Simple pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Start building with {APP_NAME} today. No credit card required.
          </p>
        </div>

        <PricingPlans />
      </div>
    </section>
  );
}

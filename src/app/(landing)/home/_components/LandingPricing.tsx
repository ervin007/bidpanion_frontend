"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/config";
import {
  PlanType,
  SubscriptionInterval,
} from "@/config/payment-plans";
import {
  getActivePaymentPlans,
  getCheckoutUrl,
  getSignInUrlForPricing,
} from "@/lib/payment-utils";
import { authClient } from "@/server/auth/client";
import { PRICING_FEATURES } from "@/components/pricing/PricingPlans";
import LandingSectionTitle from "./LandingSectionTitle";

function SavingsBadge({ savings }: { savings: number }) {
  if (!savings || savings <= 0) return null;

  return (
    <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1 text-sm font-medium text-violet-600 dark:border-violet-900/50 dark:bg-violet-900/20 dark:text-violet-400">
      <span className="mr-1 text-xs">🎉</span> Save {savings}% when you choose the
      annual plan
    </div>
  );
}

function GetStartedButton({
  variant = "default",
  className = "",
  href,
}: {
  variant?: "default" | "muted" | "annual";
  className?: string;
  href: string;
}) {
  const isPrimary = variant === "annual";

  return (
    <Button
      asChild
      className={`${className} group flex items-center justify-center gap-2 ${
        isPrimary
          ? "bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900"
          : ""
      }`}
      variant={variant === "muted" ? "outline" : "default"}
    >
      <Link href={href}>
        Get started
        <ArrowRight className="ml-2 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Button>
  );
}

function PlanFeatures({ features }: { features: string[] }) {
  return (
    <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-2">
          <span className="text-violet-500">✓</span>
          {feature}
        </li>
      ))}
    </ul>
  );
}

export default function LandingPricing() {
  const planVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const plans = getActivePaymentPlans();
  const { data: session } = authClient.useSession();
  const isAuthenticated = Boolean(session);

  const monthlyPlan = plans.find(
    (plan) =>
      plan.type === PlanType.Subscription &&
      plan.interval === SubscriptionInterval.Monthly,
  );

  const annualPlan = plans.find(
    (plan) =>
      plan.type === PlanType.Subscription &&
      plan.interval === SubscriptionInterval.Annual,
  );

  const lifetimePlan = plans.find((plan) => plan.type === PlanType.OneTime);

  const savings =
    monthlyPlan && annualPlan
      ? Math.round(
          100 - (annualPlan.priceAmount / (monthlyPlan.priceAmount * 12)) * 100,
        )
      : 0;

  const getActionUrl = (planSlug: string | undefined) => {
    if (!planSlug) return "/pricing";
    if (!isAuthenticated) return getSignInUrlForPricing();
    return getCheckoutUrl(planSlug);
  };

  const cards = [
    monthlyPlan && {
      key: monthlyPlan.slug,
      title: monthlyPlan.name,
      description:
        monthlyPlan.description ??
        "Flexible month-to-month plan with all essential features.",
      price: monthlyPlan.price,
      priceLabel: "/month",
      variant: "muted" as const,
      href: getActionUrl(monthlyPlan.slug),
      features: PRICING_FEATURES,
      highlight: false,
    },
    annualPlan && {
      key: annualPlan.slug,
      title: annualPlan.name,
      description:
        annualPlan.description ?? "Unlock pro features for the best value all year long.",
      price: annualPlan.price,
      priceLabel: "/year",
      variant: "annual" as const,
      href: getActionUrl(annualPlan.slug),
      features: PRICING_FEATURES,
      highlight: true,
      badge: "Most Popular",
      savings,
    },
    lifetimePlan && {
      key: lifetimePlan.slug,
      title: lifetimePlan.name,
      description:
        lifetimePlan.description ?? "One-time payment for lifetime access to every feature.",
      price: lifetimePlan.price,
      priceLabel: "/lifetime",
      variant: "default" as const,
      href: getActionUrl(lifetimePlan.slug),
      features: [...PRICING_FEATURES, "Lifetime access, pay once"],
      highlight: false,
    },
  ].filter(Boolean) as Array<
    {
      key: string;
      title: string;
      description: string;
      price: string;
      priceLabel: string;
      variant: "default" | "muted" | "annual";
      href: string;
      features: string[];
      highlight: boolean;
      badge?: string;
      savings?: number;
    }
  >;

  return (
    <section id="pricing" className="w-full py-24">
      <div className="container mx-auto px-4">
        <LandingSectionTitle
          title="Simple, transparent pricing"
          description={`Try ${APP_NAME} free for 7 days. No credit card required.`}
        />
        <div className="mt-4 flex justify-center">
          <SavingsBadge savings={savings} />
        </div>

        <motion.div
          className={`mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 ${
            cards.length === 2
              ? "md:grid-cols-2"
              : cards.length >= 3
                ? "md:grid-cols-2 lg:grid-cols-3"
                : ""
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.key}
              className={`relative rounded-2xl border p-8 shadow-sm transition-shadow dark:bg-gray-900/50 ${
                card.highlight
                  ? "border-violet-500 shadow-lg dark:border-violet-700"
                  : "border-gray-200 dark:border-gray-800"
              }`}
              variants={planVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={card.highlight ? { delay: 0.2 } : {}}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              {card.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1 text-sm font-medium text-white">
                  {card.badge}
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {card.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {card.description}
              </p>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {card.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {card.priceLabel}
                </span>
              </p>
              {card.savings && card.savings > 0 && (
                <div className="mt-4 rounded-lg bg-violet-100 p-3 text-sm text-violet-900 dark:bg-violet-900/30 dark:text-violet-200">
                  Save {card.savings}% when billed annually
                </div>
              )}
              <GetStartedButton
                variant={card.variant}
                className="mt-8 w-full"
                href={card.href}
              />
              <PlanFeatures features={card.features} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

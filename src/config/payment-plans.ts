export enum PlanType {
  Subscription = "subscription",
  OneTime = "one-time",
}

export enum SubscriptionInterval {
  Monthly = "monthly",
  Annual = "annual",
}

export interface BasePlanInfo {
  slug: string;
  name: string;
  description?: string;
  type: PlanType;
  interval?: SubscriptionInterval;
  price: string;
  priceAmount: number;
}

interface BasePlanWithId extends BasePlanInfo {
  priceId: string;
}

export interface SubscriptionPlan extends BasePlanWithId {
  type: PlanType.Subscription;
  interval: SubscriptionInterval;
}

export interface OneTimePlan extends BasePlanWithId {
  type: PlanType.OneTime;
}

export type PaymentPlan = SubscriptionPlan | OneTimePlan;

export const basePlans: BasePlanInfo[] = [
  {
    slug: "pro-monthly",
    name: "Pro Monthly",
    description: "Monthly subscription for pro features.",
    type: PlanType.Subscription,
    interval: SubscriptionInterval.Monthly,
    price: "$19",
    priceAmount: 19,
  },
  {
    slug: "pro-annual",
    name: "Pro Annual",
    description: "Annual subscription for pro features",
    type: PlanType.Subscription,
    interval: SubscriptionInterval.Annual,
    price: "$190",
    priceAmount: 190,
  },
  {
    slug: "lifetime",
    name: "Lifetime Access",
    description: "One-time payment for lifetime access.",
    type: PlanType.OneTime,
    price: "$499",
    priceAmount: 499,
  },
];

// Price IDs are loaded from environment variables
// Set these in your .env file with your Stripe price IDs
export const getStripePriceIds = (): Record<string, string> => {
  // These are accessed at runtime from serverEnv
  // For client-side, we don't need the actual IDs - just the slugs
  return {
    "pro-monthly": process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "",
    "pro-annual": process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "",
    lifetime: process.env.STRIPE_PRICE_ID_LIFETIME || "",
  };
};

export const createPlansWithPriceIds = (
  priceIds: Record<string, string>,
): PaymentPlan[] => {
  return basePlans
    .map((basePlan: BasePlanInfo) => {
      const priceId = priceIds[basePlan.slug];
      if (!priceId) {
        console.warn(
          `Price ID not found for slug '${basePlan.slug}'. Make sure STRIPE_PRICE_ID_* env vars are set.`,
        );
        return null;
      }

      if (basePlan.type === PlanType.Subscription) {
        if (!basePlan.interval) {
          console.error(
            `Subscription plan '${basePlan.slug}' is missing an interval.`,
          );
          return null;
        }
        return {
          ...basePlan,
          priceId,
          type: PlanType.Subscription,
          interval: basePlan.interval,
        } as SubscriptionPlan;
      } else {
        return {
          ...basePlan,
          priceId,
          type: PlanType.OneTime,
        } as OneTimePlan;
      }
    })
    .filter((plan): plan is PaymentPlan => plan !== null);
};

export const getPaymentPlans = (): PaymentPlan[] => {
  return createPlansWithPriceIds(getStripePriceIds());
};

// Get base plans without price IDs (for client-side display)
export const getBasePlans = (): BasePlanInfo[] => {
  return basePlans;
};

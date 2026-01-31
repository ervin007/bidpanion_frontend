import {
  type PaymentPlan,
  getPaymentPlans,
  getBasePlans,
  type BasePlanInfo,
} from "@/config/payment-plans";

/**
 * Helper function to get the active plans with price IDs (server-side only)
 */
export const getActivePaymentPlans = (): PaymentPlan[] => {
  return getPaymentPlans();
};

/**
 * Helper function to get base plans for client-side display
 */
export const getBasePlansForDisplay = (): BasePlanInfo[] => {
  return getBasePlans();
};

/**
 * Type definition for simplified plan format used by Stripe plugin
 */
export type StripeProductFormat = {
  priceId: string;
  name: string;
};

export const getPlansForStripePlugin = (): StripeProductFormat[] => {
  const plans = getPaymentPlans();
  return plans.map((plan) => ({
    priceId: plan.priceId,
    name: plan.slug,
  }));
};

/**
 * Generate a checkout URL for a specific plan
 * @param planSlug The slug of the plan to checkout
 * @returns The checkout URL for the given plan
 */
export const getCheckoutUrl = (planSlug: string): string => {
  return `/api/auth/stripe/checkout?plan=${planSlug}`;
};

/**
 * Generate a sign-in URL with redirect back to pricing
 * @returns URL to sign in page with return to pricing
 */
export const getSignInUrlForPricing = (): string => {
  return `/signup`;
};

"use client";

import { StripeActiveSubscriptionCard } from "./StripeActiveSubscriptionCard";

interface StripeSubscription {
  id: string;
  status: string;
  priceId?: string;
  productId?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
}

interface StripeActiveSubscriptionsProps {
  subscriptions: StripeSubscription[];
}

export function StripeActiveSubscriptions({
  subscriptions,
}: StripeActiveSubscriptionsProps) {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <p className="text-muted-foreground">No active subscriptions found.</p>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Active Subscriptions</h4>
      {subscriptions.map((sub) => (
        <StripeActiveSubscriptionCard key={sub.id} subscription={sub} />
      ))}
    </div>
  );
}

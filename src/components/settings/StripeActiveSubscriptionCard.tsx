"use client";

import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Repeat,
} from "lucide-react";

interface StripeSubscription {
  id: string;
  status: string;
  priceId?: string;
  productId?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
}

interface StripeActiveSubscriptionCardProps {
  subscription: StripeSubscription;
}

export function StripeActiveSubscriptionCard({
  subscription,
}: StripeActiveSubscriptionCardProps) {
  const {
    status,
    cancelAtPeriodEnd,
    currentPeriodEnd,
  } = subscription;

  const formattedEndDate = currentPeriodEnd
    ? format(new Date(currentPeriodEnd * 1000), "MMMM dd, yyyy")
    : "N/A";

  const isActivelyCancelling = cancelAtPeriodEnd;
  const isActive = status === "active" || status === "trialing";

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-lg font-semibold">Subscription Plan</h4>
        <span
          className={`focus:ring-ring inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
            isActive && !isActivelyCancelling
              ? "border-transparent bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
              : isActivelyCancelling
                ? "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400"
                : "border-transparent bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400"
          }`}
        >
          {isActive && !isActivelyCancelling ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {isActivelyCancelling
            ? `Cancels on ${formattedEndDate}`
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <div className="text-muted-foreground space-y-1 text-sm">
        <div className="flex items-center">
          <Repeat className="mr-2 h-4 w-4" />
          <span>Active subscription</span>
        </div>
        {!isActivelyCancelling && currentPeriodEnd && (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Current period ends: {formattedEndDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

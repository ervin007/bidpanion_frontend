import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { serverEnv } from "@/env";

const stripeSubscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  priceId: z.string().optional(),
  productId: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  currentPeriodStart: z.number().optional(),
  currentPeriodEnd: z.number().optional(),
});

const stripeStateSchema = z.object({
  subscriptions: z.array(stripeSubscriptionSchema).optional(),
});

export const stripeRouter = createTRPCRouter({
  getBillingState: publicProcedure.query(async ({ ctx }) => {
    try {
      // Return NoOp if Stripe is not configured
      if (!serverEnv.NEXT_PUBLIC_ENABLE_STRIPE) {
        return {
          subscriptions: [],
          isPro: false,
        };
      }

      const url = `${serverEnv.NEXT_PUBLIC_APP_URL}/api/auth/stripe/subscriptions`;
      const cookieHeader = ctx.headers.get("cookie");
      const response = await fetch(url, {
        headers: cookieHeader ? { cookie: cookieHeader } : {},
      });

      if (!response.ok) {
        // User might not be authenticated
        if (response.status === 401) {
          return {
            subscriptions: [],
            isPro: false,
          };
        }
        throw new Error(`Failed to fetch billing state: ${response.status}`);
      }

      const rawData = await response.json();
      const parsedData = stripeStateSchema.parse(rawData);

      // Check if user has any active subscription
      const isPro =
        parsedData.subscriptions?.some(
          (sub) => sub.status === "active" || sub.status === "trialing",
        ) ?? false;

      return {
        subscriptions: parsedData.subscriptions ?? [],
        isPro,
      };
    } catch (error) {
      console.error("Error fetching billing state:", error);
      return {
        subscriptions: [],
        isPro: false,
      };
    }
  }),

  createPortalSession: publicProcedure.mutation(async ({ ctx }) => {
    try {
      if (!serverEnv.NEXT_PUBLIC_ENABLE_STRIPE) {
        throw new Error("Stripe is not enabled");
      }

      const url = `${serverEnv.NEXT_PUBLIC_APP_URL}/api/auth/stripe/portal`;
      const cookieHeader = ctx.headers.get("cookie");
      const response = await fetch(url, {
        method: "POST",
        headers: cookieHeader ? { cookie: cookieHeader } : {},
      });

      if (!response.ok) {
        throw new Error(`Failed to create portal session: ${response.status}`);
      }

      const data = await response.json();
      return { url: data.url };
    } catch (error) {
      console.error("Error creating portal session:", error);
      throw error;
    }
  }),
});

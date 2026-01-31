import { z } from "zod";
import { zFalse, zStringToBool, zTrue } from "./utils";

// Server-only Stripe vars (required when Stripe is enabled)
const stripeServerSchema = z.object({
  STRIPE_SECRET_KEY: z.string().nonempty(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_PRO_MONTHLY: z.string().nonempty(),
  STRIPE_PRICE_ID_PRO_ANNUAL: z.string().nonempty(),
  STRIPE_PRICE_ID_LIFETIME: z.string().nonempty(),
});

export const clientSchema = z.object({
  NEXT_PUBLIC_ENABLE_STRIPE: zStringToBool.default("false"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

// Server schema: Conditional - require server vars only when Stripe is enabled
export const serverSchema = z.intersection(
  clientSchema,
  z.union([
    z
      .object({ NEXT_PUBLIC_ENABLE_STRIPE: zTrue })
      .merge(stripeServerSchema)
      .merge(
        z.object({
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().nonempty(),
        }),
      ),
    z.object({
      NEXT_PUBLIC_ENABLE_STRIPE: zFalse,
    }),
  ]),
);

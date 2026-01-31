import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { utImageRouter } from "./routers/utImage";
import { stripeRouter } from "./routers/stripe";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";

export const appRouter = createTRPCRouter({
  user: userRouter,
  utImage: utImageRouter,
  stripe: stripeRouter,
  auth: authRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);

import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { utImageRouter } from "./routers/utImage";
import { stripeRouter } from "./routers/stripe";
import { authRouter } from "./routers/auth";
import { adminRouter } from "./routers/admin";
import { workspaceRouter } from "./routers/workspace";
import { tenderRouter } from "./routers/tender";
import { taskRouter } from "./routers/task";
import { checklistRouter } from "./routers/checklist";
import { commentRouter } from "./routers/comment";
import { companyProfileRouter } from "./routers/companyProfile";
import { teamRouter } from "./routers/team";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
  user: userRouter,
  utImage: utImageRouter,
  stripe: stripeRouter,
  auth: authRouter,
  admin: adminRouter,
  workspace: workspaceRouter,
  tender: tenderRouter,
  task: taskRouter,
  checklist: checklistRouter,
  comment: commentRouter,
  companyProfile: companyProfileRouter,
  team: teamRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);

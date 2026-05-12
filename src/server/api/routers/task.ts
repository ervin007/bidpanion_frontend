import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";
import { TaskPriority, TaskStatus, TaskType } from "@/generated/prisma";

const cuid = z.string().min(1);

type Db = typeof import("@/server/db").db;

async function assertTaskInWorkspace(
  db: Db,
  taskId: string,
  workspaceId: string,
) {
  const task = await db.tenderTask.findFirst({
    where: { id: taskId, tender: { workspaceId } },
    include: { tender: { select: { id: true, title: true } } },
  });
  if (!task) throw new TRPCError({ code: "NOT_FOUND" });
  return task;
}

export const taskRouter = createTRPCRouter({
  listByTender: workspaceProcedure
    .input(z.object({ tenderId: cuid }))
    .query(async ({ ctx, input }) => {
      const tender = await ctx.db.tender.findFirst({
        where: { id: input.tenderId, workspaceId: ctx.workspace.id },
        select: { id: true },
      });
      if (!tender) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.tenderTask.findMany({
        where: { tenderId: input.tenderId },
        orderBy: { createdAt: "asc" },
        include: {
          assignee: { select: { id: true, name: true } },
          subtasks: { orderBy: { order: "asc" } },
        },
      });
    }),

  create: workspaceProcedure
    .input(
      z.object({
        tenderId: cuid,
        title: z.string().min(1),
        description: z.string().nullish(),
        assigneeId: z.string().nullish(),
        dueDate: z.date().nullish(),
        priority: z.nativeEnum(TaskPriority).default("MEDIUM"),
        type: z.nativeEnum(TaskType).default("CUSTOM"),
        effort: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tender = await ctx.db.tender.findFirst({
        where: { id: input.tenderId, workspaceId: ctx.workspace.id },
        select: { id: true },
      });
      if (!tender) throw new TRPCError({ code: "NOT_FOUND" });
      const task = await ctx.db.tenderTask.create({ data: input });
      await ctx.db.activityEntry.create({
        data: {
          tenderId: input.tenderId,
          type: "TASK",
          actorId: ctx.session.user.id,
          description: `Task created: ${task.title}`,
        },
      });
      return task;
    }),

  update: workspaceProcedure
    .input(
      z.object({
        id: cuid,
        title: z.string().min(1).optional(),
        description: z.string().nullish().optional(),
        assigneeId: z.string().nullish().optional(),
        dueDate: z.date().nullish().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(TaskPriority).optional(),
        effort: z.string().nullish().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await assertTaskInWorkspace(ctx.db, id, ctx.workspace.id);
      const task = await ctx.db.tenderTask.update({ where: { id }, data });
      if (data.status === "DONE" && existing.status !== "DONE") {
        await ctx.db.activityEntry.create({
          data: {
            tenderId: existing.tenderId,
            type: "TASK",
            actorId: ctx.session.user.id,
            description: `Task completed: ${task.title}`,
          },
        });
      }
      return task;
    }),

  delete: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      await assertTaskInWorkspace(ctx.db, input.id, ctx.workspace.id);
      await ctx.db.tenderTask.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  toggleSubtask: workspaceProcedure
    .input(z.object({ id: cuid, completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const subtask = await ctx.db.taskSubtask.findFirst({
        where: { id: input.id, task: { tender: { workspaceId: ctx.workspace.id } } },
      });
      if (!subtask) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.taskSubtask.update({
        where: { id: input.id },
        data: { completed: input.completed },
      });
    }),

  addSubtask: workspaceProcedure
    .input(z.object({ taskId: cuid, title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await assertTaskInWorkspace(ctx.db, input.taskId, ctx.workspace.id);
      const count = await ctx.db.taskSubtask.count({
        where: { taskId: input.taskId },
      });
      return ctx.db.taskSubtask.create({
        data: { taskId: input.taskId, title: input.title, order: count },
      });
    }),
});

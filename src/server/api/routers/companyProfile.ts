import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";
import {
  DEFAULT_COMPANY_PROFILE_SECTIONS,
  FIT_WEIGHTS,
} from "@/server/bidpanion/workspace-setup";

function completionFor(data: unknown): number {
  if (!data || typeof data !== "object") return 0;
  const entries = Object.values(data as Record<string, unknown>);
  if (entries.length === 0) return 0;
  const filled = entries.filter((v) => {
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v as object).length > 0;
    return true;
  }).length;
  return Math.round((filled / entries.length) * 100);
}

type Db = typeof import("@/server/db").db;

async function ensureProfile(db: Db, workspaceId: string) {
  let profile = await db.companyProfile.findUnique({
    where: { workspaceId },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!profile) {
    profile = await db.companyProfile.create({
      data: {
        workspaceId,
        sections: {
          create: DEFAULT_COMPANY_PROFILE_SECTIONS.map((s, i) => ({
            slug: s.slug,
            label: s.label,
            order: i,
          })),
        },
      },
      include: { sections: { orderBy: { order: "asc" } } },
    });
  }
  return profile;
}

export const companyProfileRouter = createTRPCRouter({
  get: workspaceProcedure.query(async ({ ctx }) => {
    const profile = await ensureProfile(ctx.db, ctx.workspace.id);
    const sections = profile.sections.map((s) => ({
      id: s.id,
      slug: s.slug,
      label: s.label,
      data: s.data as Record<string, unknown>,
      completion: completionFor(s.data),
      updatedAt: s.updatedAt,
    }));
    return {
      id: profile.id,
      sections,
      fitWeights: FIT_WEIGHTS,
    };
  }),

  updateSection: workspaceProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        data: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ensureProfile(ctx.db, ctx.workspace.id);
      const section = profile.sections.find((s) => s.slug === input.slug);
      if (!section) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.companyProfileSection.update({
        where: { id: section.id },
        data: { data: input.data as object },
      });
    }),
});

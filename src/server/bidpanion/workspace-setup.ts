import { db } from "@/server/db";

export const DEFAULT_COMPANY_PROFILE_SECTIONS = [
  { slug: "services", label: "Services" },
  { slug: "industries", label: "Industries (NACE)" },
  { slug: "geography", label: "Geography (ISO)" },
  { slug: "languages", label: "Languages" },
  { slug: "delivery", label: "Delivery Models" },
  { slug: "certifications", label: "Certifications" },
  { slug: "security", label: "Security / Data Protection" },
  { slug: "capacity", label: "Capacity" },
  { slug: "commercial", label: "Commercial" },
  { slug: "references", label: "References" },
] as const;

export const FIT_WEIGHTS = [
  { slug: "services", label: "Services", weight: 25 },
  { slug: "industries", label: "Industries", weight: 20 },
  { slug: "geography", label: "Geography", weight: 15 },
  { slug: "languages", label: "Languages", weight: 15 },
  { slug: "certifications", label: "Certifications", weight: 15 },
  { slug: "capacity", label: "Capacity", weight: 10 },
] as const;

function defaultWorkspaceName(name: string, email: string) {
  const trimmed = name?.trim();
  if (trimmed) return `${trimmed.split(" ")[0]}'s Workspace`;
  const handle = email.split("@")[0] ?? "My";
  return `${handle}'s Workspace`;
}

export async function createDefaultWorkspaceForUser(
  userId: string,
  name: string,
  email: string,
) {
  const existing = await db.workspaceMember.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (existing) return;

  const workspace = await db.workspace.create({
    data: {
      name: defaultWorkspaceName(name, email),
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "ADMIN",
          status: "ACTIVE",
          lastActiveAt: new Date(),
        },
      },
      companyProfile: {
        create: {
          sections: {
            create: DEFAULT_COMPANY_PROFILE_SECTIONS.map((s, i) => ({
              slug: s.slug,
              label: s.label,
              order: i,
            })),
          },
        },
      },
    },
  });

  return workspace;
}

export async function requireWorkspaceForUser(userId: string) {
  const member = await db.workspaceMember.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    include: { workspace: true },
  });
  if (!member) {
    throw new Error("User has no active workspace membership");
  }
  return { workspace: member.workspace, member };
}

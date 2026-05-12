/**
 * Demo account seed — creates a fully populated workspace for showcasing
 * the Bidpanion app end-to-end without running the AI pipeline.
 *
 * Usage:  bun run prisma/seeds/demo.ts
 *         (or: bun run seed:demo)
 *
 * Idempotent: re-runs reset the demo workspace's tenders/profile/team to
 * the seeded state without touching other users.
 *
 * Credentials:
 *   admin: demo-admin@bidpanion.com / demo1234
 *   bid manager: demo-bidmanager@bidpanion.com / demo1234
 *   analyst: demo-analyst@bidpanion.com / demo1234
 */

import { auth } from "@/server/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    name: "Lena Hofmann",
    email: "demo-admin@bidpanion.com",
    password: "demo1234",
    role: "ADMIN" as const,
  },
  {
    name: "Markus Bauer",
    email: "demo-bidmanager@bidpanion.com",
    password: "demo1234",
    role: "BID_MANAGER" as const,
  },
  {
    name: "Sophie Kramer",
    email: "demo-analyst@bidpanion.com",
    password: "demo1234",
    role: "ANALYST" as const,
  },
];

const DEMO_WORKSPACE_NAME = "Acme Consulting GmbH";

async function ensureUser(args: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: args.email },
  });
  if (existing) return existing;
  const res = await auth.api.signUpEmail({
    body: {
      name: args.name,
      email: args.email,
      password: args.password,
    },
  });
  await prisma.user.update({
    where: { id: res.user.id },
    data: { emailVerified: true, onboarded: true },
  });
  return prisma.user.findUniqueOrThrow({ where: { id: res.user.id } });
}

const COMPANY_PROFILE_DATA: Record<string, Record<string, string[]>> = {
  services: {
    primary: [
      "IT Helpdesk & Support",
      "Cloud Infrastructure",
      "DevOps",
      "IT Consulting",
      "Cybersecurity",
    ],
    secondary: ["ERP Implementation", "Change Management", "Training"],
  },
  industries: {
    values: [
      "Public Administration (O84)",
      "IT Services (J62)",
      "Financial Services (K64)",
    ],
  },
  geography: {
    countries: ["DE", "AT", "CH"],
    regions: ["Bavaria", "Baden-Württemberg", "Vienna", "Zürich"],
  },
  languages: {
    languages: ["de", "en", "fr"],
    levels: ["de:C2", "en:B2", "fr:A2"],
  },
  delivery: { values: ["On-site", "Remote", "Hybrid", "Managed Service"] },
  certifications: {
    certs: [
      "ISO 9001",
      "Microsoft Silver Partner IT Infrastructure",
      "ITIL v4 Foundation",
    ],
    expiry: ["ISO 9001:2027-03", "Microsoft Silver:2026-06"],
  },
  security: {
    values: [
      "GDPR-compliant",
      "EU hosting",
      "ISO 27001 (in preparation)",
      "Data processing agreement",
    ],
  },
  capacity: {
    values: [
      "~50 FTE IT consulting",
      "max. 5,000 person-days / year",
      "Available FTE Q2/2026: ~15",
    ],
  },
  commercial: {
    values: ["Net 30 payment", "2% early-pay discount within 10 days", "SEPA debit"],
  },
  references: {
    values: [
      "Federal Ministry Vienna (2022–2025)",
      "Bavarian State Bank (2023–ongoing)",
      "City of Frankfurt (2021–2023)",
    ],
  },
};

async function seedCompanyProfile(workspaceId: string) {
  const profile = await prisma.companyProfile.findUniqueOrThrow({
    where: { workspaceId },
    include: { sections: true },
  });
  for (const section of profile.sections) {
    const data = COMPANY_PROFILE_DATA[section.slug];
    if (!data) continue;
    await prisma.companyProfileSection.update({
      where: { id: section.id },
      data: { data },
    });
  }
}

function daysFromNow(days: number, hours = 12): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d;
}

interface DemoTender {
  title: string;
  authority: string;
  source: "TED" | "DTVP" | "ANKO" | "SIMAP" | "VERGABE24" | "ETENDERING" | "MANUAL";
  deadline: Date | null;
  status:
    | "DRAFT"
    | "NEW"
    | "IN_REVIEW"
    | "BID"
    | "NO_BID"
    | "SUBMITTED"
    | "WON"
    | "LOST";
  processingStatus:
    | "QUEUED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "PASSWORD_PROTECTED";
  boardColumn:
    | "BACKLOG"
    | "SCREENING"
    | "GO_NO_GO"
    | "DRAFTING"
    | "REVIEW"
    | "SUBMITTED"
    | "WON"
    | "LOST";
  fitScore: number | null;
  recommendation: "BID" | "REVIEW" | "NO_BID" | null;
  value?: string;
  cpvCode?: string;
  noticeType?: string;
  country: string;
  sourceUrl?: string;
  description: string;
  watching?: boolean;
  ownerEmail: string;
  withDetails?: boolean;
}

function demoTenders(): DemoTender[] {
  return [
    {
      title: "IT System Management and Helpdesk Services 2026–2028",
      authority: "Federal Ministry for Digitalization",
      source: "DTVP",
      deadline: daysFromNow(3),
      status: "IN_REVIEW",
      processingStatus: "COMPLETED",
      boardColumn: "GO_NO_GO",
      fitScore: 81,
      recommendation: "BID",
      value: "€ 450,000 – 620,000",
      cpvCode: "72253200-5",
      noticeType: "Contract Notice",
      country: "DE",
      sourceUrl: "https://www.dtvp.de/example",
      description:
        "System management and 2nd-level helpdesk for ministry IT infrastructure across two Vienna locations.",
      watching: true,
      ownerEmail: "demo-admin@bidpanion.com",
      withDetails: true,
    },
    {
      title: "Development of E-Government Platform for Citizen Services",
      authority: "City of Vienna – Municipal Department 14",
      source: "ANKO",
      deadline: daysFromNow(7),
      status: "NEW",
      processingStatus: "COMPLETED",
      boardColumn: "SCREENING",
      fitScore: 62,
      recommendation: "REVIEW",
      value: "€ 800,000 – 1,200,000",
      cpvCode: "72413000-8",
      noticeType: "Contract Notice",
      country: "AT",
      sourceUrl: "https://www.ankoe.at/example",
      description:
        "Development, deployment and operation of a digital citizen services platform.",
      watching: true,
      ownerEmail: "demo-bidmanager@bidpanion.com",
    },
    {
      title: "Cloud Migration Infrastructure and DevSecOps Operations",
      authority: "Bavarian State Bank",
      source: "TED",
      deadline: daysFromNow(25),
      status: "BID",
      processingStatus: "COMPLETED",
      boardColumn: "DRAFTING",
      fitScore: 88,
      recommendation: "BID",
      value: "€ 1,200,000 – 2,400,000",
      cpvCode: "72000000-5",
      noticeType: "Contract Notice",
      country: "DE",
      description:
        "Migration of on-premise infrastructure to AWS cloud with full DevSecOps operations.",
      ownerEmail: "demo-admin@bidpanion.com",
    },
    {
      title:
        "Cybersecurity Audit and Penetration Testing for Critical Infrastructure",
      authority: "Federal Office for Information Security",
      source: "TED",
      deadline: daysFromNow(5),
      status: "IN_REVIEW",
      processingStatus: "COMPLETED",
      boardColumn: "SCREENING",
      fitScore: 55,
      recommendation: "REVIEW",
      value: "€ 250,000 – 380,000",
      cpvCode: "79212500-8",
      noticeType: "Competitive Dialogue",
      country: "DE",
      description:
        "Comprehensive security audit including penetration testing for critical infrastructure systems.",
      watching: true,
      ownerEmail: "demo-analyst@bidpanion.com",
    },
    {
      title: "ERP System Implementation SAP S/4HANA Public Cloud",
      authority: "Munich Municipal Services GmbH",
      source: "DTVP",
      deadline: daysFromNow(19),
      status: "IN_REVIEW",
      processingStatus: "PROCESSING",
      boardColumn: "SCREENING",
      fitScore: null,
      recommendation: null,
      value: "€ 2,000,000 – 3,500,000",
      cpvCode: "72263000-6",
      noticeType: "Contract Notice",
      country: "DE",
      description:
        "Implementation and customization of SAP S/4HANA Public Cloud including migration from SAP ECC.",
      ownerEmail: "demo-bidmanager@bidpanion.com",
    },
    {
      title: "Network Infrastructure Modernization – Highway A9",
      authority: "Federal Highway Company",
      source: "TED",
      deadline: daysFromNow(2),
      status: "NO_BID",
      processingStatus: "FAILED",
      boardColumn: "LOST",
      fitScore: 28,
      recommendation: "NO_BID",
      value: "€ 5,000,000 – 8,000,000",
      cpvCode: "32420000-3",
      noticeType: "Contract Notice",
      country: "DE",
      description:
        "Hardware delivery and installation for fiber optic/MPLS network along A9 highway.",
      ownerEmail: "demo-bidmanager@bidpanion.com",
    },
    {
      title: "Training Concept and E-Learning Platform for Federal Government",
      authority: "Federal Office of Administration",
      source: "VERGABE24",
      deadline: daysFromNow(10),
      status: "SUBMITTED",
      processingStatus: "COMPLETED",
      boardColumn: "SUBMITTED",
      fitScore: 73,
      recommendation: "BID",
      value: "€ 320,000 – 480,000",
      cpvCode: "80420000-4",
      noticeType: "Contract Notice",
      country: "DE",
      description:
        "Federal training concept and e-learning platform for civil-servant onboarding.",
      ownerEmail: "demo-bidmanager@bidpanion.com",
    },
    {
      title: "Microsoft 365 Rollout and Teams Telephony for Federal Agency",
      authority: "Federal Network Agency",
      source: "TED",
      deadline: daysFromNow(20),
      status: "WON",
      processingStatus: "COMPLETED",
      boardColumn: "WON",
      fitScore: 91,
      recommendation: "BID",
      value: "€ 1,100,000 – 1,600,000",
      cpvCode: "72320000-4",
      noticeType: "Contract Notice",
      country: "DE",
      description:
        "Microsoft 365 rollout including Teams telephony for ~3,000 federal employees.",
      ownerEmail: "demo-admin@bidpanion.com",
    },
  ];
}

interface BriefField {
  label: string;
  value: string;
  citationDoc?: string;
  citationPage?: number;
  needsReview?: boolean;
  userVerified?: boolean;
  verifiedValue?: string;
}

interface BriefSection {
  slug: string;
  title: string;
  fields: BriefField[];
}

function detailedBrief(): BriefSection[] {
  return [
    {
      slug: "overview",
      title: "Overview",
      fields: [
        {
          label: "Contracting Authority",
          value:
            "Federal Ministry for Digitalization and Economic Development",
          citationDoc: "Notice.pdf",
          citationPage: 1,
        },
        {
          label: "Procurement Type",
          value: "Open Procedure (EU Threshold)",
          citationDoc: "Notice.pdf",
          citationPage: 2,
        },
        {
          label: "Reference Number",
          value: "BMDW-2026-IT-0042",
          citationDoc: "Notice.pdf",
          citationPage: 1,
        },
        {
          label: "Brief Description",
          value:
            "Provision of IT system management including 2nd-level helpdesk and on-site support across two Vienna ministry locations.",
          citationDoc: "Service_Description.pdf",
          citationPage: 3,
          needsReview: true,
        },
      ],
    },
    {
      slug: "dates",
      title: "Deadlines",
      fields: [
        {
          label: "Submission Deadline",
          value: "26.02.2026, 12:00 PM CET",
          citationDoc: "Notice.pdf",
          citationPage: 4,
        },
        {
          label: "Question Deadline",
          value: "19.02.2026, 5:00 PM CET",
          citationDoc: "Notice.pdf",
          citationPage: 4,
        },
        {
          label: "Planned Service Start",
          value: "01.05.2026",
          citationDoc: "Service_Description.pdf",
          citationPage: 7,
          needsReview: true,
          userVerified: true,
          verifiedValue: "01.06.2026",
        },
        {
          label: "Contract Duration",
          value: "24 months + 2× 12-month options",
          citationDoc: "Service_Description.pdf",
          citationPage: 8,
        },
      ],
    },
    {
      slug: "scope",
      title: "Scope of Services",
      fields: [
        {
          label: "Main Service",
          value:
            "IT system management, 2nd-level helpdesk (SLA: P1 <4h, P2 <8h), monthly reporting",
          citationDoc: "Service_Description.pdf",
          citationPage: 10,
        },
        {
          label: "Optional Services",
          value:
            "Patch management, license management, on-demand project coordination",
          citationDoc: "Service_Description.pdf",
          citationPage: 12,
        },
        {
          label: "Estimated Workload",
          value: "~3,200 person-days over contract duration",
          citationDoc: "Service_Description.pdf",
          citationPage: 15,
        },
      ],
    },
    {
      slug: "evaluation",
      title: "Award Criteria",
      fields: [
        {
          label: "Price",
          value: "40%",
          citationDoc: "Notice.pdf",
          citationPage: 8,
        },
        {
          label: "Quality / Concept",
          value: "35%",
          citationDoc: "Notice.pdf",
          citationPage: 8,
        },
        {
          label: "References",
          value: "15%",
          citationDoc: "Notice.pdf",
          citationPage: 8,
        },
        {
          label: "Social Criteria",
          value: "10%",
          citationDoc: "Notice.pdf",
          citationPage: 8,
        },
      ],
    },
  ];
}

const FIT_CATEGORIES = [
  {
    slug: "services",
    label: "Services",
    weight: 25,
    score: 90,
    status: "MATCHED" as const,
    details:
      "IT helpdesk, system management and infrastructure management are core services.",
    matchedItems: [
      "2nd-level helpdesk",
      "IT system management",
      "Windows infrastructure",
      "ITIL-based operations",
    ],
    unmatchedItems: [],
  },
  {
    slug: "industries",
    label: "Industries / NACE",
    weight: 20,
    score: 75,
    status: "PARTIAL" as const,
    details:
      "Public administration with public references available, but no Federal Ministry-specific experience yet.",
    matchedItems: ["Public Administration (O84)", "IT Services (J62)"],
    unmatchedItems: ["Federal Ministry-specific experience"],
  },
  {
    slug: "geography",
    label: "Geography",
    weight: 15,
    score: 100,
    status: "MATCHED" as const,
    details: "Vienna location available, on-site deployment possible.",
    matchedItems: ["Vienna (AT)", "Austria nationwide"],
    unmatchedItems: [],
  },
  {
    slug: "languages",
    label: "Languages",
    weight: 15,
    score: 100,
    status: "MATCHED" as const,
    details: "German C1 and English B2 available in team.",
    matchedItems: ["German (C1)", "English (B2)"],
    unmatchedItems: [],
  },
  {
    slug: "certifications",
    label: "Certifications",
    weight: 15,
    score: 67,
    status: "PARTIAL" as const,
    details:
      "Microsoft Silver Partner available. ITIL v4 Foundation only for 1 of 2 required staff.",
    matchedItems: [
      "Microsoft Silver Partner IT Infrastructure",
      "ITIL v4 Foundation (1 staff)",
    ],
    unmatchedItems: ["ITIL v4 Foundation (2nd staff member)"],
  },
  {
    slug: "capacity",
    label: "Capacity",
    weight: 10,
    score: 60,
    status: "PARTIAL" as const,
    details:
      "3,200 person-days over 24 months. Current project utilization ~78%. Check resource availability.",
    matchedItems: ["Resources for P1/P2 SLA generally available"],
    unmatchedItems: ["Full utilization clearance still pending"],
  },
];

const CHECKLIST_ITEMS = [
  // Application Package
  { section: "Application Package", label: "Offer letter", reference: "1.1", status: "VERIFIED" as const, reviewer: true },
  { section: "Application Package", label: "Price schedule (Annex A)", reference: "1.2", status: "UPLOADED" as const, reviewer: false },
  { section: "Application Package", label: "ESPD form", reference: "1.3", status: "VERIFIED" as const, reviewer: true },
  // General Documents
  { section: "General Documents", label: "Company register extract", reference: "2.1", status: "VERIFIED" as const, reviewer: true },
  { section: "General Documents", label: "Trade license IT services", reference: "2.2", status: "VERIFIED" as const, reviewer: true },
  { section: "General Documents", label: "Tax clearance certificate", reference: "2.3", status: "MISSING" as const, reviewer: false },
  // Financial Capacity
  { section: "Financial Capacity", label: "Annual financial statements 2023", reference: "3.1", status: "UPLOADED" as const, reviewer: false },
  { section: "Financial Capacity", label: "Annual financial statements 2024", reference: "3.2", status: "UPLOADED" as const, reviewer: false },
  { section: "Financial Capacity", label: "Credit bureau report (KSV)", reference: "3.3", status: "MISSING" as const, reviewer: false },
  // Certifications
  { section: "Certifications", label: "Microsoft Partner Certificate", reference: "4.1", status: "VERIFIED" as const, reviewer: true },
  { section: "Certifications", label: "ITIL v4 Foundation (Staff 1)", reference: "4.2", status: "VERIFIED" as const, reviewer: true },
  { section: "Certifications", label: "ITIL v4 Foundation (Staff 2)", reference: "4.3", status: "MISSING" as const, reviewer: false },
  // References
  { section: "Company References", label: "Reference 1: Similar project", reference: "5.1", status: "VERIFIED" as const, reviewer: true },
  { section: "Company References", label: "Reference 2: Similar project", reference: "5.2", status: "UPLOADED" as const, reviewer: false },
  { section: "Company References", label: "Reference 3: Similar project", reference: "5.3", status: "MISSING" as const, reviewer: false },
];

interface TaskDef {
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "AI_GENERATED" | "CUSTOM";
  effort?: string;
  dueOffsetDays?: number;
  assigneeRole: "ADMIN" | "BID_MANAGER" | "ANALYST";
}

const TASKS: TaskDef[] = [
  // AI-Generated
  {
    title: "Prepare technical concept document",
    description:
      "Draft comprehensive technical concept covering infrastructure management approach, SLA compliance strategy, and tooling.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    type: "AI_GENERATED",
    effort: "16h",
    dueOffsetDays: 1,
    assigneeRole: "BID_MANAGER",
  },
  {
    title: "Estimate effort & timeline",
    description:
      "Calculate person-days per service component and produce a detailed project timeline.",
    status: "DONE",
    priority: "HIGH",
    type: "AI_GENERATED",
    effort: "8h",
    dueOffsetDays: 0,
    assigneeRole: "ANALYST",
  },
  {
    title: "Define architecture components",
    description:
      "Detail monitoring tools, ticketing system integration, and helpdesk workflow.",
    status: "TODO",
    priority: "HIGH",
    type: "AI_GENERATED",
    effort: "12h",
    dueOffsetDays: 1,
    assigneeRole: "BID_MANAGER",
  },
  {
    title: "Prepare pricing model",
    description:
      "Complete price schedule (Annex A) with base service pricing and optional service rates.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    type: "AI_GENERATED",
    effort: "6h",
    dueOffsetDays: 2,
    assigneeRole: "ADMIN",
  },
  {
    title: "Assign project team members",
    description:
      "Identify and assign project manager and 4 technical FTEs meeting qualification requirements.",
    status: "DONE",
    priority: "MEDIUM",
    type: "AI_GENERATED",
    effort: "4h",
    dueOffsetDays: 0,
    assigneeRole: "ADMIN",
  },
  {
    title: "Prepare risk mitigation plan",
    description:
      "Document identified risks and mitigation strategies for SLA compliance.",
    status: "TODO",
    priority: "MEDIUM",
    type: "AI_GENERATED",
    effort: "8h",
    dueOffsetDays: 2,
    assigneeRole: "ANALYST",
  },
  // Custom team tasks
  {
    title: "Review contract terms with legal",
    description:
      "Schedule meeting with legal to review contract draft and liability clauses.",
    status: "DONE",
    priority: "HIGH",
    type: "CUSTOM",
    dueOffsetDays: 0,
    assigneeRole: "ADMIN",
  },
  {
    title: "Coordinate reference letters",
    description: "Request reference letters from 3 existing clients matching tender requirements.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    type: "CUSTOM",
    dueOffsetDays: 2,
    assigneeRole: "ANALYST",
  },
  {
    title: "Final proposal review meeting",
    description:
      "Schedule final review with all stakeholders before submission.",
    status: "TODO",
    priority: "HIGH",
    type: "CUSTOM",
    dueOffsetDays: 3,
    assigneeRole: "ADMIN",
  },
];

interface CommentDef {
  authorRole: "ADMIN" | "BID_MANAGER" | "ANALYST";
  content: string;
  hoursAgo: number;
}

const COMMENTS: CommentDef[] = [
  {
    authorRole: "ANALYST",
    content:
      "Important: we only have ITIL v4 certification for one staff member but the tender requires 2. This is flagged in the fit score.",
    hoursAgo: 36,
  },
  {
    authorRole: "ADMIN",
    content:
      "Good catch — I've scheduled Michael for the ITIL v4 Foundation exam next week. We can include proof of registration in the submission.",
    hoursAgo: 30,
  },
  {
    authorRole: "BID_MANAGER",
    content:
      "Pricing model is challenging. The 3,200 person-day estimate vs. current capacity means we need to factor in 2 additional hires. Updated cost calc on the way.",
    hoursAgo: 14,
  },
  {
    authorRole: "ADMIN",
    content:
      "@Markus can you confirm the technical concept will be ready by EOD tomorrow? We need to finalize the submission package.",
    hoursAgo: 4,
  },
  {
    authorRole: "BID_MANAGER",
    content:
      "Yes — working on it now. Architecture diagram is done, just finalizing the SLA monitoring approach.",
    hoursAgo: 3,
  },
];

interface ActivityDef {
  type: "SYSTEM" | "COMMENT" | "STATUS_CHANGE" | "DOCUMENT" | "TASK";
  description: string;
  hoursAgo: number;
  actorRole?: "ADMIN" | "BID_MANAGER" | "ANALYST";
}

const ACTIVITY: ActivityDef[] = [
  {
    type: "SYSTEM",
    description: "Fit score updated from 78 to 81",
    hoursAgo: 5,
  },
  {
    type: "DOCUMENT",
    description: "Document processed: Annex_A_Price_Schedule.pdf",
    hoursAgo: 8,
    actorRole: "ANALYST",
  },
  {
    type: "STATUS_CHANGE",
    description: "Status changed to In Review",
    hoursAgo: 18,
    actorRole: "ADMIN",
  },
  {
    type: "TASK",
    description: "Task completed: Estimate effort & timeline",
    hoursAgo: 22,
    actorRole: "BID_MANAGER",
  },
  {
    type: "SYSTEM",
    description: "Brief generation completed",
    hoursAgo: 96,
  },
  {
    type: "SYSTEM",
    description: "Document parsing started",
    hoursAgo: 96,
  },
];

const DOCUMENTS = [
  { name: "Notice.pdf", pages: 12, sizeBytes: 824_000, isPrimary: true, status: "PROCESSED" as const },
  { name: "Service_Description.pdf", pages: 34, sizeBytes: 2_100_000, isPrimary: false, status: "PROCESSED" as const },
  { name: "Eligibility_Criteria.pdf", pages: 8, sizeBytes: 512_000, isPrimary: false, status: "PROCESSED" as const },
  { name: "Application_Requirements.pdf", pages: 6, sizeBytes: 378_000, isPrimary: false, status: "PROCESSED" as const },
  { name: "Annex_A_Price_Schedule.pdf", pages: 3, sizeBytes: 190_000, isPrimary: false, status: "PROCESSING" as const, progress: 65 },
  { name: "Draft_Contract_BMDW.pdf", pages: 18, sizeBytes: 1_300_000, isPrimary: false, status: "FAILED" as const },
];

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

async function seedTenderDetails(
  tenderId: string,
  usersByRole: Record<string, { id: string; name: string }>,
) {
  await prisma.tenderDocument.createMany({
    data: DOCUMENTS.map((d) => ({
      tenderId,
      name: d.name,
      pages: d.pages,
      sizeBytes: d.sizeBytes,
      isPrimary: d.isPrimary,
      status: d.status,
      progress: "progress" in d ? d.progress : null,
      uploadedById: usersByRole.ADMIN!.id,
    })),
  });

  for (const [i, section] of detailedBrief().entries()) {
    await prisma.briefSection.create({
      data: {
        tenderId,
        slug: section.slug,
        title: section.title,
        order: i,
        fields: {
          create: section.fields.map((f, j) => ({
            label: f.label,
            value: f.value,
            citationDoc: f.citationDoc ?? null,
            citationPage: f.citationPage ?? null,
            needsReview: f.needsReview ?? false,
            userVerified: f.userVerified ?? false,
            verifiedValue: f.verifiedValue ?? null,
            verifiedById: f.userVerified ? usersByRole.ADMIN!.id : null,
            order: j,
          })),
        },
      },
    });
  }

  await prisma.fitCategory.createMany({
    data: FIT_CATEGORIES.map((c, i) => ({
      tenderId,
      slug: c.slug,
      label: c.label,
      weight: c.weight,
      score: c.score,
      status: c.status,
      details: c.details,
      matchedItems: c.matchedItems,
      unmatchedItems: c.unmatchedItems,
      order: i,
    })),
  });

  await prisma.checklistItem.createMany({
    data: CHECKLIST_ITEMS.map((c, i) => ({
      tenderId,
      section: c.section,
      label: c.label,
      reference: c.reference,
      status: c.status,
      order: i,
      reviewerId: c.reviewer ? usersByRole.ADMIN!.id : null,
    })),
  });

  for (const t of TASKS) {
    await prisma.tenderTask.create({
      data: {
        tenderId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        type: t.type,
        effort: t.effort,
        dueDate: t.dueOffsetDays != null ? daysFromNow(t.dueOffsetDays) : null,
        assigneeId: usersByRole[t.assigneeRole]?.id ?? null,
      },
    });
  }

  for (const c of COMMENTS) {
    await prisma.tenderComment.create({
      data: {
        tenderId,
        authorId: usersByRole[c.authorRole]!.id,
        content: c.content,
        createdAt: hoursAgo(c.hoursAgo),
        updatedAt: hoursAgo(c.hoursAgo),
      },
    });
  }

  for (const a of ACTIVITY) {
    await prisma.activityEntry.create({
      data: {
        tenderId,
        type: a.type,
        description: a.description,
        actorId: a.actorRole ? usersByRole[a.actorRole]!.id : null,
        createdAt: hoursAgo(a.hoursAgo),
      },
    });
  }

  // Realistic AI summary payload, so the Brief tab can render the rich view.
  await prisma.tenderSummary.create({
    data: {
      tenderId,
      language: "EN",
      profile: "standard",
      payload: {
        "Contracting Authority":
          "Federal Ministry for Digitalization and Economic Development, Vienna",
        "Project Description":
          "IT system management and 2nd-level helpdesk services for ministry IT infrastructure across two Vienna locations. Includes monitoring, ticketing integration, and ITIL-aligned operations over a 24-month base term plus two 12-month options.",
        "Submission Deadline":
          new Date(daysFromNow(3).toISOString()).toLocaleString("en-US") +
          " CET",
        "Important Dates":
          "Question deadline: 7 days before submission. Service start: ~01.05.2026 (verified internal: 01.06.2026). Contract: 24 months + 2× 12-month options.",
        "Scope & Requirements": {
          "Scope & Requirements":
            "IT system management, 2nd-level helpdesk (SLA P1 <4h, P2 <8h), monthly reporting. Optional: patch management, license management, on-demand project coordination.",
          "Contract Volume": "Approx. 3,200 person-days over 24 months.",
          "Place of Performance":
            "Vienna city center (ministry HQ) and Vienna Liesing branch.",
          "Standards & Certifications":
            "ITIL v4, Microsoft Silver Partner IT Infrastructure, ISO 9001.",
        },
        "Supplier Eligibility": {
          "Offer Submission Documents": [
            "Offer letter",
            "Price schedule (Annex A)",
            "ESPD form",
            "Reference sheets (max. 3 pages each)",
          ],
          "Economic & Financial Standing": {
            "Minimum Turnover":
              "€ 2M p.a. with comparable IT services for the last 3 years.",
          },
          "Legal & Registration": {
            "Trade/Professional Register Entry":
              "IT services trade license or equivalent EU authorization required.",
          },
        },
        "Technical & Professional Ability": {
          "Personnel Profiles":
            "Project manager (PMP or PRINCE2 Practitioner, 5+ yrs ITSM); 4 FTE technical (MCSA/MCSE, 2× AD expertise).",
          "Headcount / Staffing":
            "Minimum 5 FTE dedicated for SLA coverage. Language: German C1 mandatory, English B2 recommended.",
          "Reference Projects":
            "3 references of similar scale (≥500 users, ≥12 months).",
        },
        "Award Criteria":
          "Best value: Price 40%, Quality/Concept 35%, References 15%, Social Criteria 10%.",
        citations: [
          { field: "Submission Deadline", locator: "Notice.pdf, p.4" },
          { field: "Award Criteria", locator: "Notice.pdf, p.8" },
          { field: "Scope & Requirements", locator: "Service_Description.pdf, p.10" },
        ],
      },
    },
  });
}

async function resetDemoWorkspace(workspaceId: string) {
  // Cascades take care of tenders/profile-sections via Prisma. We re-create everything below.
  await prisma.tender.deleteMany({ where: { workspaceId } });
  await prisma.workspaceInvitation.deleteMany({ where: { workspaceId } });
  // Keep workspace members (admin user) — re-create profile sections will be skipped via upsert.
}

async function main() {
  console.log("→ Creating demo users…");
  const users = await Promise.all(
    DEMO_USERS.map((u) =>
      ensureUser({ name: u.name, email: u.email, password: u.password }),
    ),
  );
  const [admin, bidManager, analyst] = users;
  if (!admin || !bidManager || !analyst) throw new Error("Failed to create demo users");

  // The Better-Auth user-create hook seeds a personal workspace for each user.
  // We use the admin's workspace as the demo workspace, attach the others to it.
  const adminMember = await prisma.workspaceMember.findFirstOrThrow({
    where: { userId: admin.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
  const workspaceId = adminMember.workspaceId;

  console.log(`→ Resetting demo workspace ${workspaceId}…`);
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: DEMO_WORKSPACE_NAME },
  });
  await resetDemoWorkspace(workspaceId);

  console.log("→ Attaching team members…");
  for (const [role, user] of [
    ["BID_MANAGER", bidManager],
    ["ANALYST", analyst],
  ] as const) {
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId, userId: user.id },
      },
      create: {
        workspaceId,
        userId: user.id,
        role,
        status: "ACTIVE",
        lastActiveAt: new Date(),
      },
      update: { role, status: "ACTIVE", lastActiveAt: new Date() },
    });
  }
  // A pending invite to round out the team page.
  await prisma.workspaceInvitation.create({
    data: {
      workspaceId,
      email: "demo-pending@example.com",
      role: "VIEWER",
      invitedById: admin.id,
      token: "demo-pending-token-" + Date.now().toString(36),
      expiresAt: daysFromNow(14),
    },
  });

  console.log("→ Filling company profile…");
  await seedCompanyProfile(workspaceId);

  const usersByRole = {
    ADMIN: { id: admin.id, name: admin.name },
    BID_MANAGER: { id: bidManager.id, name: bidManager.name },
    ANALYST: { id: analyst.id, name: analyst.name },
  };
  const userByEmail: Record<string, string> = {
    [admin.email]: admin.id,
    [bidManager.email]: bidManager.id,
    [analyst.email]: analyst.id,
  };

  console.log("→ Creating demo tenders…");
  for (const t of demoTenders()) {
    const ownerId = userByEmail[t.ownerEmail];
    const tender = await prisma.tender.create({
      data: {
        workspaceId,
        title: t.title,
        authority: t.authority,
        source: t.source,
        deadline: t.deadline,
        status: t.status,
        boardColumn: t.boardColumn,
        processingStatus: t.processingStatus,
        fitScore: t.fitScore,
        recommendation: t.recommendation,
        value: t.value ?? null,
        cpvCode: t.cpvCode ?? null,
        noticeType: t.noticeType ?? null,
        country: t.country,
        sourceUrl: t.sourceUrl ?? null,
        description: t.description,
        watching: t.watching ?? false,
        ownerId,
      },
    });
    if (t.withDetails) {
      await seedTenderDetails(tender.id, usersByRole);
    }
  }

  // A soft-deleted tender so the Trash view has something.
  await prisma.tender.create({
    data: {
      workspaceId,
      title: "Website Relaunch for Federal Ministry of Health",
      authority: "Federal Ministry of Health",
      source: "DTVP",
      deadline: daysFromNow(-90),
      status: "NO_BID",
      boardColumn: "LOST",
      processingStatus: "COMPLETED",
      fitScore: 31,
      recommendation: "NO_BID",
      country: "DE",
      description:
        "Website relaunch (soft-deleted to demo the Trash/Restore flow).",
      ownerId: bidManager.id,
      deletedAt: hoursAgo(24 * 5),
    },
  });

  console.log("");
  console.log("✓ Demo data ready.");
  console.log("");
  console.log("  Workspace:  " + DEMO_WORKSPACE_NAME);
  console.log("  Sign in with:");
  for (const u of DEMO_USERS) {
    console.log(`    ${u.role.padEnd(12)} ${u.email}  /  ${u.password}`);
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

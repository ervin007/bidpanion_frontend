-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'BID_MANAGER', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "WorkspaceMemberStatus" AS ENUM ('ACTIVE', 'PENDING', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('DRAFT', 'NEW', 'IN_REVIEW', 'BID', 'NO_BID', 'SUBMITTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "BoardColumn" AS ENUM ('BACKLOG', 'SCREENING', 'GO_NO_GO', 'DRAFTING', 'REVIEW', 'SUBMITTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "TenderProcessingStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'PASSWORD_PROTECTED');

-- CreateEnum
CREATE TYPE "TenderSource" AS ENUM ('TED', 'DTVP', 'ANKO', 'SIMAP', 'VERGABE24', 'ETENDERING', 'MANUAL');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('BID', 'REVIEW', 'NO_BID');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED', 'PASSWORD_PROTECTED');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('MISSING', 'UPLOADED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('COMPLIANCE', 'AI_GENERATED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SYSTEM', 'COMMENT', 'STATUS_CHANGE', 'DOCUMENT', 'TASK');

-- CreateEnum
CREATE TYPE "FitStatus" AS ENUM ('MATCHED', 'PARTIAL', 'UNMATCHED', 'NA');

-- CreateEnum
CREATE TYPE "AnalysisJobStatus" AS ENUM ('QUEUED', 'PARSING', 'CHUNKING', 'SUMMARIZING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'ANALYST',
    "status" "WorkspaceMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invitations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'ANALYST',
    "invitedById" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenders" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "source" "TenderSource" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "cpvCode" TEXT,
    "noticeType" TEXT,
    "value" TEXT,
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TenderStatus" NOT NULL DEFAULT 'NEW',
    "boardColumn" "BoardColumn",
    "processingStatus" "TenderProcessingStatus" NOT NULL DEFAULT 'QUEUED',
    "fitScore" INTEGER,
    "recommendation" "Recommendation",
    "watching" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_documents" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "pages" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "progress" INTEGER,
    "storageKey" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brief_sections" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "brief_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brief_fields" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "citationDoc" TEXT,
    "citationPage" INTEGER,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "userVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedValue" TEXT,
    "verifiedById" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "brief_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fit_categories" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "status" "FitStatus" NOT NULL,
    "details" TEXT,
    "matchedItems" TEXT[],
    "unmatchedItems" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fit_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_tasks" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "type" "TaskType" NOT NULL DEFAULT 'CUSTOM',
    "effort" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_subtasks" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "task_subtasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "reference" TEXT,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'MISSING',
    "documentId" TEXT,
    "reviewerId" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_comments" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mentions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_entries" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "actorId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_summaries" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "language" TEXT,
    "profile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_jobs" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "status" "AnalysisJobStatus" NOT NULL DEFAULT 'QUEUED',
    "language" TEXT,
    "profile" TEXT,
    "progress" INTEGER,
    "resultId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profile_sections" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profile_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspaces_ownerId_idx" ON "workspaces"("ownerId");

-- CreateIndex
CREATE INDEX "workspace_members_workspaceId_idx" ON "workspace_members"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_members_userId_idx" ON "workspace_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitations_token_key" ON "workspace_invitations"("token");

-- CreateIndex
CREATE INDEX "workspace_invitations_token_idx" ON "workspace_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitations_workspaceId_email_key" ON "workspace_invitations"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "tenders_workspaceId_deletedAt_idx" ON "tenders"("workspaceId", "deletedAt");

-- CreateIndex
CREATE INDEX "tenders_workspaceId_boardColumn_idx" ON "tenders"("workspaceId", "boardColumn");

-- CreateIndex
CREATE INDEX "tenders_ownerId_idx" ON "tenders"("ownerId");

-- CreateIndex
CREATE INDEX "tender_documents_tenderId_idx" ON "tender_documents"("tenderId");

-- CreateIndex
CREATE INDEX "brief_sections_tenderId_idx" ON "brief_sections"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "brief_sections_tenderId_slug_key" ON "brief_sections"("tenderId", "slug");

-- CreateIndex
CREATE INDEX "brief_fields_sectionId_idx" ON "brief_fields"("sectionId");

-- CreateIndex
CREATE INDEX "fit_categories_tenderId_idx" ON "fit_categories"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "fit_categories_tenderId_slug_key" ON "fit_categories"("tenderId", "slug");

-- CreateIndex
CREATE INDEX "tender_tasks_tenderId_idx" ON "tender_tasks"("tenderId");

-- CreateIndex
CREATE INDEX "tender_tasks_assigneeId_idx" ON "tender_tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "task_subtasks_taskId_idx" ON "task_subtasks"("taskId");

-- CreateIndex
CREATE INDEX "checklist_items_tenderId_idx" ON "checklist_items"("tenderId");

-- CreateIndex
CREATE INDEX "tender_comments_tenderId_idx" ON "tender_comments"("tenderId");

-- CreateIndex
CREATE INDEX "tender_comments_authorId_idx" ON "tender_comments"("authorId");

-- CreateIndex
CREATE INDEX "activity_entries_tenderId_createdAt_idx" ON "activity_entries"("tenderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tender_summaries_tenderId_key" ON "tender_summaries"("tenderId");

-- CreateIndex
CREATE INDEX "analysis_jobs_workspaceId_status_idx" ON "analysis_jobs"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "analysis_jobs_tenderId_idx" ON "analysis_jobs"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_workspaceId_key" ON "company_profiles"("workspaceId");

-- CreateIndex
CREATE INDEX "company_profile_sections_profileId_idx" ON "company_profile_sections"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "company_profile_sections_profileId_slug_key" ON "company_profile_sections"("profileId", "slug");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_documents" ADD CONSTRAINT "tender_documents_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_documents" ADD CONSTRAINT "tender_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brief_sections" ADD CONSTRAINT "brief_sections_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brief_fields" ADD CONSTRAINT "brief_fields_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "brief_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brief_fields" ADD CONSTRAINT "brief_fields_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fit_categories" ADD CONSTRAINT "fit_categories_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_tasks" ADD CONSTRAINT "tender_tasks_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_tasks" ADD CONSTRAINT "tender_tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_subtasks" ADD CONSTRAINT "task_subtasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tender_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_comments" ADD CONSTRAINT "tender_comments_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_comments" ADD CONSTRAINT "tender_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_entries" ADD CONSTRAINT "activity_entries_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_entries" ADD CONSTRAINT "activity_entries_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_summaries" ADD CONSTRAINT "tender_summaries_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profile_sections" ADD CONSTRAINT "company_profile_sections_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

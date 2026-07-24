-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Pending', 'Shortlisted', 'Accepted', 'Rejected');

-- CreateEnum
CREATE TYPE "InternshipTrack" AS ENUM ('Frontend_Development', 'Backend_Development', 'Mobile_Development', 'UI_UX_Design', 'Data_Analytics');

-- CreateTable
CREATE TABLE "administrators" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "track" "InternshipTrack" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Pending',
    "resumeUrl" TEXT,
    "coverLetter" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrators_email_key" ON "administrators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_email_key" ON "applicants"("email");

-- CreateIndex
CREATE INDEX "applicants_email_idx" ON "applicants"("email");

-- CreateIndex
CREATE INDEX "applicants_status_idx" ON "applicants"("status");

-- CreateIndex
CREATE INDEX "applicants_track_idx" ON "applicants"("track");

-- CreateIndex
CREATE INDEX "applicants_deletedAt_idx" ON "applicants"("deletedAt");

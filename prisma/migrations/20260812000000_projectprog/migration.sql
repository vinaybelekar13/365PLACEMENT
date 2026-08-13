-- ProjectProg migration
-- Replaces the old Placement365 schema (Day/Topic/Role/RoleTopic/
-- SyllabusNode/GlobalNote) with the ProjectProg challenge-based schema.
-- This is an intentional, destructive reset of all old tracker data per
-- the ProjectProg transformation spec: old Placement365 data is dropped,
-- and the new Challenge History system is introduced so every challenge
-- completed from this point forward is preserved permanently.

-- Drop old tables (in dependency order). Guarded with IF EXISTS so this
-- migration also applies cleanly to a database that never had them.
DROP TABLE IF EXISTS "Topic" CASCADE;
DROP TABLE IF EXISTS "Day" CASCADE;
DROP TABLE IF EXISTS "RoleTopic" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "SyllabusNode" CASCADE;
DROP TABLE IF EXISTS "GlobalNote" CASCADE;

-- ---------------------------------------------------------------------
-- New ProjectProg tables
-- ---------------------------------------------------------------------

CREATE TABLE "Challenge" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "ChallengeDay" (
    "id" SERIAL PRIMARY KEY,
    "dayNumber" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "note" TEXT DEFAULT '',
    "challengeId" INTEGER NOT NULL,
    CONSTRAINT "ChallengeDay_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ChallengeDay_challengeId_dayNumber_key" ON "ChallengeDay"("challengeId", "dayNumber");
CREATE INDEX "ChallengeDay_challengeId_idx" ON "ChallengeDay"("challengeId");

CREATE TABLE "Skill" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

CREATE TABLE "GeneralCategory" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "GeneralCategory_name_key" ON "GeneralCategory"("name");

CREATE TABLE "Task" (
    "id" SERIAL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT DEFAULT 'General',
    "completedAt" TIMESTAMP(3),
    "challengeDayId" INTEGER NOT NULL,
    "skillId" INTEGER,
    CONSTRAINT "Task_challengeDayId_fkey" FOREIGN KEY ("challengeDayId") REFERENCES "ChallengeDay"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Task_challengeDayId_idx" ON "Task"("challengeDayId");
CREATE INDEX "Task_skillId_idx" ON "Task"("skillId");

CREATE TABLE "Goal" (
    "id" SERIAL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "Note" (
    "id" INTEGER PRIMARY KEY DEFAULT 1,
    "content" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE "LeetCodeStats" (
    "id" INTEGER PRIMARY KEY DEFAULT 1,
    "easy" INTEGER NOT NULL DEFAULT 0,
    "medium" INTEGER NOT NULL DEFAULT 0,
    "hard" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "ChallengeHistory" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalTasks" INTEGER NOT NULL,
    "completedTasks" INTEGER NOT NULL,
    "completionPct" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ChallengeHistoryDay" (
    "id" SERIAL PRIMARY KEY,
    "dayNumber" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "challengeHistoryId" INTEGER NOT NULL,
    CONSTRAINT "ChallengeHistoryDay_challengeHistoryId_fkey" FOREIGN KEY ("challengeHistoryId") REFERENCES "ChallengeHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ChallengeHistoryDay_challengeHistoryId_idx" ON "ChallengeHistoryDay"("challengeHistoryId");

CREATE TABLE "ChallengeHistoryTask" (
    "id" SERIAL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "skillName" TEXT,
    "category" TEXT,
    "done" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "challengeHistoryDayId" INTEGER NOT NULL,
    CONSTRAINT "ChallengeHistoryTask_challengeHistoryDayId_fkey" FOREIGN KEY ("challengeHistoryDayId") REFERENCES "ChallengeHistoryDay"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ChallengeHistoryTask_challengeHistoryDayId_idx" ON "ChallengeHistoryTask"("challengeHistoryDayId");

-- Seed the default general task categories so the "General" dropdown is
-- never empty on a fresh install (also created defensively by the seed
-- script — safe/idempotent either way).
INSERT INTO "GeneralCategory" ("name", "order") VALUES
    ('General', 0),
    ('Personal', 1),
    ('College', 2),
    ('Health', 3),
    ('Finance', 4),
    ('Errands', 5)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Note" ("id", "content") VALUES (1, '') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "LeetCodeStats" ("id", "easy", "medium", "hard") VALUES (1, 0, 0, 0) ON CONFLICT ("id") DO NOTHING;

-- My Diary migration
-- Purely additive: creates two new tables (MistakeDiaryEntry, DiaryEntry).
-- Does not touch, alter, or drop any existing table — all existing
-- Challenge/Task/Skill/Goal/Note/LeetCodeStats/ChallengeHistory data and
-- functionality is left completely intact.

CREATE TABLE "MistakeDiaryEntry" (
    "id" SERIAL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "MistakeDiaryEntry_updatedAt_idx" ON "MistakeDiaryEntry"("updatedAt");

CREATE TABLE "DiaryEntry" (
    "id" SERIAL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "title" TEXT,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "DiaryEntry_updatedAt_idx" ON "DiaryEntry"("updatedAt");

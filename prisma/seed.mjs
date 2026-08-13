import { prisma } from "../src/lib/prisma.js";

// ---------------------------------------------------------------------
// ProjectProg seed.
//
// This intentionally does NOT create any Challenge, Skill, or Goal —
// the fresh app starts completely empty and the user creates their own
// first challenge and skills from the UI. It only guarantees the two
// singleton rows (Note, LeetCodeStats) and the default general-task
// categories exist, so those cards never crash on a first load.
//
// Deterministic and idempotent: running it once or a hundred times
// against the same database produces the same end state, and it never
// touches an already-completed ChallengeHistory or an in-progress
// Challenge if one already exists (it only fills in the singletons).
// ---------------------------------------------------------------------

const DEFAULT_CATEGORIES = ["General", "Personal", "College", "Health", "Finance", "Errands"];

async function main() {
  await prisma.note.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, content: "" },
  });

  await prisma.leetCodeStats.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, easy: 0, medium: 0, hard: 0 },
  });

  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    await prisma.generalCategory.upsert({
      where: { name: DEFAULT_CATEGORIES[i] },
      update: {},
      create: { name: DEFAULT_CATEGORIES[i], order: i },
    });
  }

  console.log("ProjectProg seed complete: Note, LeetCodeStats, and default categories are ready.");
  console.log("No Challenge, Skill, or Goal rows were created — the dashboard starts empty.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

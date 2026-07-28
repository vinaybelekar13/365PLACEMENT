import { prisma } from "../src/lib/prisma.js";

const START_DATE = new Date();
const TOTAL_DAYS = 365;

async function main() {
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = new Date(START_DATE);
    date.setDate(START_DATE.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    console.log(`Seeding day ${i + 1}`);

    await prisma.day.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        id: i + 1,
        date: dateStr,
        note: "",
      },
    });
  }

  console.log("✅ Seeded 365 days");
}

main()
  .catch((e) => {
    console.error("SEED ERROR:");
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
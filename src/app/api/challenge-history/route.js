import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// List view only (name, dates, duration, completion stats) — no nested
// days/tasks here, so this stays fast even with a lot of archived
// challenges. Full activity for one entry is fetched from
// /api/challenge-history/[id] on demand ("View History").
export async function GET() {
  try {
    const history = await prisma.challengeHistory.findMany({
      orderBy: { archivedAt: 'desc' },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error('GET /api/challenge-history failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

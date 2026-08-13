import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

const FIELDS = ['easy', 'medium', 'hard'];

export async function GET() {
  try {
    const stats = await prisma.leetCodeStats.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, easy: 0, medium: 0, hard: 0 },
    });
    return NextResponse.json(stats);
  } catch (err) {
    console.error('GET /api/leetcode failed:', err);
    return NextResponse.json({ error: 'Failed to fetch LeetCode stats', detail: err.message }, { status: 500 });
  }
}

// Body: { field: 'easy' | 'medium' | 'hard', delta: 1 | -1 }
// Clamped server-side too, so a stale client can never push a field negative.
export async function PATCH(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { field, delta } = await req.json();
    if (!FIELDS.includes(field) || ![1, -1].includes(delta)) {
      return NextResponse.json({ error: 'Invalid field or delta' }, { status: 400 });
    }

    const current = await prisma.leetCodeStats.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, easy: 0, medium: 0, hard: 0 },
    });

    const nextValue = Math.max(0, current[field] + delta);
    const updated = await prisma.leetCodeStats.update({
      where: { id: 1 },
      data: { [field]: nextValue },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/leetcode failed:', err);
    return NextResponse.json({ error: 'Failed to update LeetCode stats', detail: err.message }, { status: 500 });
  }
}

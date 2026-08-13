import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

// Body: { taskIds: [id, id, id, ...] } — the full, final order for one
// day's tasks. Rewrites `order` to each id's index in the array. Used by
// both drag-and-drop and move up/down controls (the client computes the
// new array either way; this endpoint just persists it).
export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { taskIds } = await req.json();
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'taskIds must be a non-empty array.' }, { status: 400 });
    }

    await prisma.$transaction(
      taskIds.map((id, index) =>
        prisma.task.update({ where: { id }, data: { order: index } })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/tasks/reorder failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

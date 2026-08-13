import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

// Body may include any of: text, done, type, skillId, category, order.
// Keeps the skill/general split consistent server-side: switching a task
// to 'general' clears skillId, switching to 'skill' clears category.
export async function PATCH(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const data = {};

    if (typeof body.text === 'string') data.text = body.text;
    if (typeof body.order === 'number') data.order = body.order;

    if (typeof body.done === 'boolean') {
      data.done = body.done;
      data.completedAt = body.done ? new Date() : null;
    }

    if (body.type === 'skill') {
      data.type = 'skill';
      data.skillId = body.skillId ?? undefined;
      data.category = null;
    } else if (body.type === 'general') {
      data.type = 'general';
      data.skillId = null;
      data.category = body.category || 'General';
    } else {
      if ('skillId' in body) data.skillId = body.skillId;
      if ('category' in body) data.category = body.category;
    }

    const task = await prisma.task.update({
      where: { id: Number(id) },
      data,
      include: { skill: true },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error('PATCH /api/tasks/[id] failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.task.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

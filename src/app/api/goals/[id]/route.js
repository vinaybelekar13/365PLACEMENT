import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function PATCH(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const data = {};
  if (typeof body.text === 'string') data.text = body.text;
  if (typeof body.done === 'boolean') data.done = body.done;
  if (typeof body.order === 'number') data.order = body.order;
  const goal = await prisma.goal.update({ where: { id: Number(id) }, data });
  return NextResponse.json(goal);
}

export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.goal.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

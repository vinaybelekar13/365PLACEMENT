import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function PATCH(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const data = {};
    if (typeof body.date === 'string') data.date = body.date;
    if ('title' in body) data.title = body.title?.trim() || null;
    if ('category' in body) data.category = body.category?.trim() || null;
    if (typeof body.content === 'string') data.content = body.content;

    const entry = await prisma.diaryEntry.update({ where: { id: Number(id) }, data });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('PATCH /api/diary/entries/[id] failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.diaryEntry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

// Editing any field bumps `updatedAt` automatically (Prisma @updatedAt),
// which is exactly what moves the entry back to the top of the list.
export async function PATCH(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const data = {};
    if (typeof body.date === 'string') data.date = body.date;
    if (typeof body.module === 'string') data.module = body.module.trim();
    if (typeof body.content === 'string') data.content = body.content;

    const entry = await prisma.mistakeDiaryEntry.update({ where: { id: Number(id) }, data });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('PATCH /api/diary/mistakes/[id] failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.mistakeDiaryEntry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

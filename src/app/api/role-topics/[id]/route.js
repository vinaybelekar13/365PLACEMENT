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
    const topic = await prisma.roleTopic.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(topic);
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Topic not found (already deleted?)' }, { status: 404 });
    }
    console.error('PATCH /api/role-topics/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to update topic', detail: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.roleTopic.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') {
      // Already deleted (e.g. duplicate request) — treat as success, not an error.
      return NextResponse.json({ ok: true });
    }
    console.error('DELETE /api/role-topics/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to delete topic', detail: err.message }, { status: 500 });
  }
}
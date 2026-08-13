import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function PATCH(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }
    const skill = await prisma.skill.update({ where: { id: Number(id) }, data: { name: name.trim() } });
    return NextResponse.json(skill);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A skill with that name already exists.' }, { status: 409 });
    }
    console.error('PATCH /api/skills/[id] failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Deleting a skill never deletes the tasks that used it — Task.skillId
// is onDelete: SetNull, so those tasks simply become unassigned (still
// visible on their day, just no longer counted toward any skill).
export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.skill.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

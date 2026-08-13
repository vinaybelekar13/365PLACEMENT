import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { skillIds } = await req.json();
    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json({ error: 'skillIds must be a non-empty array.' }, { status: 400 });
    }
    await prisma.$transaction(
      skillIds.map((id, index) => prisma.skill.update({ where: { id }, data: { order: index } }))
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/skills/reorder failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

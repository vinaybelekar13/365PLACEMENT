import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(skills);
  } catch (error) {
    console.error('GET /api/skills failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }
    const count = await prisma.skill.count();
    const skill = await prisma.skill.create({ data: { name: name.trim(), order: count } });
    return NextResponse.json(skill);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A skill with that name already exists.' }, { status: 409 });
    }
    console.error('POST /api/skills failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

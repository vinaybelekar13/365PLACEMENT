import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(goals);
  } catch (error) {
    console.error('GET /api/goals failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required.' }, { status: 400 });
    }
    const count = await prisma.goal.count();
    const goal = await prisma.goal.create({ data: { text: text.trim(), order: count } });
    return NextResponse.json(goal);
  } catch (error) {
    console.error('POST /api/goals failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

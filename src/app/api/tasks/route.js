import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

// Body: { challengeDayId, text, type: 'skill'|'general', skillId?, category? }
// A 'skill' task must carry a skillId (it contributes to that skill's
// progress). A 'general' task carries a free-form category and never
// contributes to any skill's progress — this distinction is enforced
// here, not just in the UI.
export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { challengeDayId, text, type, skillId, category } = await req.json();
    if (!challengeDayId || !text?.trim()) {
      return NextResponse.json({ error: 'challengeDayId and text are required.' }, { status: 400 });
    }
    const isSkill = type === 'skill';
    if (isSkill && !skillId) {
      return NextResponse.json({ error: 'A skill task must specify skillId.' }, { status: 400 });
    }

    const count = await prisma.task.count({ where: { challengeDayId } });

    const task = await prisma.task.create({
      data: {
        challengeDayId,
        text: text.trim(),
        type: isSkill ? 'skill' : 'general',
        skillId: isSkill ? skillId : null,
        category: isSkill ? null : (category || 'General'),
        order: count,
      },
      include: { skill: true },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('POST /api/tasks failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

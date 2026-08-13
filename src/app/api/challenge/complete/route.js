import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { toLocalDateStr } from '@/lib/date';

// Archives the active Challenge into ChallengeHistory: every day, every
// task, every date, every completion state is copied over (denormalized
// — skill name and category are captured as plain text so the history
// stays correct forever even if the Skill is later renamed or deleted).
// The live Challenge (and its days/tasks) is then deleted, which is what
// "removes it from the active challenge area" and clears room for a new
// one. A completed challenge is therefore never lost — it moves, it
// never disappears.
export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const challenge = await prisma.challenge.findFirst({
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: { tasks: { orderBy: { order: 'asc' }, include: { skill: true } } },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'No active challenge to complete.' }, { status: 404 });
    }

    let totalTasks = 0;
    let completedTasks = 0;
    for (const day of challenge.days) {
      totalTasks += day.tasks.length;
      completedTasks += day.tasks.filter(t => t.done).length;
    }
    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const lastDay = challenge.days[challenge.days.length - 1];
    const endDate = lastDay ? lastDay.date : toLocalDateStr();

    const history = await prisma.challengeHistory.create({
      data: {
        name: challenge.name,
        startDate: challenge.startDate,
        endDate,
        duration: challenge.duration,
        totalTasks,
        completedTasks,
        completionPct,
        days: {
          create: challenge.days.map(day => ({
            dayNumber: day.dayNumber,
            date: day.date,
            tasks: {
              create: day.tasks.map(task => ({
                text: task.text,
                type: task.type,
                skillName: task.skill?.name ?? null,
                category: task.type === 'general' ? task.category : null,
                done: task.done,
                completedAt: task.completedAt,
                order: task.order,
              })),
            },
          })),
        },
      },
      include: { days: { include: { tasks: true } } },
    });

    // Cascades to ChallengeDay and Task rows.
    await prisma.challenge.delete({ where: { id: challenge.id } });

    return NextResponse.json(history);
  } catch (error) {
    console.error('POST /api/challenge/complete failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { addDaysToDateStr } from '@/lib/date';

const dayInclude = {
  days: {
    orderBy: { dayNumber: 'asc' },
    include: { tasks: { orderBy: { order: 'asc' }, include: { skill: true } } },
  },
};

// There is at most ONE Challenge row at a time — it always represents
// the current active challenge. Completing it (see /api/challenge/complete)
// archives it into ChallengeHistory and deletes this row, which is what
// makes room for the next one.
export async function GET() {
  try {
    const challenge = await prisma.challenge.findFirst({ include: dayInclude });
    return NextResponse.json(challenge);
  } catch (error) {
    console.error('GET /api/challenge failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const existing = await prisma.challenge.findFirst();
    if (existing) {
      return NextResponse.json(
        { error: 'A challenge is already active. Complete it (or extend it) before starting a new one.' },
        { status: 409 }
      );
    }

    const { name, startDate, duration } = await req.json();
    if (!name?.trim() || !startDate || !Number.isFinite(duration) || duration < 1) {
      return NextResponse.json({ error: 'name, startDate, and a duration of at least 1 are required.' }, { status: 400 });
    }

    const days = Array.from({ length: duration }, (_, i) => ({
      dayNumber: i + 1,
      date: addDaysToDateStr(startDate, i),
    }));

    const challenge = await prisma.challenge.create({
      data: {
        name: name.trim(),
        startDate,
        duration,
        days: { create: days },
      },
      include: dayInclude,
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('POST /api/challenge failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Body: { name? } and/or { duration? } — renames the active challenge
// and/or extends/reduces its length. Existing days/tasks are always
// preserved: extending appends new (empty) ChallengeDay rows; reducing
// is only allowed down to the highest day number that still has tasks,
// so no logged work is ever silently destroyed.
export async function PATCH(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const challenge = await prisma.challenge.findFirst({ include: dayInclude });
    if (!challenge) {
      return NextResponse.json({ error: 'No active challenge.' }, { status: 404 });
    }

    const body = await req.json();
    const data = {};

    if (typeof body.name === 'string' && body.name.trim()) {
      data.name = body.name.trim();
    }

    if (Number.isFinite(body.duration)) {
      const newDuration = Math.trunc(body.duration);
      if (newDuration < 1) {
        return NextResponse.json({ error: 'Duration must be at least 1 day.' }, { status: 400 });
      }

      if (newDuration > challenge.duration) {
        const newDays = [];
        for (let n = challenge.duration + 1; n <= newDuration; n++) {
          newDays.push({
            challengeId: challenge.id,
            dayNumber: n,
            date: addDaysToDateStr(challenge.startDate, n - 1),
          });
        }
        if (newDays.length) await prisma.challengeDay.createMany({ data: newDays });
      } else if (newDuration < challenge.duration) {
        const trimmedDays = challenge.days.filter(d => d.dayNumber > newDuration);
        const hasWork = trimmedDays.some(d => d.tasks.length > 0);
        if (hasWork) {
          return NextResponse.json(
            { error: `Can't shorten below day ${Math.max(...trimmedDays.filter(d => d.tasks.length > 0).map(d => d.dayNumber))} — it already has tasks. Delete that work first if you really want to shorten further.` },
            { status: 400 }
          );
        }
        const idsToRemove = trimmedDays.map(d => d.id);
        if (idsToRemove.length) await prisma.challengeDay.deleteMany({ where: { id: { in: idsToRemove } } });
      }

      data.duration = newDuration;
    }

    const updated = await prisma.challenge.update({
      where: { id: challenge.id },
      data,
      include: dayInclude,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/challenge failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

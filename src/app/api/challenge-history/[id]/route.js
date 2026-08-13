import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const history = await prisma.challengeHistory.findUnique({
      where: { id: Number(id) },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: { tasks: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!history) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(history);
  } catch (error) {
    console.error('GET /api/challenge-history/[id] failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

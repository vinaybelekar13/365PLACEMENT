import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const entries = await prisma.diaryEntry.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET /api/diary/entries failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { date, title, category, content } = await req.json();
    if (!date || !content?.trim()) {
      return NextResponse.json({ error: 'date and content are required.' }, { status: 400 });
    }
    const entry = await prisma.diaryEntry.create({
      data: {
        date,
        title: title?.trim() || null,
        category: category?.trim() || null,
        content: content.trim(),
      },
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('POST /api/diary/entries failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

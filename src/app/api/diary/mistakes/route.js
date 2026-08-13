import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

// List is sorted most-recently-edited-first, same convention the rest of
// the app uses for "recent" lists (e.g. Challenge History).
export async function GET() {
  try {
    const entries = await prisma.mistakeDiaryEntry.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET /api/diary/mistakes failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { date, module, content } = await req.json();
    if (!date || !module?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'date, module, and content are required.' }, { status: 400 });
    }
    const entry = await prisma.mistakeDiaryEntry.create({
      data: { date, module: module.trim(), content: content.trim() },
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('POST /api/diary/mistakes failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

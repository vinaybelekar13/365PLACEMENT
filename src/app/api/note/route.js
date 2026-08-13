import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

// Single permanent notes panel — always the row with id 1. Upsert-on-read
// keeps a fresh database (or one that skipped the seed step) working
// without an extra migration-only insert.

export async function GET() {
  try {
    const note = await prisma.note.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, content: '' },
    });
    return NextResponse.json(note);
  } catch (err) {
    console.error('GET /api/note failed:', err);
    return NextResponse.json({ error: 'Failed to fetch note', detail: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { content } = await req.json();
    const note = await prisma.note.upsert({
      where: { id: 1 },
      update: { content: content ?? '' },
      create: { id: 1, content: content ?? '' },
    });
    return NextResponse.json(note);
  } catch (err) {
    console.error('PUT /api/note failed:', err);
    return NextResponse.json({ error: 'Failed to save note', detail: err.message }, { status: 500 });
  }
}

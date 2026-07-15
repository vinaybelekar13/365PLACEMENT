// D:\roadtooffer\src\app\api\roles\route.js

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
      include: { topics: { orderBy: { id: 'asc' } } },
    });
    return NextResponse.json(roles);
  } catch (err) {
    console.error('GET /api/roles failed:', err);
    return NextResponse.json({ error: 'Failed to fetch roles', detail: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }
    const role = await prisma.role.create({
      data: { name: name.trim() },
      include: { topics: true },
    });
    return NextResponse.json(role);
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A role with that name already exists' }, { status: 409 });
    }
    console.error('POST /api/roles failed:', err);
    return NextResponse.json({ error: 'Failed to create role', detail: err.message }, { status: 500 });
  }
}
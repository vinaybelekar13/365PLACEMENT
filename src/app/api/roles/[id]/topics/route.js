// D:\roadtooffer\src\app\api\roles\[id]\topics\route.js


import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const { text } = await req.json();
  const topic = await prisma.roleTopic.create({
    data: { text, roleId: Number(id) },
  });
  return NextResponse.json(topic);
}
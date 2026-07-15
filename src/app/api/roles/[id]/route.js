// D:\roadtooffer\src\app\api\roles\[id]\route.js


import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.role.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

// Deleting a category never deletes the tasks that used it — their
// `category` string just stays as-is (it's a plain text field, not a
// foreign key), so nothing breaks for tasks already tagged with it.
export async function DELETE(req, { params }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.generalCategory.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

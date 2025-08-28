export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.$queryRaw`select 1`;
    const url = process.env.DATABASE_URL ?? '';
    const host = url.split('@')[1]?.split('/')[0];
    return NextResponse.json({ ok: true, host });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}

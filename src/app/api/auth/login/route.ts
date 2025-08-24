export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

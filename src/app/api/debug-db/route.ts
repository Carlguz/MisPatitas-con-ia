import { NextResponse } from "next/server";

function safe(u?: string | null) {
  try {
    if (!u) return null;
    const url = new URL(u);
    return {
      protocol: url.protocol.replace(/:.*/, ""),
      host: url.hostname,              // aquí veremos si tiene ".pooler."
      port: url.port || null,          // 6543 o 5432
      hasPooler: url.hostname.includes(".pooler."),
      hasPgBouncer: u.includes("pgbouncer=true"),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const DB = safe(process.env.DATABASE_URL || null);
  const DIRECT = safe(process.env.DIRECT_URL || null);

  return NextResponse.json({
    DATABASE_URL: DB,
    DIRECT_URL: DIRECT,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET: Obtener enlaces sociales (público o para el paseador)
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const walkerIdQuery = searchParams.get("walkerId");

  try {
    let where: any = {};

    if (walkerIdQuery) {
      where.walkerId = walkerIdQuery;
    } else {
      // Si no hay walkerId, es para el panel del paseador
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized: Session required" }, { status: 401 });
      }
      const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true }});
      if (user?.role !== UserRole.WALKER) {
         return NextResponse.json({ error: "Forbidden: Not a Walker" }, { status: 403 });
      }
      const walker = await db.walker.findFirst({ where: { userId: session.user.id } });
      if (!walker) {
        return NextResponse.json({ error: "Walker profile not found" }, { status: 404 });
      }
      where.walkerId = walker.id;
    }

    const socialLinks = await db.socialLink.findMany({
      where,
      orderBy: { platform: "asc" },
    });

    return NextResponse.json({ socialLinks });
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Crear un nuevo enlace social (Protegido)
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true }});
    if (user?.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Forbidden: Not a Walker" }, { status: 403 });
    }

    const walker = await db.walker.findFirst({ where: { userId: session.user.id } });
    if (!walker) {
      return NextResponse.json({ error: "Walker profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { platform, url } = body;

    if (!platform || !url) {
      return NextResponse.json({ error: "Platform and URL are required" }, { status: 400 });
    }
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const existingLink = await db.socialLink.findFirst({
      where: { walkerId: walker.id, platform: platform.toLowerCase() },
    });

    if (existingLink) {
      return NextResponse.json({ error: "Link for this platform already exists" }, { status: 409 });
    }

    const socialLink = await db.socialLink.create({
      data: {
        walkerId: walker.id,
        platform: platform.toLowerCase(),
        url,
      },
    });

    return NextResponse.json(socialLink, { status: 201 });
  } catch (error) {
    console.error("Error creating social link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

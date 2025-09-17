import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET: Obtener horarios (para paseador o público)
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const walkerIdQuery = searchParams.get("walkerId");

  try {
    let where: any = {};

    if (walkerIdQuery) {
      where.walkerId = walkerIdQuery;
    } else {
      // Si no hay walkerId, asumimos que es para el panel del paseador
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

    const schedules = await db.schedule.findMany({
      where,
      include: {
        walker: { select: { id: true, name: true, user: { select: { name: true, email: true } } } },
      },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Crear un nuevo horario (Protegido)
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
    const { dayOfWeek, startTime, endTime } = body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Day, start, and end time are required" }, { status: 400 });
    }
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ error: "Day must be between 0 (Sun) and 6 (Sat)" }, { status: 400 });
    }
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ error: "Time must be in HH:mm format" }, { status: 400 });
    }
    if (startTime >= endTime) {
      return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
    }

    const existingSchedule = await db.schedule.findFirst({
      where: {
        walkerId: walker.id,
        dayOfWeek,
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } }, // Overlaps
        ],
      },
    });

    if (existingSchedule) {
      return NextResponse.json({ error: "Schedule overlaps with an existing one" }, { status: 409 });
    }

    const schedule = await db.schedule.create({
      data: { walkerId: walker.id, dayOfWeek, startTime, endTime },
      include: { walker: { select: { id: true, name: true } } },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

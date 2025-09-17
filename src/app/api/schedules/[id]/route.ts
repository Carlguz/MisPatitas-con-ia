import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

const getWalkerAndSchedule = async (session: any, scheduleId: string) => {
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true }});
  if (user?.role !== UserRole.WALKER) {
    return { error: new NextResponse(JSON.stringify({ error: "Forbidden: Not a Walker" }), { status: 403 }) };
  }

  const schedule = await db.schedule.findFirst({
    where: { id: scheduleId, walker: { userId: session.user.id } },
  });

  if (!schedule) {
    return { error: new NextResponse(JSON.stringify({ error: "Schedule not found or access denied" }), { status: 404 }) };
  }

  return { schedule };
}

// GET: Obtener un horario específico (Protegido)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error, schedule } = await getWalkerAndSchedule(session, params.id);
    if (error) return error;

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Actualizar un horario (Protegido)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await getWalkerAndSchedule(session, params.id);
    if (error) return error;

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, isActive } = body;

    // Validations
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      return NextResponse.json({ error: "Start time must be in HH:mm format" }, { status: 400 });
    }
    if (endTime && !timeRegex.test(endTime)) {
      return NextResponse.json({ error: "End time must be in HH:mm format" }, { status: 400 });
    }

    const finalStartTime = startTime || (await db.schedule.findUnique({where: {id: params.id}}))?.startTime;
    const finalEndTime = endTime || (await db.schedule.findUnique({where: {id: params.id}}))?.endTime;
    if (finalStartTime && finalEndTime && finalStartTime >= finalEndTime) {
        return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
    }

    const updateData: any = {};
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSchedule = await db.schedule.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Eliminar un horario (Protegido)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await getWalkerAndSchedule(session, params.id);
    if (error) return error;

    await db.schedule.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const schedule = await db.schedule.findUnique({
      where: { id: params.id },
      include: {
        walker: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ schedule })

  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime, isActive } = body

    // Verificar que el horario exista y pertenezca al paseador
    const existingSchedule = await db.schedule.findFirst({
      where: {
        id: params.id,
        walker: {
          userId: session.user.id
        }
      }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found or access denied" },
        { status: 404 }
      )
    }

    // Validaciones
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return NextResponse.json(
        { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      )
    }

    // Validar formato de hora (HH:mm)
    if (startTime || endTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (startTime && !timeRegex.test(startTime)) {
        return NextResponse.json(
          { error: "Start time must be in HH:mm format" },
          { status: 400 }
        )
      }
      if (endTime && !timeRegex.test(endTime)) {
        return NextResponse.json(
          { error: "End time must be in HH:mm format" },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (isActive !== undefined) updateData.isActive = isActive

    const schedule = await db.schedule.update({
      where: { id: params.id },
      data: updateData,
      include: {
        walker: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: "Schedule updated successfully",
      schedule
    })

  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que el horario exista y pertenezca al paseador
    const existingSchedule = await db.schedule.findFirst({
      where: {
        id: params.id,
        walker: {
          userId: session.user.id
        }
      }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found or access denied" },
        { status: 404 }
      )
    }

    await db.schedule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: "Schedule deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const walkerId = searchParams.get("walkerId")

    let where: any = {}
    
    // Si no se especifica walkerId, obtener los horarios del paseador actual
    if (!walkerId) {
      if (session.user.role === UserRole.WALKER) {
        const walker = await db.walker.findFirst({
          where: { userId: session.user.id }
        })
        if (walker) {
          where.walkerId = walker.id
        }
      } else {
        return NextResponse.json({ error: "Walker ID required" }, { status: 400 })
      }
    } else {
      where.walkerId = walkerId
    }

    const schedules = await db.schedule.findMany({
      where,
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
      },
      orderBy: {
        dayOfWeek: "asc"
      }
    })

    return NextResponse.json({ schedules })

  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime } = body

    // Validaciones
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Day of week, start time, and end time are required" },
        { status: 400 }
      )
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" },
        { status: 400 }
      )
    }

    // Validar formato de hora (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Time must be in HH:mm format" },
        { status: 400 }
      )
    }

    // Verificar que el paseador tenga un perfil
    const walker = await db.walker.findFirst({
      where: { userId: session.user.id }
    })

    if (!walker) {
      return NextResponse.json(
        { error: "Walker profile not found" },
        { status: 403 }
      )
    }

    // Verificar que no exista un horario solapado
    const existingSchedule = await db.schedule.findFirst({
      where: {
        walkerId: walker.id,
        dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Schedule overlaps with existing schedule" },
        { status: 400 }
      )
    }

    const schedule = await db.schedule.create({
      data: {
        walkerId: walker.id,
        dayOfWeek,
        startTime,
        endTime
      },
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
      message: "Schedule created successfully",
      schedule
    })

  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
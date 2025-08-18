import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, ServiceStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const walkerId = searchParams.get("walkerId")

    const skip = (page - 1) * limit

    const where: any = {}

    // Filtrar según el rol del usuario
    if (session.user.role === UserRole.CUSTOMER) {
      const customer = await db.customer.findUnique({
        where: { userId: session.user.id }
      })
      if (!customer) {
        return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
      }
      where.customerId = customer.id
    } else if (session.user.role === UserRole.WALKER) {
      const walker = await db.walker.findUnique({
        where: { userId: session.user.id }
      })
      if (!walker) {
        return NextResponse.json({ error: "Walker profile not found" }, { status: 404 })
      }
      where.walkerId = walker.id
    }

    if (status) {
      where.status = status
    }

    if (walkerId) {
      where.walkerId = walkerId
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        customer: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        walker: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        service: {
          include: {
            walker: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        order: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        date: "asc"
      }
    })

    const total = await db.booking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.CUSTOMER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, date, startTime, endTime, notes } = body

    if (!serviceId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar que el cliente existe
    const customer = await db.customer.findUnique({
      where: { userId: session.user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    // Verificar que el servicio existe y está disponible
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: {
        walker: true
      }
    })

    if (!service || !service.isActive || service.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Service not found or unavailable" }, { status: 404 })
    }

    // Verificar disponibilidad del paseador
    const bookingDate = new Date(date)
    const dayOfWeek = bookingDate.getDay()

    // Verificar que el paseador trabaja ese día
    const schedule = await db.schedule.findFirst({
      where: {
        walkerId: service.walkerId,
        dayOfWeek,
        isActive: true,
        startTime: { lte: startTime },
        endTime: { gte: endTime }
      }
    })

    if (!schedule) {
      return NextResponse.json({ error: "Walker not available at this time" }, { status: 400 })
    }

    // Verificar que no haya otra reserva en el mismo horario
    const existingBooking = await db.booking.findFirst({
      where: {
        walkerId: service.walkerId,
        date: bookingDate,
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
        ],
        status: {
          in: [ServiceStatus.BOOKED, ServiceStatus.IN_PROGRESS]
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json({ error: "Time slot already booked" }, { status: 400 })
    }

    // Calcular el precio total
    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(`${date}T${endTime}`)
    const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)
    const totalPrice = service.price * durationHours

    // Crear la reserva
    const booking = await db.booking.create({
      data: {
        serviceId,
        customerId: customer.id,
        walkerId: service.walkerId,
        date: bookingDate,
        startTime,
        endTime,
        totalPrice,
        notes,
        status: ServiceStatus.BOOKED
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        walker: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        service: true
      }
    })

    // Marcar el servicio como reservado temporalmente
    await db.service.update({
      where: { id: serviceId },
      data: { status: ServiceStatus.BOOKED }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
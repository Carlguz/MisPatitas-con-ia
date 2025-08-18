import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, ServiceStatus } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
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
            },
            schedules: true
          }
        },
        service: true,
        order: {
          include: {
            payments: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verificar permisos
    const hasAccess = 
      session.user.role === UserRole.ADMIN ||
      (session.user.role === UserRole.CUSTOMER && booking.customer.userId === session.user.id) ||
      (session.user.role === UserRole.WALKER && booking.walker.userId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes } = body

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        walker: {
          include: {
            user: true
          }
        },
        service: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verificar permisos y validar cambios
    const updateData: any = {}

    if (status) {
      // Validar transiciones de estado
      const validTransitions: Record<ServiceStatus, ServiceStatus[]> = {
        [ServiceStatus.AVAILABLE]: [],
        [ServiceStatus.BOOKED]: [ServiceStatus.IN_PROGRESS, ServiceStatus.CANCELLED],
        [ServiceStatus.IN_PROGRESS]: [ServiceStatus.COMPLETED, ServiceStatus.CANCELLED],
        [ServiceStatus.COMPLETED]: [],
        [ServiceStatus.CANCELLED]: []
      }

      if (!validTransitions[booking.status].includes(status)) {
        return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
      }

      // Verificar permisos según el estado
      if (status === ServiceStatus.CANCELLED) {
        // Cliente, paseador o admin pueden cancelar
        const canCancel = 
          session.user.role === UserRole.ADMIN ||
          (session.user.role === UserRole.CUSTOMER && booking.customer.userId === session.user.id) ||
          (session.user.role === UserRole.WALKER && booking.walker.userId === session.user.id)

        if (!canCancel) {
          return NextResponse.json({ error: "Cannot cancel this booking" }, { status: 403 })
        }
      } else if (status === ServiceStatus.IN_PROGRESS) {
        // Solo el paseador puede iniciar el servicio
        if (session.user.role !== UserRole.WALKER || booking.walker.userId !== session.user.id) {
          return NextResponse.json({ error: "Cannot start this booking" }, { status: 403 })
        }
      } else if (status === ServiceStatus.COMPLETED) {
        // Solo el paseador puede completar el servicio
        if (session.user.role !== UserRole.WALKER || booking.walker.userId !== session.user.id) {
          return NextResponse.json({ error: "Cannot complete this booking" }, { status: 403 })
        }
      }

      updateData.status = status

      // Si se cancela, liberar el servicio
      if (status === ServiceStatus.CANCELLED) {
        await db.service.update({
          where: { id: booking.serviceId },
          data: { status: ServiceStatus.AVAILABLE }
        })
      }

      // Si se completa, liberar el servicio
      if (status === ServiceStatus.COMPLETED) {
        await db.service.update({
          where: { id: booking.serviceId },
          data: { status: ServiceStatus.AVAILABLE }
        })
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: updateData,
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
        service: true,
        order: {
          include: {
            payments: true
          }
        }
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        walker: {
          include: {
            user: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verificar permisos
    const canDelete = 
      session.user.role === UserRole.ADMIN ||
      (session.user.role === UserRole.CUSTOMER && booking.customer.userId === session.user.id) ||
      (session.user.role === UserRole.WALKER && booking.walker.userId === session.user.id)

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Liberar el servicio
    await db.service.update({
      where: { id: booking.serviceId },
      data: { status: ServiceStatus.AVAILABLE }
    })

    await db.booking.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
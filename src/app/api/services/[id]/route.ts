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
    const service = await db.service.findUnique({
      where: { id: params.id },
      include: {
        walker: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            schedules: true,
            socialLinks: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            },
            customer: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Calcular rating promedio
    const avgRating = service.reviews.length > 0 
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
      : 0

    return NextResponse.json({
      ...service,
      avgRating: Math.round(avgRating * 100) / 100,
      reviewCount: service.reviews.length
    })
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    const { name, description, price, duration, isActive, status } = body

    // Verificar que el servicio existe y pertenece al paseador
    const existingService = await db.service.findFirst({
      where: {
        id: params.id,
        walker: {
          userId: session.user.id
        }
      }
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (isActive !== undefined) updateData.isActive = isActive
    if (status !== undefined) updateData.status = status

    const updatedService = await db.service.update({
      where: { id: params.id },
      data: updateData,
      include: {
        walker: {
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
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    // Verificar que el servicio existe y pertenece al paseador
    const existingService = await db.service.findFirst({
      where: {
        id: params.id,
        walker: {
          userId: session.user.id
        }
      }
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 })
    }

    await db.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
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
    const review = await db.review.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
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
        },
        product: {
          select: {
            name: true,
            seller: {
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
        service: {
          select: {
            name: true,
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
        walker: {
          select: {
            name: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error fetching review:", error)
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
    const { rating, comment, isActive } = body

    const review = await db.review.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Verificar permisos
    const isOwner = review.userId === session.user.id
    const isAdmin = session.user.role === UserRole.ADMIN

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updateData: any = {}

    // Solo el dueño puede actualizar rating y comentario
    if (isOwner) {
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
        }
        updateData.rating = rating
      }
      if (comment !== undefined) {
        updateData.comment = comment
      }
    }

    // Solo admin puede activar/desactivar
    if (isAdmin && isActive !== undefined) {
      updateData.isActive = isActive
    }

    const updatedReview = await db.review.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            avatar: true
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
        },
        product: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        },
        walker: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("Error updating review:", error)
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

    const review = await db.review.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Verificar permisos
    const isOwner = review.userId === session.user.id
    const isAdmin = session.user.role === UserRole.ADMIN

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await db.review.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
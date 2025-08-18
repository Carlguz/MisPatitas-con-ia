import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const productId = searchParams.get("productId")
    const serviceId = searchParams.get("serviceId")
    const walkerId = searchParams.get("walkerId")
    const customerId = searchParams.get("customerId")
    const minRating = searchParams.get("minRating")

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true
    }

    if (productId) {
      where.productId = productId
    }

    if (serviceId) {
      where.serviceId = serviceId
    }

    if (walkerId) {
      where.walkerId = walkerId
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (minRating) {
      where.rating = {
        gte: parseInt(minRating)
      }
    }

    const reviews = await db.review.findMany({
      where,
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
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    })

    const total = await db.review.count({ where })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment, productId, serviceId, walkerId } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (!productId && !serviceId && !walkerId) {
      return NextResponse.json({ error: "Must review a product, service, or walker" }, { status: 400 })
    }

    // Verificar que el usuario tiene un perfil de cliente
    const customer = await db.customer.findUnique({
      where: { userId: session.user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer profile required to write reviews" }, { status: 403 })
    }

    // Verificar que el elemento a reseñar existe y que el usuario tiene derecho a reseñarlo
    let targetExists = false
    let hasPurchased = false

    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId }
      })
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      targetExists = true

      // Verificar que el cliente ha comprado este producto
      const hasOrderedProduct = await db.orderItem.findFirst({
        where: {
          productId,
          order: {
            customerId: customer.id,
            status: "COMPLETED"
          }
        }
      })
      hasPurchased = !!hasOrderedProduct
    }

    if (serviceId) {
      const service = await db.service.findUnique({
        where: { id: serviceId }
      })
      if (!service) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }
      targetExists = true

      // Verificar que el cliente ha reservado este servicio
      const hasBookedService = await db.booking.findFirst({
        where: {
          serviceId,
          customerId: customer.id,
          status: "COMPLETED"
        }
      })
      hasPurchased = !!hasBookedService
    }

    if (walkerId) {
      const walker = await db.walker.findUnique({
        where: { id: walkerId }
      })
      if (!walker) {
        return NextResponse.json({ error: "Walker not found" }, { status: 404 })
      }
      targetExists = true

      // Verificar que el cliente ha reservado servicios con este paseador
      const hasBookedWithWalker = await db.booking.findFirst({
        where: {
          walkerId,
          customerId: customer.id,
          status: "COMPLETED"
        }
      })
      hasPurchased = !!hasBookedWithWalker
    }

    if (!targetExists) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 })
    }

    if (!hasPurchased) {
      return NextResponse.json({ error: "You can only review items you have purchased or used" }, { status: 403 })
    }

    // Verificar que el usuario no haya escrito ya una reseña para este elemento
    const existingReview = await db.review.findFirst({
      where: {
        userId: session.user.id,
        customerId: customer.id,
        OR: [
          { productId },
          { serviceId },
          { walkerId }
        ]
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this item" }, { status: 400 })
    }

    // Crear la reseña
    const review = await db.review.create({
      data: {
        userId: session.user.id,
        customerId: customer.id,
        rating,
        comment,
        productId,
        serviceId,
        walkerId
      },
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

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
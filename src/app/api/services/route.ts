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
    const walkerId = searchParams.get("walkerId")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      status: "AVAILABLE"
    }

    if (walkerId) {
      where.walkerId = walkerId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const services = await db.service.findMany({
      where,
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
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    })

    // Calcular rating promedio para cada servicio
    const servicesWithRating = services.map(service => {
      const avgRating = service.reviews.length > 0 
        ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
        : 0
      
      return {
        ...service,
        avgRating: Math.round(avgRating * 100) / 100,
        reviewCount: service.reviews.length
      }
    })

    const total = await db.service.count({ where })

    return NextResponse.json({
      services: servicesWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, duration } = body

    if (!name || !price || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar que el paseador existe y está aprobado
    const walker = await db.walker.findFirst({
      where: {
        userId: session.user.id,
        isApproved: true
      }
    })

    if (!walker) {
      return NextResponse.json({ error: "Walker not found or not approved" }, { status: 404 })
    }

    const service = await db.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        walkerId: walker.id
      },
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

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
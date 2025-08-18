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
    const categoryId = searchParams.get("categoryId")
    const sellerId = searchParams.get("sellerId")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (sellerId) {
      where.sellerId = sellerId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    const products = await db.product.findMany({
      where,
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        category: true,
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

    // Calcular rating promedio para cada producto
    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 100) / 100,
        reviewCount: product.reviews.length
      }
    })

    const total = await db.product.count({ where })

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.SELLER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, stock, categoryId, images } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar que el vendedor existe y está aprobado
    const seller = await db.seller.findFirst({
      where: {
        userId: session.user.id,
        isApproved: true
      }
    })

    if (!seller) {
      return NextResponse.json({ error: "Seller not found or not approved" }, { status: 404 })
    }

    // Verificar que la categoría existe
    const category = await db.productCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId,
        sellerId: seller.id,
        images: images || null
      },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        category: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
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
    const product = await db.product.findUnique({
      where: { id: params.id },
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

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Calcular rating promedio
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
      : 0

    return NextResponse.json({
      ...product,
      avgRating: Math.round(avgRating * 100) / 100,
      reviewCount: product.reviews.length
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.SELLER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, stock, categoryId, images, isActive } = body

    // Verificar que el producto existe y pertenece al vendedor
    const existingProduct = await db.product.findFirst({
      where: {
        id: params.id,
        seller: {
          userId: session.user.id
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (images !== undefined) updateData.images = images
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.SELLER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que el producto existe y pertenece al vendedor
    const existingProduct = await db.product.findFirst({
      where: {
        id: params.id,
        seller: {
          userId: session.user.id
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    await db.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
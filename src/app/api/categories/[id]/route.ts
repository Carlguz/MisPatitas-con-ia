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

    const category = await db.productCategory.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true
          },
          where: {
            isActive: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })

  } catch (error) {
    console.error("Error fetching category:", error)
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
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, image, isActive } = body

    // Verificar que la categoría exista
    const existingCategory = await db.productCategory.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Si se cambia el nombre, verificar que no exista otra categoría con ese nombre
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await db.productCategory.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          NOT: { id: params.id }
        }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (image !== undefined) updateData.image = image
    if (isActive !== undefined) updateData.isActive = isActive

    const category = await db.productCategory.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: "Category updated successfully",
      category
    })

  } catch (error) {
    console.error("Error updating category:", error)
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
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que la categoría exista
    const existingCategory = await db.productCategory.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Verificar que no tenga productos asociados
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      )
    }

    await db.productCategory.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: "Category deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
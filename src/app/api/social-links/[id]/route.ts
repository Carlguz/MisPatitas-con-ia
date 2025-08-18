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

    const socialLink = await db.socialLink.findUnique({
      where: { id: params.id },
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

    if (!socialLink) {
      return NextResponse.json(
        { error: "Social link not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ socialLink })

  } catch (error) {
    console.error("Error fetching social link:", error)
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
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { platform, url, isActive } = body

    // Verificar que el enlace exista y pertenezca al paseador
    const existingLink = await db.socialLink.findFirst({
      where: {
        id: params.id,
        walker: {
          userId: session.user.id
        }
      }
    })

    if (!existingLink) {
      return NextResponse.json(
        { error: "Social link not found or access denied" },
        { status: 404 }
      )
    }

    // Validaciones
    if (url !== undefined) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (platform !== undefined) updateData.platform = platform.toLowerCase()
    if (url !== undefined) updateData.url = url
    if (isActive !== undefined) updateData.isActive = isActive

    const socialLink = await db.socialLink.update({
      where: { id: params.id },
      data: updateData,
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
      message: "Social link updated successfully",
      socialLink
    })

  } catch (error) {
    console.error("Error updating social link:", error)
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
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que el enlace exista y pertenezca al paseador
    const existingLink = await db.socialLink.findFirst({
      where: {
        id: params.id,
        walker: {
          userId: session.user.id
        }
      }
    })

    if (!existingLink) {
      return NextResponse.json(
        { error: "Social link not found or access denied" },
        { status: 404 }
      )
    }

    await db.socialLink.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: "Social link deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting social link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
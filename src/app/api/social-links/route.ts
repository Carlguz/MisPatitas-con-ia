import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const walkerId = searchParams.get("walkerId")

    let where: any = {}
    
    // Si no se especifica walkerId, obtener los enlaces del paseador actual
    if (!walkerId) {
      if (session.user.role === UserRole.WALKER) {
        const walker = await db.walker.findFirst({
          where: { userId: session.user.id }
        })
        if (walker) {
          where.walkerId = walker.id
        }
      } else {
        return NextResponse.json({ error: "Walker ID required" }, { status: 400 })
      }
    } else {
      where.walkerId = walkerId
    }

    const socialLinks = await db.socialLink.findMany({
      where,
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
      },
      orderBy: {
        platform: "asc"
      }
    })

    return NextResponse.json({ socialLinks })

  } catch (error) {
    console.error("Error fetching social links:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { platform, url } = body

    // Validaciones
    if (!platform || !url) {
      return NextResponse.json(
        { error: "Platform and URL are required" },
        { status: 400 }
      )
    }

    // Validar formato de URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Verificar que el paseador tenga un perfil
    const walker = await db.walker.findFirst({
      where: { userId: session.user.id }
    })

    if (!walker) {
      return NextResponse.json(
        { error: "Walker profile not found" },
        { status: 403 }
      )
    }

    // Verificar que no exista un enlace para la misma plataforma
    const existingLink = await db.socialLink.findFirst({
      where: {
        walkerId: walker.id,
        platform: platform.toLowerCase()
      }
    })

    if (existingLink) {
      return NextResponse.json(
        { error: "Social link for this platform already exists" },
        { status: 400 }
      )
    }

    const socialLink = await db.socialLink.create({
      data: {
        walkerId: walker.id,
        platform: platform.toLowerCase(),
        url
      },
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
      message: "Social link created successfully",
      socialLink
    })

  } catch (error) {
    console.error("Error creating social link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
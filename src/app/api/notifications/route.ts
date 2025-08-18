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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const type = searchParams.get("type")

    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      where.isRead = false
    }

    if (type) {
      where.type = type
    }

    const notifications = await db.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    })

    const total = await db.notification.count({ where })
    const unreadCount = await db.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, title, message, type } = body

    if (!userId || !title || !message || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validar el tipo de notificación
    const validTypes = ["info", "success", "warning", "error"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
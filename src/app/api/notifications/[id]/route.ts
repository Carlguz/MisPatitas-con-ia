import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
    const { isRead } = body

    const notification = await db.notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Verificar que la notificación pertenece al usuario
    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updatedNotification = await db.notification.update({
      where: { id: params.id },
      data: {
        isRead: isRead !== undefined ? isRead : true
      }
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Error updating notification:", error)
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

    const notification = await db.notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Verificar que la notificación pertenece al usuario
    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await db.notification.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
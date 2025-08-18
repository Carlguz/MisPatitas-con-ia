import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const walker = await db.walker.findFirst({
      where: {
        userId: session.user.id
      },
      select: {
        whatsapp: true,
        whatsappEnabled: true,
        whatsappPaid: true
      }
    })

    return NextResponse.json({ walker })
  } catch (error) {
    console.error("Error fetching WhatsApp config:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { whatsapp, whatsappEnabled } = await request.json()

    // Validar el número de WhatsApp si se proporciona
    if (whatsapp) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(whatsapp)) {
        return NextResponse.json({ error: "Número de WhatsApp inválido" }, { status: 400 })
      }
    }

    const walker = await db.walker.update({
      where: {
        userId: session.user.id
      },
      data: {
        whatsapp: whatsapp || null,
        whatsappEnabled: whatsappEnabled || false
      }
    })

    return NextResponse.json({ walker })
  } catch (error) {
    console.error("Error updating WhatsApp config:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
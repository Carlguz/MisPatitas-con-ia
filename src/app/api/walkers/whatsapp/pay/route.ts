import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Simular procesamiento de pago
    // En una implementación real, aquí se integraría con Stripe u otro procesador de pagos
    const { paymentMethod } = await request.json()

    if (!paymentMethod) {
      return NextResponse.json({ error: "Método de pago requerido" }, { status: 400 })
    }

    // Verificar que el paseador tenga un número de WhatsApp configurado
    const walker = await db.walker.findFirst({
      where: {
        userId: session.user.id
      }
    })

    if (!walker?.whatsapp) {
      return NextResponse.json({ error: "Debes configurar tu número de WhatsApp primero" }, { status: 400 })
    }

    // Simular procesamiento exitoso
    const paymentSuccess = true // En producción, esto dependería del procesador de pagos

    if (paymentSuccess) {
      // Actualizar el estado del pago
      const updatedWalker = await db.walker.update({
        where: {
          userId: session.user.id
        },
        data: {
          whatsappPaid: true,
          whatsappEnabled: true
        }
      })

      return NextResponse.json({ 
        success: true, 
        walker: updatedWalker,
        message: "Pago procesado exitosamente. Tu WhatsApp está ahora habilitado para clientes."
      })
    } else {
      return NextResponse.json({ error: "Error al procesar el pago" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing WhatsApp payment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
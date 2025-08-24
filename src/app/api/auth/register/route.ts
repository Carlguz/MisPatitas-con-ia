export const runtime = 'nodejs'
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
;


export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, phone } = await request.json()

    // Validar que los campos requeridos estén presentes
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Email, password, name, and role are required" },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear el usuario
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        phone,
        isActive: true,
        emailVerified: false
      }
    })

    // Crear el perfil específico según el rol
    if (role === "SELLER") {
      await db.seller.create({
        data: {
          userId: user.id,
          storeName: `${name}'s Pet Store`,
          isApproved: false
        }
      })
    } else if (role === "WALKER") {
      await db.walker.create({
        data: {
          userId: user.id,
          name,
          pricePerHour: 0,
          isAvailable: true,
          isApproved: false
        }
      })
    } else if (role === "CUSTOMER") {
      await db.customer.create({
        data: {
          userId: user.id
        }
      })
    }

    // Crear configuraciones básicas del sistema si no existen
    await createDefaultSystemConfig()

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function createDefaultSystemConfig() {
  const configs = [
    { key: "platform_commission_rate", value: "10", description: "Porcentaje de comisión de la plataforma" },
    { key: "tax_rate", value: "16", description: "Porcentaje de impuestos" },
    { key: "min_withdrawal_amount", value: "50", description: "Monto mínimo de retiro" },
    { key: "max_booking_distance", value: "10", description: "Distancia máxima de reserva en km" },
    { key: "platform_name", value: "PetConnect", description: "Nombre de la plataforma" },
    { key: "platform_email", value: "info@petconnect.com", description: "Email de la plataforma" },
    { key: "platform_phone", value: "+1234567890", description: "Teléfono de la plataforma" }
  ]

  for (const config of configs) {
    const existing = await db.systemConfig.findUnique({
      where: { key: config.key }
    })
    
    if (!existing) {
      await db.systemConfig.create({
        data: config
      })
    }
  }
}

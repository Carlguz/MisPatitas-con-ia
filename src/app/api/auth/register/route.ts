export const runtime = 'nodejs'
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

// Mapea el texto del formulario al enum de Prisma
function mapRole(input: unknown): UserRole {
  const r = String(input ?? "").trim().toLowerCase();
  if (["paseador", "dog_walker", "dog walker", "walker", "paseador(a)"].includes(r)) {
    return UserRole.WALKER;
  }
  if (["cliente", "customer", "usuario", "user"].includes(r)) {
    return UserRole.CUSTOMER;
  }
  if (["vendedor", "seller"].includes(r)) {
    return UserRole.SELLER;
  }
  if (["admin", "administrador", "administrator"].includes(r)) {
    return UserRole.ADMIN;
  }
  // Valor por defecto
  return UserRole.CUSTOMER;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, phone } = await request.json();

    // Validación mínima
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password y name son requeridos" },
        { status: 400 }
      );
    }

    // ¿Existe el usuario?
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Hash
    const hashedPassword = await bcrypt.hash(password, 12);

    // Usar una transacción para crear el usuario y su perfil asociado
    const userRole = mapRole(role);

    const createdUser = await db.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          phone: phone ?? null,
          role: userRole,
          password: hashedPassword,
        },
        select: { id: true, email: true, role: true, name: true },
      });

      // Crear el perfil correspondiente
      if (userRole === UserRole.WALKER) {
        await prisma.walker.create({
          data: {
            userId: user.id,
            name: user.name ?? "Walker",
            phone: phone,
            pricePerHour: 20,
            // otros campos por defecto
          },
        });
      } else if (userRole === UserRole.SELLER) {
        await prisma.seller.create({
          data: {
            userId: user.id,
            storeName: `${user.name}'s Store`,
            // otros campos por defecto
          },
        });
      } else {
        // Por defecto, se crea un perfil de cliente
        await prisma.customer.create({
          data: {
            userId: user.id,
            phone: phone,
          },
        });
      }

      return user;
    });

    return NextResponse.json({ ok: true, user: createdUser }, { status: 201 });
  } catch (err: any) {
    console.error("REGISTER_ERROR:", err);
    // Exponer mensaje mínimo para depurar si vuelve a fallar
    const message =
      typeof err?.message === "string" ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


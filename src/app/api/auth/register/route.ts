export const runtime = 'nodejs'
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

// Mapea el texto del formulario al enum de Prisma
function mapRole(input: unknown): UserRole {
  const r = String(input ?? "").trim().toLowerCase();
  if (["paseador", "dog_walker", "dog walker", "walker", "paseador(a)"].includes(r)) {
    return UserRole.DOG_WALKER;
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

    // Crear usuario con enum correcto
    const created = await db.user.create({
      data: {
        email,
        name,
        phone: phone ?? null,
        role: mapRole(role), // 👈 aquí el enum correcto
        password: hashedPassword,
      },
      select: { id: true, email: true, role: true, name: true },
    });

    return NextResponse.json({ ok: true, user: created }, { status: 201 });
  } catch (err: any) {
    console.error("REGISTER_ERROR:", err);
    // Exponer mensaje mínimo para depurar si vuelve a fallar
    const message =
      typeof err?.message === "string" ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


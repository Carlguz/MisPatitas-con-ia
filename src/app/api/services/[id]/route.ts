import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET: Obtener un servicio específico (Público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await db.service.findUnique({
      where: { id: params.id },
      include: {
        walker: {
          include: {
            user: { select: { name: true, email: true, image: true } },
            schedules: true,
            socialLinks: true,
          },
        },
        reviews: {
          include: { 
            customer: { include: { user: { select: { name: true, image: true } } } }
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const avgRating = service.reviews.length > 0 
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
      : 0;

    return NextResponse.json({
      ...service,
      avgRating: Math.round(avgRating * 100) / 100,
      reviewCount: service.reviews.length,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Actualizar un servicio (Protegido)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (user?.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Forbidden: Not a Walker" }, { status: 403 });
    }

    const existingService = await db.service.findFirst({
      where: { id: params.id, walker: { userId: session.user.id } },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, price, duration, isActive, status } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (status !== undefined) updateData.status = status;

    const updatedService = await db.service.update({
      where: { id: params.id },
      data: updateData,
      include: { walker: { include: { user: { select: { name: true, email: true } } } } },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Eliminar un servicio (Protegido)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (user?.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Forbidden: Not a Walker" }, { status: 403 });
    }

    const existingService = await db.service.findFirst({
      where: { id: params.id, walker: { userId: session.user.id } },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 });
    }

    await db.service.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

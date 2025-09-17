import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Función auxiliar para calcular rating
const calculateRatings = (services: any[]) => {
  return services.map(service => {
    const avgRating = service.reviews?.length > 0 
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
      : 0;
    return {
      ...service,
      avgRating: Math.round(avgRating * 100) / 100,
      reviewCount: service.reviews?.length || 0,
    };
  });
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // Si hay una sesión y el usuario es un paseador, devuelve SUS servicios
    if (session) {
      const user = await db.user.findUnique({ 
        where: { id: session.user.id }, 
        select: { role: true }
      });

      if (user?.role === UserRole.WALKER) {
        const walker = await db.walker.findFirst({ where: { userId: session.user.id } });
        if (walker) {
          const services = await db.service.findMany({
            where: { walkerId: walker.id },
            include: { 
              walker: { include: { user: { select: { name: true, email: true } } } },
              reviews: { select: { rating: true } }
            },
            orderBy: { createdAt: "desc" }
          });
          return NextResponse.json({ services: calculateRatings(services) });
        }
      }
    }

    // Lógica pública si no hay sesión de paseador
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      status: "AVAILABLE",
      walker: { isApproved: true, user: { isActive: true } }
    };

    if (searchParams.has("walkerId")) where.walkerId = searchParams.get("walkerId");
    if (searchParams.has("search")) {
      const search = searchParams.get("search");
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }
    if (searchParams.has("minPrice") || searchParams.has("maxPrice")) {
      where.price = {};
      if (searchParams.has("minPrice")) where.price.gte = parseFloat(searchParams.get("minPrice")!);
      if (searchParams.has("maxPrice")) where.price.lte = parseFloat(searchParams.get("maxPrice")!);
    }

    const services = await db.service.findMany({
      where,
      include: { 
        walker: { include: { user: { select: { name: true, email: true, image: true } } } },
        reviews: { select: { rating: true } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await db.service.count({ where });

    return NextResponse.json({
      services: calculateRatings(services),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });

  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { role: true } 
    });

    if (user?.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Forbidden: Not a Walker" }, { status: 403 });
    }

    const walker = await db.walker.findFirst({
      where: { userId: session.user.id, isApproved: true },
    });

    if (!walker) {
      return NextResponse.json({ error: "Walker profile not found or not approved" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, price, duration } = body;

    if (!name || !price || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const service = await db.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        walkerId: walker.id,
        isActive: true,
        status: "AVAILABLE"
      },
      include: { walker: { include: { user: { select: { name: true, email: true } } } } },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

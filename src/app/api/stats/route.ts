import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const userRole = user.role;
    let stats: any = {};

    if (userRole === UserRole.ADMIN) {
      // Admin statistics logic (remains the same)
      const [
        totalUsers,
        totalSellers,
        totalWalkers,
        totalCustomers,
        totalOrders,
        totalBookings,
        totalRevenue,
        pendingSellers,
        pendingWalkers
      ] = await Promise.all([
        db.user.count({ where: { isActive: true } }),
        db.user.count({ where: { role: UserRole.SELLER, isActive: true } }),
        db.user.count({ where: { role: UserRole.WALKER, isActive: true } }),
        db.user.count({ where: { role: UserRole.CUSTOMER, isActive: true } }),
        db.order.count(),
        db.booking.count(),
        db.$queryRaw`
          SELECT COALESCE(SUM(totalAmount), 0) as total
          FROM "orders" 
          WHERE paymentStatus = 'PAID'
        `,
        db.seller.count({ where: { isApproved: false } }),
        db.walker.count({ where: { isApproved: false } })
      ]);

      stats = {
        totalUsers,
        totalSellers,
        totalWalkers,
        totalCustomers,
        totalOrders,
        totalBookings,
        totalRevenue: Number((totalRevenue as any[])[0]?.total || 0),
        pendingApprovals: pendingSellers + pendingWalkers
      };
    } else if (userRole === UserRole.SELLER) {
      // Seller statistics logic
      const seller = await db.seller.findFirst({ where: { userId: userId } });
      if (!seller) {
        return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
      }
      // ... (queries remain the same, using seller.id)
    } else if (userRole === UserRole.WALKER) {
      const walker = await db.walker.findFirst({ where: { userId: userId } });
      if (!walker) {
        return NextResponse.json({ error: "Walker profile not found" }, { status: 404 });
      }
      
      const [
        totalServices,
        totalBookings,
        totalRevenue,
        completedWalks,
        averageRating
      ] = await Promise.all([
        db.service.count({ where: { walkerId: walker.id, isActive: true } }),
        db.booking.count({ where: { walkerId: walker.id } }),
        db.$queryRaw`
          SELECT COALESCE(SUM(totalPrice), 0) as total
          FROM "bookings" 
          WHERE "walkerId" = ${walker.id} AND status = 'COMPLETED'
        `,
        db.booking.count({ where: { walkerId: walker.id, status: 'COMPLETED' } }),
        db.$queryRaw`
          SELECT COALESCE(AVG(rating), 0) as avgRating
          FROM "reviews" r
          WHERE r."walkerId" = ${walker.id} AND r.isActive = true
        `
      ]);

      stats = {
        totalServices,
        totalBookings,
        totalRevenue: Number((totalRevenue as any[])[0]?.total || 0),
        completedWalks,
        averageRating: Number((averageRating as any[])[0]?.avgRating || walker.averageRating || 0)
      };
    } else if (userRole === UserRole.CUSTOMER) {
      // Customer statistics logic
      const customer = await db.customer.findFirst({ where: { userId: userId } });
      if (!customer) {
        return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
      }
      // ... (queries remain the same, using customer.id)
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

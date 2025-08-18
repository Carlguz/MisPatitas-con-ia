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
    const role = searchParams.get("role")

    let stats: any = {}

    if (session.user.role === UserRole.ADMIN) {
      // Estadísticas para administrador
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
        // Calcular ingresos totales
        db.$queryRaw`
          SELECT COALESCE(SUM(totalAmount), 0) as total
          FROM "orders" 
          WHERE paymentStatus = 'PAID'
        `,
        db.seller.count({ where: { isApproved: false } }),
        db.walker.count({ where: { isApproved: false } })
      ])

      stats = {
        totalUsers,
        totalSellers,
        totalWalkers,
        totalCustomers,
        totalOrders,
        totalBookings,
        totalRevenue: Number((totalRevenue as any[])[0]?.total || 0),
        pendingApprovals: pendingSellers + pendingWalkers
      }
    } else if (session.user.role === UserRole.SELLER) {
      // Estadísticas para vendedor
      const seller = await db.seller.findFirst({
        where: { userId: session.user.id }
      })

      if (!seller) {
        return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
      }

      const [
        totalProducts,
        totalOrders,
        totalRevenue,
        averageRating
      ] = await Promise.all([
        db.product.count({ where: { sellerId: seller.id, isActive: true } }),
        db.order.count({
          where: {
            items: {
              some: {
                product: {
                  sellerId: seller.id
                }
              }
            }
          }
        }),
        db.$queryRaw`
          SELECT COALESCE(SUM(oi.subtotal), 0) as total
          FROM "order_items" oi
          JOIN "orders" o ON oi."orderId" = o.id
          WHERE oi."productId" IN (
            SELECT id FROM "products" WHERE "sellerId" = ${seller.id}
          ) AND o.paymentStatus = 'PAID'
        `,
        db.$queryRaw`
          SELECT COALESCE(AVG(rating), 0) as avgRating
          FROM "reviews" r
          JOIN "products" p ON r."productId" = p.id
          WHERE p."sellerId" = ${seller.id} AND r.isActive = true
        `
      ])

      stats = {
        totalProducts,
        totalOrders,
        totalRevenue: Number((totalRevenue as any[])[0]?.total || 0),
        averageRating: Number((averageRating as any[])[0]?.avgRating || 0)
      }
    } else if (session.user.role === UserRole.WALKER) {
      // Estadísticas para paseador
      const walker = await db.walker.findFirst({
        where: { userId: session.user.id }
      })

      if (!walker) {
        return NextResponse.json({ error: "Walker profile not found" }, { status: 404 })
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
      ])

      stats = {
        totalServices,
        totalBookings,
        totalRevenue: Number((totalRevenue as any[])[0]?.total || 0),
        completedWalks,
        averageRating: Number((averageRating as any[])[0]?.avgRating || walker.averageRating || 0)
      }
    } else if (session.user.role === UserRole.CUSTOMER) {
      // Estadísticas para cliente
      const customer = await db.customer.findFirst({
        where: { userId: session.user.id }
      })

      if (!customer) {
        return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
      }

      const [
        totalOrders,
        totalBookings,
        totalSpent,
        favoriteProducts
      ] = await Promise.all([
        db.order.count({ where: { customerId: customer.id } }),
        db.booking.count({ where: { customerId: customer.id } }),
        db.$queryRaw`
          SELECT COALESCE(SUM(totalAmount), 0) as total
          FROM "orders" 
          WHERE "customerId" = ${customer.id} AND paymentStatus = 'PAID'
        `,
        db.$queryRaw`
          SELECT COUNT(*) as count
          FROM "reviews" r
          WHERE r."customerId" = ${customer.id} AND r.rating >= 4
        `
      ])

      stats = {
        totalOrders,
        totalBookings,
        totalSpent: Number((totalSpent as any[])[0]?.total || 0),
        favoriteProducts: Number((favoriteProducts as any[])[0]?.count || 0)
      }
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
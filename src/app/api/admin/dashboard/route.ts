import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, OrderStatus, PaymentStatus, ServiceStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Estadísticas generales
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalWalkers,
      totalProducts,
      totalServices,
      totalOrders,
      totalBookings,
      totalReviews
    ] = await Promise.all([
      db.user.count({ where: { isActive: true } }),
      db.customer.count(),
      db.seller.count(),
      db.walker.count(),
      db.product.count({ where: { isActive: true } }),
      db.service.count({ where: { isActive: true } }),
      db.order.count(),
      db.booking.count(),
      db.review.count({ where: { isActive: true } })
    ])

    // Estadísticas de órdenes
    const orderStats = await db.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      _sum: {
        totalAmount: true
      }
    })

    // Estadísticas de pagos
    const paymentStats = await db.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        paymentStatus: true
      }
    })

    // Estadísticas de reservas
    const bookingStats = await db.booking.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Usuarios recientes (últimos 7 días)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = await db.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Órdenes recientes
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            },
            service: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Reservas recientes
    const recentBookings = await db.booking.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        walker: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    })

    // Vendedores y paseadores pendientes de aprobación
    const pendingSellers = await db.seller.count({
      where: { isApproved: false }
    })

    const pendingWalkers = await db.walker.count({
      where: { isApproved: false }
    })

    // Ingresos totales
    const totalRevenue = await db.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID
      },
      _sum: {
        totalAmount: true
      }
    })

    // Productos más vendidos
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      _count: {
        productId: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    })

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            seller: {
              select: {
                storeName: true
              }
            }
          }
        })
        return {
          ...item,
          product
        }
      })
    )

    // Servicios más reservados
    const topServices = await db.booking.groupBy({
      by: ['serviceId'],
      _count: {
        serviceId: true
      },
      orderBy: {
        _count: {
          serviceId: 'desc'
        }
      },
      take: 5
    })

    const topServicesWithDetails = await Promise.all(
      topServices.map(async (item) => {
        const service = await db.service.findUnique({
          where: { id: item.serviceId },
          select: {
            name: true,
            walker: {
              select: {
                name: true
              }
            }
          }
        })
        return {
          ...item,
          service
        }
      })
    )

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCustomers,
        totalSellers,
        totalWalkers,
        totalProducts,
        totalServices,
        totalOrders,
        totalBookings,
        totalReviews,
        recentUsers,
        pendingSellers,
        pendingWalkers,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      },
      orderStats,
      paymentStats,
      bookingStats,
      recentOrders,
      recentBookings,
      topProducts: topProductsWithDetails,
      topServices: topServicesWithDetails
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
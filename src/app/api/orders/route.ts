import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, OrderStatus, PaymentStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const skip = (page - 1) * limit

    const where: any = {}

    // Filtrar según el rol del usuario
    if (session.user.role === UserRole.CUSTOMER) {
      const customer = await db.customer.findUnique({
        where: { userId: session.user.id }
      })
      if (!customer) {
        return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
      }
      where.customerId = customer.id
    } else if (session.user.role === UserRole.SELLER) {
      const seller = await db.seller.findUnique({
        where: { userId: session.user.id }
      })
      if (!seller) {
        return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
      }
      where.items = {
        some: {
          product: {
            sellerId: seller.id
          }
        }
      }
    } else if (session.user.role === UserRole.WALKER) {
      const walker = await db.walker.findUnique({
        where: { userId: session.user.id }
      })
      if (!walker) {
        return NextResponse.json({ error: "Walker profile not found" }, { status: 404 })
      }
      where.items = {
        some: {
          service: {
            walkerId: walker.id
          }
        }
      }
    }

    if (status) {
      where.status = status
    }

    const orders = await db.order.findMany({
      where,
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
              include: {
                seller: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            service: {
              include: {
                walker: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        payments: true,
        bookings: {
          include: {
            walker: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    })

    const total = await db.order.count({ where })

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.CUSTOMER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    // Verificar que el cliente existe
    const customer = await db.customer.findUnique({
      where: { userId: session.user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    // Validar items y calcular total
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      if (item.productId) {
        const product = await db.product.findUnique({
          where: { id: item.productId }
        })
        if (!product || !product.isActive) {
          return NextResponse.json({ error: `Product ${item.productId} not found or inactive` }, { status: 404 })
        }
        if (product.stock < (item.quantity || 1)) {
          return NextResponse.json({ error: `Insufficient stock for product ${product.name}` }, { status: 400 })
        }
        
        const subtotal = product.price * (item.quantity || 1)
        totalAmount += subtotal
        
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity || 1,
          price: product.price,
          subtotal
        })
      } else if (item.serviceId) {
        const service = await db.service.findUnique({
          where: { id: item.serviceId }
        })
        if (!service || !service.isActive || service.status !== "AVAILABLE") {
          return NextResponse.json({ error: `Service ${item.serviceId} not found or unavailable` }, { status: 404 })
        }
        
        const subtotal = service.price * (item.quantity || 1)
        totalAmount += subtotal
        
        orderItems.push({
          serviceId: item.serviceId,
          quantity: item.quantity || 1,
          price: service.price,
          subtotal
        })
      }
    }

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Crear la orden
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        totalAmount,
        notes,
        items: {
          create: orderItems
        }
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
              include: {
                seller: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            service: {
              include: {
                walker: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    // Actualizar stock de productos
    for (const item of items) {
      if (item.productId) {
        await db.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity || 1
            }
          }
        })
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
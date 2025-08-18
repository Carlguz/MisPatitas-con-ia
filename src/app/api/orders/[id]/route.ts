import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, OrderStatus, PaymentStatus } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await db.order.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verificar permisos
    const hasAccess = 
      session.user.role === UserRole.ADMIN ||
      (session.user.role === UserRole.CUSTOMER && order.customer.userId === session.user.id) ||
      (session.user.role === UserRole.SELLER && order.items.some(item => item.product?.seller.userId === session.user.id)) ||
      (session.user.role === UserRole.WALKER && order.items.some(item => item.service?.walker.userId === session.user.id))

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status, paymentStatus } = body

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                seller: {
                  include: {
                    user: true
                  }
                }
              }
            },
            service: {
              include: {
                walker: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verificar permisos y validar cambios
    const updateData: any = {}

    if (status) {
      // Solo admin o el cliente pueden cancelar
      if (status === OrderStatus.CANCELLED) {
        if (session.user.role !== UserRole.ADMIN && order.customer.userId !== session.user.id) {
          return NextResponse.json({ error: "Cannot cancel this order" }, { status: 403 })
        }
      }
      
      // Vendedores y paseadores pueden marcar como completado
      if (status === OrderStatus.COMPLETED) {
        const isSeller = order.items.some(item => item.product?.seller.userId === session.user.id)
        const isWalker = order.items.some(item => item.service?.walker.userId === session.user.id)
        
        if (session.user.role !== UserRole.ADMIN && !isSeller && !isWalker) {
          return NextResponse.json({ error: "Cannot mark this order as completed" }, { status: 403 })
        }
      }
      
      updateData.status = status
    }

    if (paymentStatus) {
      // Solo admin puede cambiar el estado de pago
      if (session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: "Cannot change payment status" }, { status: 403 })
      }
      updateData.paymentStatus = paymentStatus
    }

    const updatedOrder = await db.order.update({
      where: { id: params.id },
      data: updateData,
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
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
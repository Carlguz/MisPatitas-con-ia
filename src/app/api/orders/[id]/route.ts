
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole, OrderStatus, PaymentStatus } from "@prisma/client";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                seller: true, // Incluir vendedor
              },
            },
            service: {
              include: {
                walker: true, // Incluir paseador
              },
            },
          },
        },
        payments: true,
        bookings: {
          include: {
            walker: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isCustomer = order.customerId === session.user.id;
    const isSeller = order.items.some(
      (item) => item.product?.seller?.userId === session.user.id
    );
    const isWalker = order.items.some(
      (item) => item.service?.walker?.userId === session.user.id
    );

    const hasAccess =
      session.user.role === UserRole.ADMIN ||
      isCustomer ||
      isSeller ||
      isWalker;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, paymentStatus } = body;

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: { include: { seller: true } },
            service: { include: { walker: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      if (status === OrderStatus.CANCELLED) {
        if (
          session.user.role !== UserRole.ADMIN &&
          order.customerId !== session.user.id
        ) {
          return NextResponse.json(
            { error: "Cannot cancel this order" },
            { status: 403 }
          );
        }
      } else if (status === OrderStatus.COMPLETED) {
        const isSeller = order.items.some(
          (item) => item.product?.seller?.userId === session.user.id
        );
        const isWalker = order.items.some(
          (item) => item.service?.walker?.userId === session.user.id
        );
        if (session.user.role !== UserRole.ADMIN && !isSeller && !isWalker) {
          return NextResponse.json(
            { error: "Cannot mark this order as completed" },
            { status: 403 }
          );
        }
      }
      updateData.status = status;
    }

    if (paymentStatus) {
      if (session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: "Cannot change payment status" },
          { status: 403 }
        );
      }
      updateData.paymentStatus = paymentStatus;
    }

    const updatedOrder = await db.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: { select: { name: true, email: true } },
        items: {
          include: {
            product: { include: { seller: true } },
            service: { include: { walker: true } },
          },
        },
        payments: true,
        bookings: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

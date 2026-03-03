
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole, ServiceStatus } from "@prisma/client";

// GET /api/bookings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: { // Relación directa con User
          select: {
            name: true,
            email: true,
          },
        },
        walker: { // Relación con Walker
          include: {
            user: { // Walker tiene una relación con User
              select: {
                name: true,
                email: true,
              },
            },
            schedules: true,
          },
        },
        service: true,
        order: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const hasAccess =
      session.user.role === UserRole.ADMIN ||
      session.user.id === booking.customerId || // Acceso para el cliente
      (booking.walker && session.user.id === booking.walker.userId); // Acceso para el paseador

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, notes } = body;

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { walker: true }, // Incluir para verificar el userId del paseador
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      const validTransitions: Record<ServiceStatus, ServiceStatus[]> = {
        [ServiceStatus.AVAILABLE]: [],
        [ServiceStatus.BOOKED]: [ServiceStatus.IN_PROGRESS, ServiceStatus.CANCELLED],
        [ServiceStatus.IN_PROGRESS]: [ServiceStatus.COMPLETED, ServiceStatus.CANCELLED],
        [ServiceStatus.COMPLETED]: [],
        [ServiceStatus.CANCELLED]: [],
      };

      if (!validTransitions[booking.status].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 400 }
        );
      }

      if (status === ServiceStatus.CANCELLED) {
        const canCancel =
          session.user.role === UserRole.ADMIN ||
          session.user.id === booking.customerId ||
          (booking.walker && session.user.id === booking.walker.userId);
        if (!canCancel) {
          return NextResponse.json(
            { error: "Cannot cancel this booking" },
            { status: 403 }
          );
        }
      } else if (status === ServiceStatus.IN_PROGRESS) {
        if (
          session.user.role !== UserRole.WALKER ||
          !booking.walker ||
          session.user.id !== booking.walker.userId
        ) {
          return NextResponse.json(
            { error: "Cannot start this booking" },
            { status: 403 }
          );
        }
      } else if (status === ServiceStatus.COMPLETED) {
        if (
          session.user.role !== UserRole.WALKER ||
          !booking.walker ||
          session.user.id !== booking.walker.userId
        ) {
          return NextResponse.json(
            { error: "Cannot complete this booking" },
            { status: 403 }
          );
        }
      }

      updateData.status = status;

      if (
        status === ServiceStatus.CANCELLED ||
        status === ServiceStatus.COMPLETED
      ) {
        await db.service.update({
          where: { id: booking.serviceId },
          data: { status: ServiceStatus.AVAILABLE },
        });
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: { select: { name: true, email: true } },
        walker: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        service: true,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { walker: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const canDelete =
      session.user.role === UserRole.ADMIN ||
      session.user.id === booking.customerId ||
      (booking.walker && session.user.id === booking.walker.userId);

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Liberar el servicio asociado
    await db.service.update({
      where: { id: booking.serviceId },
      data: { status: ServiceStatus.AVAILABLE },
    });

    await db.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

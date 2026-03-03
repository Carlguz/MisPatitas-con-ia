
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole, BookingStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== UserRole.CUSTOMER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walkerId } = await request.json();

    if (!walkerId) {
      return NextResponse.json({ error: "Walker ID is required" }, { status: 400 });
    }

    const walker = await db.walker.findUnique({
      where: { id: walkerId },
    });

    if (!walker || !walker.whatsappEnabled || !walker.whatsapp) {
      return NextResponse.json(
        { error: "WhatsApp contact is not available for this walker" },
        { status: 404 }
      );
    }

    // Check if the customer has a confirmed booking with this walker
    const booking = await db.booking.findFirst({
      where: {
        customerId: session.user.id,
        service: {
          walkerId: walkerId,
        },
        status: BookingStatus.CONFIRMED,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error:
            "You must have a confirmed booking with this walker to get their WhatsApp number",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ phoneNumber: walker.whatsapp });
  } catch (error) {
    console.error("Error fetching walker WhatsApp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

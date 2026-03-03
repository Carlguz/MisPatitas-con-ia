
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== UserRole.WALKER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethod } = await request.json();

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method required" },
        { status: 400 }
      );
    }

    const walker = await db.walker.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!walker) {
      return NextResponse.json({ error: "Walker not found" }, { status: 404 });
    }

    if (!walker.whatsapp) {
      return NextResponse.json(
        { error: "You must set up your WhatsApp number first" },
        { status: 400 }
      );
    }

    // Simulate successful payment processing
    const paymentSuccess = true;

    if (paymentSuccess) {
      const updatedWalker = await db.walker.update({
        where: {
          userId: session.user.id,
        },
        data: {
          whatsappPaid: true,
          whatsappEnabled: true,
        },
      });

      return NextResponse.json({
        success: true,
        walker: updatedWalker,
        message:
          "Payment processed successfully. Your WhatsApp is now enabled for clients.",
      });
    } else {
      return NextResponse.json(
        { error: "Error processing payment" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing WhatsApp payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

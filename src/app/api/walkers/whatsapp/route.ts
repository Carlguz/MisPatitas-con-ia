import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Helper para obtener el perfil de paseador
async function getWalkerProfile(session: any) {
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true }});
  if (user?.role !== UserRole.WALKER) {
    return { error: new NextResponse(JSON.stringify({ error: "Forbidden: Not a Walker" }), { status: 403 }) };
  }

  const walker = await db.walker.findUnique({ where: { userId: session.user.id } });
  if (!walker) {
    return { error: new NextResponse(JSON.stringify({ error: "Walker profile not found" }), { status: 404 }) };
  }
  return { walker };
}

// GET: Obtener la configuración de WhatsApp (Protegido)
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error, walker } = await getWalkerProfile(session);
    if (error) return error;

    return NextResponse.json({
      whatsapp: walker.whatsapp,
      whatsappEnabled: walker.whatsappEnabled,
      whatsappPaid: walker.whatsappPaid,
    });
  } catch (err) {
    console.error("Error fetching WhatsApp config:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Actualizar la configuración de WhatsApp (Protegido)
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error, walker } = await getWalkerProfile(session);
    if (error) return error;

    const body = await request.json();
    const { whatsapp, whatsappEnabled } = body;

    const updateData: { whatsapp?: string | null, whatsappEnabled?: boolean } = {};

    if (whatsapp !== undefined) {
        if (whatsapp) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(whatsapp)) {
                return NextResponse.json({ error: "Invalid WhatsApp number format" }, { status: 400 });
            }
            updateData.whatsapp = whatsapp;
        } else {
            updateData.whatsapp = null;
        }
    }

    if (whatsappEnabled !== undefined) {
        updateData.whatsappEnabled = !!whatsappEnabled;
    }

    const updatedWalker = await db.walker.update({
      where: { id: walker.id },
      data: updateData,
    });

    return NextResponse.json(updatedWalker);
  } catch (err) {
    console.error("Error updating WhatsApp config:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Helper para verificar la propiedad del enlace
const getWalkerAndSocialLink = async (session: any, linkId: string) => {
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true }});
  if (user?.role !== UserRole.WALKER) {
    return { error: new NextResponse(JSON.stringify({ error: "Forbidden: Not a Walker" }), { status: 403 }) };
  }

  const socialLink = await db.socialLink.findFirst({
    where: { id: linkId, walker: { userId: session.user.id } },
  });

  if (!socialLink) {
    return { error: new NextResponse(JSON.stringify({ error: "Social link not found or access denied" }), { status: 404 }) };
  }

  return { socialLink };
}

// GET: Obtener un enlace social específico (Protegido)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error, socialLink } = await getWalkerAndSocialLink(session, params.id);
    if (error) return error;

    return NextResponse.json({ socialLink });
  } catch (error) {
    console.error("Error fetching social link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Actualizar un enlace social (Protegido)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await getWalkerAndSocialLink(session, params.id);
    if (error) return error;

    const body = await request.json();
    const { platform, url, isActive } = body;

    if (url !== undefined) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (platform !== undefined) updateData.platform = platform.toLowerCase();
    if (url !== undefined) updateData.url = url;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedLink = await db.socialLink.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Error updating social link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Eliminar un enlace social (Protegido)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await getWalkerAndSocialLink(session, params.id);
    if (error) return error;

    await db.socialLink.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Social link deleted successfully" });
  } catch (error) {
    console.error("Error deleting social link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

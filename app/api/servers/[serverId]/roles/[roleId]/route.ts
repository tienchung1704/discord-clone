import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma";

// PATCH - Update a custom role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ serverId: string; roleId: string }> }
) {
  try {
    const { serverId, roleId } = await params;
    const profile = await currentProfile();
    const { name, color } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const member = await db.member.findFirst({
      where: {
        serverId,
        profileId: profile.id,
        role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
      }
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const role = await db.customRole.update({
      where: { id: roleId, serverId },
      data: { name, color }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("[ROLE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Delete a custom role
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; roleId: string }> }
) {
  try {
    const { serverId, roleId } = await params;
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const member = await db.member.findFirst({
      where: {
        serverId,
        profileId: profile.id,
        role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
      }
    });

    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.customRole.delete({
      where: { id: roleId, serverId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ROLE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

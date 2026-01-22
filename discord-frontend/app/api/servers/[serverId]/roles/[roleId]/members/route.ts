import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma";

// POST - Assign role to member
export async function POST(
  req: Request,
  { params }: { params: Promise<{ serverId: string; roleId: string }> }
) {
  try {
    const { serverId, roleId } = await params;
    const profile = await currentProfile();
    const { memberId } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentMember = await db.member.findFirst({
      where: {
        serverId,
        profileId: profile.id,
        role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
      }
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const assignment = await db.memberCustomRole.create({
      data: {
        memberId,
        customRoleId: roleId
      },
      include: {
        customRole: true,
        member: { include: { profile: true } }
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ROLE_MEMBER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Remove role from member
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serverId: string; roleId: string }> }
) {
  try {
    const { serverId, roleId } = await params;
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!memberId) {
      return new NextResponse("Member ID required", { status: 400 });
    }

    const currentMember = await db.member.findFirst({
      where: {
        serverId,
        profileId: profile.id,
        role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] }
      }
    });

    if (!currentMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.memberCustomRole.deleteMany({
      where: {
        memberId,
        customRoleId: roleId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ROLE_MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

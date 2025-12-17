import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma";

// GET - List all custom roles for a server
export async function GET(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const roles = await db.customRole.findMany({
      where: { serverId },
      orderBy: { position: "desc" },
      include: {
        members: {
          include: {
            member: {
              include: { profile: true }
            }
          }
        }
      }
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("[ROLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Create a new custom role
export async function POST(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const profile = await currentProfile();
    const { name, color } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin or moderator
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

    // Get highest position
    const highestRole = await db.customRole.findFirst({
      where: { serverId },
      orderBy: { position: "desc" }
    });

    const role = await db.customRole.create({
      data: {
        name,
        color: color || "#99AAB5",
        position: (highestRole?.position || 0) + 1,
        serverId
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("[ROLES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Optimized member include - only fetch required profile fields
const memberInclude = {
  members: {
    include: {
      profile: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          email: true,
          // Exclude: userId, isPremium, status, lastSeen, createdAt, updatedAt
        }
      }
    },
    orderBy: {
      role: "asc" as const
    }
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const { searchParams } = new URL(req.url);

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const serverId = searchParams.get("serverId");
    if (!serverId)
      return new NextResponse("Server ID Missing", { status: 400 });

    if (!memberId)
      return new NextResponse("Member ID Missing", { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: profile.id
            }
          }
        }
      },
      include: memberInclude
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[MEMBER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const serverId = searchParams.get("serverId");
    if (!serverId)
      return new NextResponse("Server ID Missing", { status: 400 });

    if (!memberId)
      return new NextResponse("Member ID Missing", { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              profileId: {
                not: profile.id
              }
            },
            data: { role }
          }
        }
      },
      include: memberInclude
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[MEMBER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
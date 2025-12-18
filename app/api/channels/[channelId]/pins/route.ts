import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/channels/[channelId]/pins - Get all pinned messages for a channel
export async function GET(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { channelId } = await params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    // Verify server membership
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    // Verify channel belongs to server
    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId: serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    // Fetch pinned messages with message details
    const pinnedMessages = await db.pinnedMessage.findMany({
      where: {
        channelId: channelId,
      },
      include: {
        message: {
          include: {
            member: {
              include: {
                profile: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        pinnedBy: {
          include: {
            profile: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        pinnedAt: "desc",
      },
    });

    return NextResponse.json(pinnedMessages);
  } catch (error) {
    console.error("[PINNED_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

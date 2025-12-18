import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma";

// POST /api/messages/[messageId]/pin - Pin a message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { messageId } = await params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messageId) {
      return new NextResponse("Message ID Missing", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    // Verify server membership and get member with role
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: {
          where: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const member = server.members[0];

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Only ADMIN and MODERATOR can pin messages
    if (member.role !== MemberRole.ADMIN && member.role !== MemberRole.MODERATOR) {
      return new NextResponse("Forbidden - Only moderators can pin messages", { status: 403 });
    }

    // Verify message exists and belongs to the channel
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        channelId: channelId,
        deleted: false,
      },
    });

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Check if message is already pinned
    const existingPin = await db.pinnedMessage.findUnique({
      where: {
        messageId: messageId,
      },
    });

    if (existingPin) {
      return new NextResponse("Message is already pinned", { status: 400 });
    }

    // Create pinned message
    const pinnedMessage = await db.pinnedMessage.create({
      data: {
        messageId: messageId,
        channelId: channelId,
        pinnedById: member.id,
      },
      include: {
        message: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
          },
        },
        pinnedBy: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(pinnedMessage);
  } catch (error) {
    console.error("[PIN_MESSAGE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/messages/[messageId]/pin - Unpin a message
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { messageId } = await params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messageId) {
      return new NextResponse("Message ID Missing", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    // Verify server membership and get member with role
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: {
          where: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const member = server.members[0];

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Only ADMIN and MODERATOR can unpin messages
    if (member.role !== MemberRole.ADMIN && member.role !== MemberRole.MODERATOR) {
      return new NextResponse("Forbidden - Only moderators can unpin messages", { status: 403 });
    }

    // Find the pinned message
    const pinnedMessage = await db.pinnedMessage.findFirst({
      where: {
        messageId: messageId,
        channelId: channelId,
      },
    });

    if (!pinnedMessage) {
      return new NextResponse("Pinned message not found", { status: 404 });
    }

    // Delete the pinned message
    await db.pinnedMessage.delete({
      where: {
        id: pinnedMessage.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PIN_MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

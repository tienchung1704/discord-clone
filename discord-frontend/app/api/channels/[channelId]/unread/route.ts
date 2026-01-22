import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/channels/[channelId]/unread
 * Get unread message count for a channel
 * Requirements: 9.2
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    // Get the user's read state for this channel
    const readState = await db.channelReadState.findUnique({
      where: {
        channelId_profileId: {
          channelId,
          profileId: profile.id,
        },
      },
    });

    // Count messages after the last read message
    let unreadCount = 0;

    if (readState?.lastReadMessageId) {
      // Get the timestamp of the last read message
      const lastReadMessage = await db.message.findUnique({
        where: { id: readState.lastReadMessageId },
        select: { createdAt: true },
      });

      if (lastReadMessage) {
        unreadCount = await db.message.count({
          where: {
            channelId,
            deleted: false,
            createdAt: {
              gt: lastReadMessage.createdAt,
            },
          },
        });
      }
    } else {
      // No read state exists, count all messages in channel
      unreadCount = await db.message.count({
        where: {
          channelId,
          deleted: false,
        },
      });
    }

    return NextResponse.json({ unreadCount, channelId });
  } catch (error) {
    console.log("[CHANNEL_UNREAD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

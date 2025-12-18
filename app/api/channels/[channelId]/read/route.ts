import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/channels/[channelId]/read
 * Mark channel as read (update last read message)
 * Requirements: 9.3
 */
export async function POST(
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

    // Get the latest message in the channel
    const latestMessage = await db.message.findFirst({
      where: {
        channelId,
        deleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
      },
    });

    // Upsert the read state
    const readState = await db.channelReadState.upsert({
      where: {
        channelId_profileId: {
          channelId,
          profileId: profile.id,
        },
      },
      update: {
        lastReadMessageId: latestMessage?.id || null,
        lastReadAt: new Date(),
      },
      create: {
        channelId,
        profileId: profile.id,
        lastReadMessageId: latestMessage?.id || null,
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      channelId,
      lastReadMessageId: readState.lastReadMessageId 
    });
  } catch (error) {
    console.log("[CHANNEL_READ_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

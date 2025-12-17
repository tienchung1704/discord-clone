import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { sendDMNotification } from "@/lib/mail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID missing" });
    }

    if (!content?.trim() && !fileUrl) {
      return res.status(400).json({ error: "Content or file is required" });
    }

    // Verify user is part of conversation
    const conversation = await db.globalConversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          { profileOneId: profile.id },
          { profileTwoId: profile.id },
        ],
      },
      include: {
        profileOne: true,
        profileTwo: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const message = await db.globalDirectMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversationId as string,
        profileId: profile.id,
      },
      include: {
        profile: true,
      },
    });

    // Transform to match expected format
    const transformedMessage = {
      ...message,
      member: {
        id: message.profileId,
        profileId: message.profileId,
        profile: message.profile,
      },
    };

    const channelKey = `chat:${conversationId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, transformedMessage);

    // Send email notification to recipient (in background)
    const recipient = conversation.profileOneId === profile.id 
      ? conversation.profileTwo 
      : conversation.profileOne;

    // Only send if recipient has email and is not the sender
    if (recipient.email && recipient.id !== profile.id) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      
      // Send email in background - don't await
      sendDMNotification({
        toEmail: recipient.email,
        toName: recipient.name,
        fromName: profile.name,
        fromImageUrl: profile.imageUrl,
        conversationUrl: `${baseUrl}/dm/${profile.id}`,
      }).catch((err) => console.error("[Email] Background send failed:", err));
    }

    return res.status(200).json(transformedMessage);
  } catch (error) {
    console.error("[GLOBAL_DIRECT_MESSAGES_POST]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}

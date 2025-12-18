import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { messageId, serverId, channelId } = req.query;
    const { emoji } = req.body;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!messageId) {
      return res.status(400).json({ error: "Message ID Missing" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID Missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID Missing" });
    }

    if (!emoji) {
      return res.status(400).json({ error: "Emoji Missing" });
    }

    // Verify server membership
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      include: {
        members: true
      }
    });

    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }

    // Find the member
    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Verify message exists
    const message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string
      }
    });

    if (!message || message.deleted) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (req.method === "POST") {
      // Add reaction - upsert to handle toggle behavior
      const existingReaction = await db.reaction.findUnique({
        where: {
          messageId_memberId_emoji: {
            messageId: messageId as string,
            memberId: member.id,
            emoji: emoji
          }
        }
      });

      if (existingReaction) {
        // Remove existing reaction (toggle off)
        await db.reaction.delete({
          where: {
            id: existingReaction.id
          }
        });
      } else {
        // Add new reaction
        await db.reaction.create({
          data: {
            emoji: emoji,
            messageId: messageId as string,
            memberId: member.id
          }
        });
      }
    }

    if (req.method === "DELETE") {
      // Remove specific reaction
      await db.reaction.deleteMany({
        where: {
          messageId: messageId as string,
          memberId: member.id,
          emoji: emoji
        }
      });
    }

    // Fetch updated message with reactions
    const updatedMessage = await db.message.findUnique({
      where: {
        id: messageId as string
      },
      include: {
        member: {
          include: {
            profile: true,
            customRoles: {
              include: { customRole: true },
              orderBy: { customRole: { position: "desc" } }
            }
          }
        },
        reactions: {
          include: {
            member: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    // Emit socket event for real-time update
    const updateKey = `chat:${channelId}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, updatedMessage);

    return res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("[REACTIONS]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

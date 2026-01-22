import { NextApiRequest } from "next";

import { NextApiResponseServerIO } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) return res.status(401).json({ error: "Unauthorized" });

    if (!serverId) return res.status(400).json({ error: "Server ID Missing" });

    if (!channelId)
      return res.status(400).json({ error: "Channel ID Missing" });

    if (!content?.trim() && !fileUrl) {
      return res.status(400).json({ error: "Content or file is required" });
    }

    // Single optimized query - get member with channel validation
    const member = await db.member.findFirst({
      where: {
        profileId: profile.id,
        serverId: serverId as string,
        server: {
          channels: {
            some: { id: channelId as string }
          }
        }
      },
      select: { id: true }
    });

    if (!member) return res.status(404).json({ message: "Not authorized" });

    // Create message with profile and customRoles included
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
            customRoles: {
              include: { customRole: true },
              orderBy: { customRole: { position: "desc" } }
            }
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error: any) {
    console.error("[MESSAGES_POST]", error?.message, error);
    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
}

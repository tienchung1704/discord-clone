"use client";

import { Channel, ChannelType, MemberRole, Server } from "@/lib/generated/prisma";
import { useParams } from "next/navigation";
import { useUnreadTracker } from "../hooks/use-unread-tracker";
import { ServerChannel } from "./server-channel";

interface ServerChannelListProps {
  channels: Channel[];
  server: Server;
  role?: MemberRole;
  profileId: string;
  channelType: ChannelType;
}

/**
 * Client component wrapper for ServerChannel that provides unread tracking
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
export const ServerChannelList = ({
  channels,
  server,
  role,
  profileId,
  channelType,
}: ServerChannelListProps) => {
  const params = useParams();
  const currentChannelId = params?.channelId as string | undefined;

  // Get all channel IDs for this channel type
  const channelIds = channels.map((channel) => channel.id);

  const { getUnreadCount } = useUnreadTracker({
    serverId: server.id,
    channelIds,
    currentChannelId,
    profileId,
  });

  return (
    <div className="space-y-[2px]">
      {channels.map((channel) => (
        <ServerChannel
          key={channel.id}
          channel={channel}
          role={role}
          server={server}
          unreadCount={getUnreadCount(channel.id)}
        />
      ))}
    </div>
  );
};

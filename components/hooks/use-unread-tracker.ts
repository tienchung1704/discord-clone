"use client";

import { useEffect, useCallback, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@/lib/generated/prisma";

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

interface UnreadState {
  [channelId: string]: number;
}

interface UseUnreadTrackerProps {
  serverId: string;
  channelIds: string[];
  currentChannelId?: string;
  profileId: string;
}

/**
 * Hook to track unread message counts per channel
 * Requirements: 9.1, 9.2, 9.3
 */
export const useUnreadTracker = ({
  serverId,
  channelIds,
  currentChannelId,
  profileId,
}: UseUnreadTrackerProps) => {
  const { socket } = useSocket();
  const [unreadCounts, setUnreadCounts] = useState<UnreadState>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial unread counts for all channels
  const fetchUnreadCounts = useCallback(async () => {
    if (!channelIds.length) {
      setIsLoading(false);
      return;
    }

    try {
      const counts: UnreadState = {};
      
      // Fetch unread counts for all channels in parallel
      await Promise.all(
        channelIds.map(async (channelId) => {
          try {
            const response = await fetch(`/api/channels/${channelId}/unread`);
            if (response.ok) {
              const data = await response.json();
              counts[channelId] = data.unreadCount;
            }
          } catch (error) {
            console.error(`[UnreadTracker] Error fetching unread for ${channelId}:`, error);
            counts[channelId] = 0;
          }
        })
      );

      setUnreadCounts(counts);
    } catch (error) {
      console.error("[UnreadTracker] Error fetching unread counts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [channelIds]);

  // Mark a channel as read
  const markAsRead = useCallback(async (channelId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}/read`, {
        method: "POST",
      });

      if (response.ok) {
        setUnreadCounts((prev) => ({
          ...prev,
          [channelId]: 0,
        }));
      }
    } catch (error) {
      console.error("[UnreadTracker] Error marking channel as read:", error);
    }
  }, []);

  // Get unread count for a specific channel
  const getUnreadCount = useCallback(
    (channelId: string): number => {
      return unreadCounts[channelId] || 0;
    },
    [unreadCounts]
  );

  // Increment unread count for a channel
  const incrementUnread = useCallback((channelId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || 0) + 1,
    }));
  }, []);

  // Fetch initial unread counts on mount
  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  // Mark current channel as read when it changes
  useEffect(() => {
    if (currentChannelId) {
      markAsRead(currentChannelId);
    }
  }, [currentChannelId, markAsRead]);

  // Subscribe to new message events via socket
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages in any channel
    const handleNewMessage = (message: MessageWithMemberWithProfile) => {
      const messageChannelId = message.channelId;
      
      // Don't increment if user is currently viewing this channel
      if (messageChannelId === currentChannelId) {
        return;
      }

      // Don't increment for own messages
      if (message.member.profileId === profileId) {
        return;
      }

      // Increment unread count for the channel
      incrementUnread(messageChannelId);
    };

    // Subscribe to message events for all channels in the server
    channelIds.forEach((channelId) => {
      const addKey = `chat:${channelId}:messages`;
      socket.on(addKey, handleNewMessage);
    });

    return () => {
      // Unsubscribe from all channel events
      channelIds.forEach((channelId) => {
        const addKey = `chat:${channelId}:messages`;
        socket.off(addKey, handleNewMessage);
      });
    };
  }, [socket, channelIds, currentChannelId, profileId, incrementUnread]);

  return {
    unreadCounts,
    getUnreadCount,
    markAsRead,
    isLoading,
    refetch: fetchUnreadCounts,
  };
};

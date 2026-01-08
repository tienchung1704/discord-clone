"use client";

import { useState, useEffect } from "react";
import { X, Pin, Loader2 } from "lucide-react";
import axios from "axios";
import qs from "query-string";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";

interface PinnedMessageData {
  id: string;
  messageId: string;
  channelId: string;
  pinnedAt: string;
  message: {
    id: string;
    content: string;
    fileUrl: string | null;
    createdAt: string;
    member: {
      id: string;
      profile: {
        id: string;
        name: string;
        imageUrl: string;
      };
    };
  };
  pinnedBy: {
    id: string;
    profile: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
}

interface PinnedMessagesPanelProps {
  channelId: string;
  serverId: string;
  onClose: () => void;
  onMessageClick?: (messageId: string) => void;
  position?: "absolute" | "fixed";
}

const DATE_FORMAT = "d MMM yyyy, HH:mm";

export const PinnedMessagesPanel = ({
  channelId,
  serverId,
  onClose,
  onMessageClick,
  position = "absolute",
}: PinnedMessagesPanelProps) => {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPinnedMessages = async () => {
      try {
        setIsLoading(true);
        const url = qs.stringifyUrl({
          url: `/api/channels/${channelId}/pins`,
          query: { serverId },
        });
        const response = await axios.get(url);
        setPinnedMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch pinned messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPinnedMessages();
  }, [channelId, serverId]);

  const handleMessageClick = (messageId: string) => {
    if (onMessageClick) {
      onMessageClick(messageId);
    }
    console.log("Navigate to pinned message:", messageId);
  };

  const positionClasses = position === "fixed" 
    ? "fixed top-14 right-64 z-50" 
    : "absolute top-10 right-0 z-50";

  return (
    <div className={`${positionClasses} w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg`}>
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-zinc-500" />
          <span className="font-semibold text-sm">Pinned Messages</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-96">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : pinnedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Pin className="h-8 w-8 text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No pinned messages yet
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Pin important messages to find them easily
            </p>
          </div>
        ) : (
          <div className="p-2">
            {pinnedMessages.map((pinned) => (
              <div
                key={pinned.id}
                onClick={() => handleMessageClick(pinned.message.id)}
                className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition mb-1"
              >
                <div className="flex items-start gap-2">
                  <UserAvatar
                    src={pinned.message.member.profile.imageUrl}
                    className="h-8 w-8"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {pinned.message.member.profile.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {format(new Date(pinned.message.createdAt), DATE_FORMAT)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-1">
                      {pinned.message.content}
                    </p>
                    {pinned.message.fileUrl && (
                      <p className="text-xs text-indigo-500 mt-1">
                        [Attachment]
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

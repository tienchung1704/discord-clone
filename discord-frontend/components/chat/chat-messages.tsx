"use client";

import { Member, Message, Profile } from "@/lib/generated/prisma";
import ChatWelcome from "./chat-welcome";
import { useChatQuery } from "../hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { useMemo } from "react";
import { useChatSocket } from "@/components/hooks/use-chat-socket";
import { VirtualizedMessages } from "./virtualized-messages";

interface ReactionData {
  id: string;
  emoji: string;
  memberId: string;
  member: {
    id: string;
    profile: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
}

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
  reactions?: ReactionData[];
  pinnedMessage?: { id: string } | null;
};

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramValue,
  paramKey,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  // Socket integration for real-time updates
  useChatSocket({
    queryKey,
    addKey,
    updateKey,
  });

  // Flatten all pages of messages into a single array
  // Messages are ordered newest first (index 0 = newest)
  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(
      (page: { items: MessageWithMemberWithProfile[] }) => page.items
    );
  }, [data?.pages]);

  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading Messages
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong.
        </p>
      </div>
    );
  }

  // If no messages, show welcome message directly
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col py-4 overflow-y-auto">
        <div className="flex-1" />
        <ChatWelcome type={type} name={name} />
      </div>
    );
  }

  return (
    <VirtualizedMessages
      messages={messages}
      currentMember={member}
      socketUrl={socketUrl}
      socketQuery={socketQuery}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      type={type}
      name={name}
    />
  );
};

export default ChatMessages;

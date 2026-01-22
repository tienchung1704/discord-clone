"use client";

import React, { useCallback, useEffect, useRef, useState, memo, CSSProperties, ReactElement } from "react";
import { List, ListImperativeAPI, useDynamicRowHeight, useListRef } from "react-window";
import { format } from "date-fns";
import { Member, Message, Profile } from "@/lib/generated/prisma";
import { ChatItem } from "./chat-item";
import { Loader2 } from "lucide-react";
import ChatWelcome from "./chat-welcome";

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

// Props that we pass to each row (excluding index, style, ariaAttributes which are injected)
interface CustomRowProps {
  messages: MessageWithMemberWithProfile[];
  currentMember: Member;
  socketUrl: string;
  socketQuery: Record<string, string>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  type: "channel" | "conversation";
  name: string;
  onLoadMore: () => void;
}

interface VirtualizedMessagesProps {
  messages: MessageWithMemberWithProfile[];
  currentMember: Member;
  socketUrl: string;
  socketQuery: Record<string, string>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  type: "channel" | "conversation";
  name: string;
}

const DATE_FORMAT = "d MMM yyyy, HH:mm";

// Estimated height for each message item
const DEFAULT_ROW_HEIGHT = 80;
const OVERSCAN_COUNT = 5;

// Row component props type (injected props + custom props)
type MessageRowProps = {
  index: number;
  style: CSSProperties;
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
} & CustomRowProps;

// Row component for the virtualized list
function MessageRow({
  index,
  style,
  ariaAttributes,
  messages,
  currentMember,
  socketUrl,
  socketQuery,
  hasNextPage,
  isFetchingNextPage,
  type,
  name,
  onLoadMore,
}: MessageRowProps): ReactElement {
  // Index 0 = welcome/load more (at top)
  // Index 1+ = messages (oldest first at top, newest at bottom)

  // Show welcome message or load more at the top (index 0)
  if (index === 0) {
    if (!hasNextPage) {
      return (
        <div style={style} {...ariaAttributes}>
          <ChatWelcome type={type} name={name} />
        </div>
      );
    }

    // Trigger load more when this item becomes visible
    if (!isFetchingNextPage) {
      onLoadMore();
    }

    return (
      <div style={style} {...ariaAttributes} className="flex justify-center items-center py-4">
        {isFetchingNextPage ? (
          <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
        ) : (
          <button
            onClick={onLoadMore}
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs dark:hover:text-zinc-300 transition"
          >
            Load previous messages
          </button>
        )}
      </div>
    );
  }

  // Messages: index 1 = oldest message, higher index = newer messages
  // messages array is [newest, ..., oldest], so we need to reverse
  const messageIndex = messages.length - index;
  const message = messages[messageIndex];

  if (!message) {
    return <div style={style} {...ariaAttributes} />;
  }

  return (
    <div style={style} {...ariaAttributes}>
      <ChatItem
        currentMember={currentMember}
        id={message.id}
        content={message.content}
        fileUrl={message.fileUrl}
        deleted={message.deleted}
        timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
        isUpdated={message.updatedAt !== message.createdAt}
        socketUrl={socketUrl}
        socketQuery={socketQuery}
        member={message.member}
        reactions={message.reactions || []}
        isPinned={!!message.pinnedMessage}
      />
    </div>
  );
}

export function VirtualizedMessages({
  messages,
  currentMember,
  socketUrl,
  socketQuery,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  type,
  name,
}: VirtualizedMessagesProps) {
  const listRef = useListRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);
  const prevFirstMessageId = useRef<string | null>(null);

  // Use dynamic row height for variable message sizes
  const dynamicRowHeight = useDynamicRowHeight({
    defaultRowHeight: DEFAULT_ROW_HEIGHT,
    key: messages.length, // Reset when message count changes significantly
  });

  // Calculate total item count (messages + 1 for welcome/loading)
  const itemCount = messages.length + 1;

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Scroll to bottom for new messages (when a new message is added at the beginning)
  useEffect(() => {
    const currentFirstId = messages[0]?.id || null;

    // If a new message was added (not from loading older messages)
    if (
      currentFirstId !== prevFirstMessageId.current &&
      messages.length > prevMessagesLength.current &&
      listRef.current
    ) {
      // Scroll to newest message (at the bottom, which is the last index)
      listRef.current.scrollToRow({ index: itemCount - 1, align: "end" });
    }

    prevFirstMessageId.current = currentFirstId;
    prevMessagesLength.current = messages.length;
  }, [messages, listRef, itemCount]);

  // Row props to pass to each row (excluding index, style, ariaAttributes which are injected by List)
  const rowProps = React.useMemo(() => ({
    messages,
    currentMember,
    socketUrl,
    socketQuery,
    hasNextPage,
    isFetchingNextPage,
    type,
    name,
    onLoadMore: handleLoadMore,
  }), [
    messages,
    currentMember,
    socketUrl,
    socketQuery,
    hasNextPage,
    isFetchingNextPage,
    type,
    name,
    handleLoadMore
  ]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col py-4 overflow-hidden">
      <List
        listRef={listRef}
        className="flex-1"
        style={{ height: "100%", width: "100%" }}
        rowCount={itemCount}
        rowHeight={dynamicRowHeight}
        rowProps={rowProps}
        overscanCount={OVERSCAN_COUNT}
        rowComponent={MessageRow}
        onRowsRendered={(visibleRows) => {
          // Load more when user scrolls near the top (index 0 = welcome/load more)
          if (visibleRows.startIndex <= 2 && hasNextPage && !isFetchingNextPage) {
            handleLoadMore();
          }
        }}
      />
    </div>
  );
}

export default VirtualizedMessages;

"use client";

import { useState } from "react";
import axios from "axios";
import qs from "query-string";
import { Smile, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "../ui/action-tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";

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

interface MessageReactionsProps {
  messageId: string;
  reactions: ReactionData[];
  currentMemberId: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

interface GroupedReaction {
  emoji: string;
  count: number;
  users: { id: string; name: string }[];
  hasReacted: boolean;
}

export function MessageReactions({
  messageId,
  reactions,
  currentMemberId,
  socketUrl,
  socketQuery,
}: MessageReactionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  // Group reactions by emoji
  const groupedReactions: GroupedReaction[] = reactions.reduce(
    (acc: GroupedReaction[], reaction) => {
      const existing = acc.find((r) => r.emoji === reaction.emoji);
      if (existing) {
        existing.count++;
        existing.users.push({
          id: reaction.member.profile.id,
          name: reaction.member.profile.name,
        });
        if (reaction.memberId === currentMemberId) {
          existing.hasReacted = true;
        }
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          users: [
            {
              id: reaction.member.profile.id,
              name: reaction.member.profile.name,
            },
          ],
          hasReacted: reaction.memberId === currentMemberId,
        });
      }
      return acc;
    },
    []
  );

  const onReactionClick = async (emoji: string) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${messageId}/reactions`,
        query: socketQuery,
      });

      await axios.post(url, { emoji });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onEmojiSelect = async (emoji: string) => {
    await onReactionClick(emoji);
  };

  const getUsersTooltip = (users: { id: string; name: string }[]) => {
    if (users.length === 0) return "";
    if (users.length === 1) return users[0].name;
    if (users.length === 2) return `${users[0].name} and ${users[1].name}`;
    return `${users[0].name}, ${users[1].name} and ${users.length - 2} others`;
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {groupedReactions.map((reaction) => (
        <ActionTooltip
          key={reaction.emoji}
          label={getUsersTooltip(reaction.users)}
          side="top"
        >
          <button
            onClick={() => onReactionClick(reaction.emoji)}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition",
              "bg-zinc-200/50 dark:bg-zinc-700/50 hover:bg-zinc-300/50 dark:hover:bg-zinc-600/50",
              reaction.hasReacted &&
                "bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-400 dark:border-indigo-600"
            )}
          >
            <span>{reaction.emoji}</span>
            <span
              className={cn(
                "text-zinc-600 dark:text-zinc-300",
                reaction.hasReacted && "text-indigo-600 dark:text-indigo-400"
              )}
            >
              {reaction.count}
            </span>
          </button>
        </ActionTooltip>
      ))}

      {/* Add reaction button */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full transition",
              "bg-zinc-200/50 dark:bg-zinc-700/50 hover:bg-zinc-300/50 dark:hover:bg-zinc-600/50",
              "opacity-0 group-hover:opacity-100"
            )}
          >
            <Plus className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          sideOffset={5}
          className="bg-transparent border-none shadow-none drop-shadow-none p-0"
        >
          <Picker
            theme={resolvedTheme}
            data={data}
            onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Reaction button for the action toolbar
export function ReactionButton({
  messageId,
  socketUrl,
  socketQuery,
}: {
  messageId: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  const onEmojiSelect = async (emoji: string) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${messageId}/reactions`,
        query: socketQuery,
      });

      await axios.post(url, { emoji });
    } catch (error) {
      console.error("Failed to add reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button disabled={isLoading}>
          <ActionTooltip label="Add Reaction">
            <Smile className="cursor-pointer w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
          </ActionTooltip>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={5}
        className="bg-transparent border-none shadow-none drop-shadow-none p-0"
      >
        <Picker
          theme={resolvedTheme}
          data={data}
          onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  );
}

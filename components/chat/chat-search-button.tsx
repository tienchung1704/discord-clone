"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/action-tooltip";
import { MessageSearch } from "./message-search";

interface ChatSearchButtonProps {
  channelId: string;
  onMessageClick?: (messageId: string) => void;
}

export const ChatSearchButton = ({
  channelId,
  onMessageClick
}: ChatSearchButtonProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleResultClick = (messageId: string) => {
    // Scroll to message or navigate - this can be enhanced later
    if (onMessageClick) {
      onMessageClick(messageId);
    }
    // For now, we'll just close the search panel
    // The actual scroll-to-message functionality would require
    // integration with the chat messages component
    console.log("Navigate to message:", messageId);
  };

  return (
    <div className="relative">
      <ActionTooltip label="Search messages" side="bottom">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="h-8 w-8 p-0"
        >
          <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </Button>
      </ActionTooltip>

      {isSearchOpen && (
        <MessageSearch
          channelId={channelId}
          onResultClick={handleResultClick}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  );
};

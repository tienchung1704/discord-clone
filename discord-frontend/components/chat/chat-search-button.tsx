"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/action-tooltip";
import { MessageSearch } from "./message-search";

interface ChatSearchButtonProps {
  channelId: string;
  onMessageClick?: (messageId: string) => void;
  panelPosition?: "absolute" | "fixed";
}

export const ChatSearchButton = ({
  channelId,
  onMessageClick,
  panelPosition = "absolute"
}: ChatSearchButtonProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const t = useTranslations("Chat");

  const handleResultClick = (messageId: string) => {
    if (onMessageClick) {
      onMessageClick(messageId);
    }
  };

  return (
    <div className="relative">
      <ActionTooltip label={t("searchMessages")} side="bottom">
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
          position={panelPosition}
        />
      )}
    </div>
  );
};

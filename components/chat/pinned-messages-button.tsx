"use client";

import { useState } from "react";
import { Pin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/action-tooltip";
import { PinnedMessagesPanel } from "./pinned-messages-panel";

interface PinnedMessagesButtonProps {
  channelId: string;
  serverId: string;
  onMessageClick?: (messageId: string) => void;
  panelPosition?: "absolute" | "fixed";
}

export const PinnedMessagesButton = ({
  channelId,
  serverId,
  onMessageClick,
  panelPosition = "absolute",
}: PinnedMessagesButtonProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleMessageClick = (messageId: string) => {
    if (onMessageClick) {
      onMessageClick(messageId);
    }
    // Close the panel after clicking a message
    setIsPanelOpen(false);
  };

  return (
    <div className="relative">
      <ActionTooltip label="Pinned messages" side="bottom">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="h-8 w-8 p-0"
        >
          <Pin className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </Button>
      </ActionTooltip>

      {isPanelOpen && (
        <PinnedMessagesPanel
          channelId={channelId}
          serverId={serverId}
          onClose={() => setIsPanelOpen(false)}
          onMessageClick={handleMessageClick}
          position={panelPosition}
        />
      )}
    </div>
  );
};

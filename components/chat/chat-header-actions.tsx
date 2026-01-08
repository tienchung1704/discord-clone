"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/action-tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MemberItem } from "@/components/righsidebar/member-item";
import { PinnedMessagesButton } from "./pinned-messages-button";
import { ChatSearchButton } from "./chat-search-button";
import { useSidebarStore } from "@/components/hooks/use-sidebar-store";
import { Member, Profile, Server, CustomRole, MemberCustomRole } from "@/lib/generated/prisma";
import { MemberRole } from "@/lib/generated/prisma/client";

type MemberWithProfile = Member & {
  profile: Pick<Profile, "id" | "name" | "imageUrl" | "isPremium" | "status">;
  customRoles: (MemberCustomRole & { customRole: CustomRole })[];
};

type ServerWithMembers = Server & {
  members: MemberWithProfile[];
  customRoles: CustomRole[];
};

interface ChatHeaderActionsProps {
  serverId: string;
  channelId?: string;
  type: "channel" | "conversation";
}

export const ChatHeaderActions = ({
  serverId,
  channelId,
  type,
}: ChatHeaderActionsProps) => {
  const { isRightSidebarOpen, toggleRightSidebar } = useSidebarStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [server, setServer] = useState<ServerWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      setIsSheetOpen(true);
      if (!server) {
        setIsLoading(true);
        fetch(`/api/servers/${serverId}/members`)
          .then((res) => res.json())
          .then((data) => {
            setServer(data);
            setIsLoading(false);
          })
          .catch(() => setIsLoading(false));
      }
    } else {
      toggleRightSidebar();
    }
  };

  const renderSection = (
    members: MemberWithProfile[],
    label: string,
    color?: string
  ) => {
    if (!members.length) return null;
    return (
      <div className="mb-4">
        <div className="px-2 py-1">
          <span
            className="text-xs font-semibold uppercase"
            style={{ color: color || undefined }}
          >
            {label} — {members.length}
          </span>
        </div>
        <div className="space-y-0.5">
          {members.map((member) => (
            <MemberItem key={member.id} member={member} server={server!} />
          ))}
        </div>
      </div>
    );
  };

  const renderSheetContent = () => {
    if (isLoading || !server) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500" />
        </div>
      );
    }

    const customRoleGroups = server.customRoles
      .map((role) => ({
        role,
        members: server.members.filter((m) =>
          m.customRoles.some((cr) => cr.customRoleId === role.id)
        ),
      }))
      .filter((g) => g.members.length > 0);

    const membersWithoutCustomRole = server.members.filter(
      (m) => m.customRoles.length === 0
    );
    const admins = membersWithoutCustomRole.filter((m) => m.role === MemberRole.ADMIN);
    const moderators = membersWithoutCustomRole.filter((m) => m.role === MemberRole.MODERATOR);
    const guests = membersWithoutCustomRole.filter((m) => m.role === MemberRole.GUEST);

    return (
      <>
        {customRoleGroups.map(({ role, members }) =>
          renderSection(members, role.name, role.color)
        )}
        {renderSection(admins, "Admin")}
        {renderSection(moderators, "Moderator")}
        {renderSection(guests, "Member")}
      </>
    );
  };

  const isActive = isMobile ? isSheetOpen : isRightSidebarOpen;

  return (
    <div className="flex items-center gap-2">
      {/* Pin và Search luôn hiện trên desktop */}
      {!isMobile && type === "channel" && channelId && (
        <>
          <PinnedMessagesButton channelId={channelId} serverId={serverId} panelPosition="fixed" />
          <ChatSearchButton channelId={channelId} panelPosition="fixed" />
        </>
      )}

      <ActionTooltip label={isActive ? "Hide Members" : "Show Members"} side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className={`h-8 w-8 hover:bg-zinc-500/10 ${isActive ? "bg-zinc-500/20" : ""}`}
        >
          <Users className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        </Button>
      </ActionTooltip>

      {/* Mobile Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="p-0 w-60 dark:bg-[#2B2D31] bg-[#F2F3F5]">
          <SheetTitle className="sr-only">Members</SheetTitle>
          {/* Pin và Search trong Sheet cho mobile */}
          {type === "channel" && channelId && (
            <div className="flex items-center gap-2 p-2 border-b border-zinc-200 dark:border-zinc-700">
              <PinnedMessagesButton channelId={channelId} serverId={serverId} />
              <ChatSearchButton channelId={channelId} />
            </div>
          )}
          <ScrollArea className="h-full px-2 py-3">
            {renderSheetContent()}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

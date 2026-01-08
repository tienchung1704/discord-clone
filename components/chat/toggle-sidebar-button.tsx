"use client";

import { Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/action-tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MemberItem } from "@/components/righsidebar/member-item";
import { useEffect, useState } from "react";
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

interface ToggleSidebarButtonProps {
  serverId: string;
}

export const ToggleSidebarButton = ({ serverId }: ToggleSidebarButtonProps) => {
  const [server, setServer] = useState<ServerWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !server) {
      setIsLoading(true);
      fetch(`/api/servers/${serverId}/members`)
        .then((res) => res.json())
        .then((data) => {
          setServer(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, serverId, server]);

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

  const renderContent = () => {
    if (isLoading || !server) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500" />
        </div>
      );
    }

    // Group members by custom role first, then by system role
    const customRoleGroups = server.customRoles
      .map((role) => ({
        role,
        members: server.members.filter((m) =>
          m.customRoles.some((cr) => cr.customRoleId === role.id)
        ),
      }))
      .filter((g) => g.members.length > 0);

    // Members without custom roles, grouped by system role
    const membersWithoutCustomRole = server.members.filter(
      (m) => m.customRoles.length === 0
    );
    const admins = membersWithoutCustomRole.filter(
      (m) => m.role === MemberRole.ADMIN
    );
    const moderators = membersWithoutCustomRole.filter(
      (m) => m.role === MemberRole.MODERATOR
    );
    const guests = membersWithoutCustomRole.filter(
      (m) => m.role === MemberRole.GUEST
    );

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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <ActionTooltip label="Show Members" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-zinc-500/10"
          >
            <Users className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </Button>
        </ActionTooltip>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="p-0 w-60 dark:bg-[#2B2D31] bg-[#F2F3F5]"
      >
        <SheetTitle className="sr-only">Members</SheetTitle>
        <ScrollArea className="h-full px-2 py-3">
          {renderContent()}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

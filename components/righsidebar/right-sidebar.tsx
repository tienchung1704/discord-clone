import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma/client";
import { ScrollArea } from "../ui/scroll-area";
import { MemberItem } from "./member-item";

interface ServerSidebarProps {
  serverId: string;
}

export const ShowMemberChannel = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();
  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: { id: serverId },
    include: {
      members: {
        include: { 
          profile: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              isPremium: true,
              status: true,
            }
          },
          customRoles: {
            include: {
              customRole: true
            },
            orderBy: {
              customRole: { position: "desc" }
            }
          }
        },
        orderBy: { role: "asc" },
      },
      customRoles: {
        orderBy: { position: "desc" }
      }
    },
  });

  if (!server) {
    return redirect("/");
  }

  // Group members by custom role first, then by system role
  const customRoleGroups = server.customRoles.map(role => ({
    role,
    members: server.members.filter(m => 
      m.customRoles.some(cr => cr.customRoleId === role.id)
    )
  })).filter(g => g.members.length > 0);

  // Members without custom roles, grouped by system role
  const membersWithoutCustomRole = server.members.filter(m => m.customRoles.length === 0);
  const admins = membersWithoutCustomRole.filter((m) => m.role === MemberRole.ADMIN);
  const moderators = membersWithoutCustomRole.filter((m) => m.role === MemberRole.MODERATOR);
  const guests = membersWithoutCustomRole.filter((m) => m.role === MemberRole.GUEST);

  const renderSection = (
    members: typeof server.members,
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
            <MemberItem 
              key={member.id}
              member={member}
              server={server}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ScrollArea className="flex-1 px-2 py-3">
        {/* Custom roles first */}
        {customRoleGroups.map(({ role, members }) => (
          renderSection(members, role.name, role.color)
        ))}
        {/* Then system roles */}
        {renderSection(admins, "Admin")}
        {renderSection(moderators, "Moderator")}
        {renderSection(guests, "Member")}
      </ScrollArea>
    </div>
  );
};

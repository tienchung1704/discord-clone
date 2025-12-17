"use client";

import { Member, MemberRole, Server, CustomRole } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { Moon, MinusCircle, DiamondPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "../ui/user-avatar";

type UserStatus = "ONLINE" | "IDLE" | "DND" | "OFFLINE";

interface ProfileData {
  id: string;
  name: string;
  imageUrl: string;
  isPremium: boolean;
  status?: UserStatus;
}

interface CustomRoleData {
  customRole: {
    id: string;
    name: string;
    color: string;
    position: number;
  };
}

interface MemberItemProps {
  member: Member & { 
    profile: ProfileData;
    customRoles?: CustomRoleData[];
  };
  server: Server;
}

const statusConfig: Record<UserStatus, { color: string; icon: React.ComponentType<{ className?: string }> | null }> = {
  ONLINE: { color: "bg-emerald-500", icon: null },
  IDLE: { color: "bg-amber-500", icon: Moon },
  DND: { color: "bg-rose-500", icon: MinusCircle },
  OFFLINE: { color: "bg-zinc-500", icon: null },
};

export const MemberItem = ({ member }: MemberItemProps) => {
  const router = useRouter();
  const status: UserStatus = (member.profile.status as UserStatus) || "OFFLINE";
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  // Get highest position custom role for name color
  const highestRole = member.customRoles?.length 
    ? member.customRoles.reduce((highest, current) => 
        current.customRole.position > highest.customRole.position ? current : highest
      )
    : null;
  const nameColor = highestRole?.customRole.color;

  const onClick = () => {
    router.push(`/dm/${member.profile.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-1.5 rounded flex items-center gap-x-2 w-full",
        "hover:bg-zinc-700/30 dark:hover:bg-zinc-700/50",
        status === "OFFLINE" && "opacity-50"
      )}
    >
      {/* Avatar with status */}
      <div className="relative flex-shrink-0">
        <UserAvatar src={member.profile.imageUrl} className="h-8 w-8" />
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#2B2D31] flex items-center justify-center",
            statusInfo.color
          )}
        >
          {StatusIcon && <StatusIcon className="h-1.5 w-1.5 text-white" />}
        </div>
      </div>

      {/* Name with role color */}
      <span 
        className={cn(
          "text-sm font-medium group-hover:text-zinc-100 truncate",
          !nameColor && "text-zinc-300"
        )}
        style={nameColor ? { color: nameColor } : undefined}
      >
        {member.profile.name}
      </span>

      {/* Premium badge */}
      {member.profile.isPremium && (
        <DiamondPlus className="h-4 w-4 text-purple-500 flex-shrink-0 ml-auto" />
      )}
    </button>
  );
};

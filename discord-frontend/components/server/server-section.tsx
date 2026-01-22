"use client"

import { ChannelType, MemberRole } from "@/lib/generated/prisma"
import { ServerWithMembersWithProfile } from "@/types";
import { ActionTooltip } from "../ui/action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "../hooks/user-model-store";

interface ServerSectionProps {
    label: string,
    role?: MemberRole,
    sectionType: "channels" | "members";
    channelType?: ChannelType;
    server?: ServerWithMembersWithProfile,
}


export const ServerSection = ({ label, role, sectionType, channelType, server }: ServerSectionProps) => {
    const { onOpen } = useModal();
    return (
        <div className=" flex items-center py-2 justify-between">
            <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                {label}
            </p>
            {
                role !== MemberRole.GUEST && sectionType === "channels" && (
                    <ActionTooltip label="Create Channels" side="top" >
                        <button onClick={() => onOpen("createChannel", { channelType })} className="text-zinc-500 howver:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" >
                            <Plus className="h-4 w-4 " />
                        </button>
                    </ActionTooltip>
                )
            }
            {
                role === MemberRole.ADMIN && sectionType === "members" && (
                    <ActionTooltip label="Manage" side="top" >
                        <button onClick={() => onOpen("members", { server })} className="text-zinc-500 howver:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" >
                            <Settings className="h-4 w-4 " />
                        </button>
                    </ActionTooltip>
                )
            }
        </div>
    )
}
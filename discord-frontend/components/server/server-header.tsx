"use client";

import { MemberRole } from "@/lib/generated/prisma";
import { ServerWithMembersWithProfile } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users, Shield } from "lucide-react";
import { useModal } from "../hooks/user-model-store";


interface ServerHeaderProps {
    server: ServerWithMembersWithProfile
    role?: MemberRole;
}

export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
    const {onOpen} = useModal();
    const isAdmin = role === MemberRole.ADMIN;
    const isModerator = isAdmin || role === MemberRole.MODERATOR;
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                className="focus:outline-none" asChild
            >
                <button className="w-full text-zinc-700 dark:text-zinc-300 text-md px-3 ml-auto flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition" >
                    {server.name.length > 21 ? `${server.name.slice(0, 21)}...` : server.name}
                    <ChevronDown className="h-5 w-5 ml-auto" />
                </button>

            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
                {isModerator && (
                    <DropdownMenuItem onClick={()=> onOpen("invite", { server })} className=" px-3 py-2 text-sm cursor-pointer">
                        Invite
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onOpen("editServer",  { server });
                    }} className="px-3 py-2 text-sm cursor-pointer">
                        Setting
                        <Settings className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem onClick={()=> onOpen("members",  { server })} className="px-3 py-2 text-sm cursor-pointer">
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem onClick={()=> onOpen("manageRoles",  { server })} className="px-3 py-2 text-sm cursor-pointer">
                        Manage Roles
                        <Shield className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem onClick={() => onOpen("createChannel", {server})} className="px-3 py-2 text-sm cursor-pointer">
                        Create new channel
                        <PlusCircle className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuSeparator />
                )}
                {isAdmin && (
                    <DropdownMenuItem onClick={()=> onOpen("deleteServer", {server})} className="text-rose-500 px-3 py-2 text-sm cursor-pointer">
                        Delete server
                        <Trash className="text-rose-500 h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {!isAdmin && (
                    <DropdownMenuItem onClick={()=> onOpen("leaveServer", {server})} className="text-rose-500 px-3 py-2 text-sm cursor-pointer">
                        Leave server
                        <LogOut className="text-rose-500 h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}

            </DropdownMenuContent>
        </DropdownMenu>
    )
}


"use client";

import { useState } from "react";
import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Users,
} from "lucide-react";

import { useModal } from "../hooks/user-model-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MemberRole } from "@/lib/generated/prisma";
import { ServerWithMembersWithProfile } from "@/types";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const roleBadgeMap = {
  GUEST: "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
  MODERATOR: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  ADMIN: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
};

export const MembersModal = () => {
  const router = useRouter();
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const [loadingId, setLoadingId] = useState("");

  const { server } = data as { server: ServerWithMembersWithProfile };

  const isModalOpen = isOpen && type === "members";

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server.id,
        }
      });

      const response = await axios.delete(url);

      router.refresh();
      onOpen("members", { server: response.data });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId("");
    }
  }

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server.id,
        }
      });

      const response = await axios.patch(url, { role });

      router.refresh();
      onOpen("members", { server: response.data });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
              <Users className="w-3.5 h-3.5" />
              {server?.members?.length} Members
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] px-6 pb-6">
          <div className="space-y-2">
            {server?.members?.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center gap-x-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <UserAvatar src={member.profile.imageUrl} />
                <div className="flex flex-col gap-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-x-2">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {member.profile.name}
                    </span>
                    {roleIconMap[member.role]}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {member.profile.email}
                  </p>
                </div>
                
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeMap[member.role]}`}>
                  {member.role.toLowerCase()}
                </span>
                
                {server.profileId !== member.profileId && loadingId !== member.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <MoreVertical className="h-4 w-4 text-zinc-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center cursor-pointer">
                          <ShieldQuestion className="h-4 w-4 mr-2" />
                          <span>Role</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <DropdownMenuItem 
                              onClick={() => onRoleChange(member.id, "GUEST")}
                              className="cursor-pointer"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Guest
                              {member.role === "GUEST" && (
                                <Check className="h-4 w-4 ml-auto text-emerald-500" />
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onRoleChange(member.id, "MODERATOR")}
                              className="cursor-pointer"
                            >
                              <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
                              Moderator
                              {member.role === "MODERATOR" && (
                                <Check className="h-4 w-4 ml-auto text-emerald-500" />
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                      <DropdownMenuItem 
                        onClick={() => onKick(member.id)}
                        className="cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-900/20"
                      >
                        <Gavel className="h-4 w-4 mr-2" />
                        Kick
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {loadingId === member.id && (
                  <Loader2 className="animate-spin text-zinc-500 h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
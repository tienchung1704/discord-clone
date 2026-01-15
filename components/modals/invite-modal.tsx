"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState } from "react";
import { useModal } from "@/components/hooks/user-model-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, RefreshCcw, Users } from "lucide-react";
import { useOrigin } from "@/components/hooks/use-origin";
import axios from "axios";
import { useTranslations } from "next-intl";

export const InviteModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const origin = useOrigin();
  const t = useTranslations("Server");

  const isModalOpen = isOpen && type === "invite";
  const { server } = data;
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  const onNew = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(`/api/servers/${server?.id}/invite-code`);
      onOpen("invite", { server: response.data });
    } catch (error) {
      console.error("Failed to generate new invite link:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center font-bold">
            {t("inviteTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("inviteDescription", { name: server?.name || "" })}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
            {t("inviteLink")}
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading}
              readOnly
              className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-zinc-800 dark:text-zinc-200 font-mono text-sm"
              value={inviteUrl}
            />
            <Button
              disabled={isLoading}
              onClick={onCopy}
              size="icon"
              className={`transition-all duration-200 ${copied
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-indigo-500 hover:bg-indigo-600'
                } text-white`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <Button
            onClick={onNew}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 mt-3 px-0 transition-colors"
          >
            <RefreshCcw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t("generateLink")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


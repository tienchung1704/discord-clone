"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState } from "react";
import { useModal } from "@/components/hooks/user-model-store";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export const LeaveServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter()
  const isModalOpen = isOpen && type === "leaveServer";
  const { server } = data;
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Server");
  const tCommon = useTranslations("Common");

  const onClick = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/servers/${server?.id}/leave`);
      onClose();
      router.refresh();
      router.push("/")
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center font-bold">
            {t("leaveTitle")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("leaveConfirm", { name: server?.name ?? "" })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="bg-zinc-50 dark:bg-[#2b2d31] px-6 py-4">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="ghost"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              {tCommon("cancel")}
            </Button>
            <Button
              disabled={isLoading}
              onClick={onClick}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
            >
              {t("leaveButton")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


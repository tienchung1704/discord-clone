"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import qs from "query-string";
import { useState } from "react";
import { useModal } from "@/components/hooks/user-model-store";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Hash, Trash2 } from "lucide-react";

export const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter()
  const isModalOpen = isOpen && type === "deleteChannel";
  const { server, channel } = data;
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id
        }
      })
      await axios.delete(url);
      onClose();
      router.refresh();
      router.push(`/servers/${server?.id}`);
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center font-bold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete <span className="font-semibold text-rose-500 inline-flex items-center"><Hash className="w-3.5 h-3.5" />{channel?.name}</span>? This action cannot be undone.
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
              Cancel
            </Button>
            <Button 
              disabled={isLoading} 
              onClick={onClick} 
              className="bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
            >
              Delete Channel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

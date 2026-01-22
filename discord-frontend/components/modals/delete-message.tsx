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
import { Trash2 } from "lucide-react";

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "deleteMessage";
  const { apiUrl, query } = data;
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      await axios.delete(url);
      onClose();

    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl text-center font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete this message? This action cannot be undone.
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
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

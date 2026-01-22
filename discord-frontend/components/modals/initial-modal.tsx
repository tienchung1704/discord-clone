"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/hooks/user-model-store";
import { Globe, Home, Link2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required." }),
  imageUrl: z.string().min(1, { message: "Server image is required." }),
});

export function InitialModal() {
  const [isMounted, setIsMounted] = useState(false);
  const { onOpen, onClose } = useModal();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/servers", values);

      form.reset();
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  
  const onClick = () => {
    onClose();
    router.refresh();
    onOpen("joinServer");
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="pt-8 px-6 pb-0">
          <DialogTitle className="text-2xl text-center font-bold">
            Create Your Server
          </DialogTitle>
          <DialogDescription className="text-center">
            Your server is where you and your friends hang out. Make yours and start talking.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 px-6 py-4">
            <Button
              type="button"
              className="w-full h-14 justify-start gap-3 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700/50 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all duration-200 group"
              disabled={isLoading}
              variant="outline"
              onClick={() => onOpen("createStartServer")}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-semibold">Create My Own</span>
            </Button>
            
            <Button
              type="button"
              className="w-full h-14 justify-start gap-3 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700/50 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all duration-200 group"
              disabled={isLoading}
              variant="outline"
              onClick={() => onOpen("publicServer")}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-white group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-semibold">Create for a Community</span>
            </Button>
          </form>
        </Form>
        
        <DialogFooter className="bg-zinc-50 dark:bg-[#2b2d31] w-full px-6 py-5 flex-col gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center w-full">
            Already have an invite link?
          </p>
          <Button
            className="w-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
            onClick={onClick}
            variant="secondary"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Join a Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

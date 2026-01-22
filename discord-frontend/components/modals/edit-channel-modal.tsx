"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Hash, Mic, Settings, Video } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import qs from "query-string";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/hooks/user-model-store";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChannelType } from "@/lib/generated/prisma";

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name is required.",
    })
    .refine((name) => name !== "general", {
      message: "Channel name cannot be 'general'",
    }),
  type: z.nativeEnum(ChannelType),
});

const channelTypeIcons = {
  [ChannelType.TEXT]: <Hash className="w-4 h-4" />,
  [ChannelType.AUDIO]: <Mic className="w-4 h-4" />,
  [ChannelType.VIDEO]: <Video className="w-4 h-4" />,
};

export const EditChanelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "editChannel";
  const { channel, server } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT,
    },
  });

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [form, channel]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.patch(url, values);

      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[480px] p-0 overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <DialogHeader className="pt-8 px-6 pb-2">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 dark:from-zinc-600 dark:to-zinc-800 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center font-bold">
            Edit Channel
          </DialogTitle>
          <DialogDescription className="text-center">
            Update your channel settings and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter channel name"
                        className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500" />
                  </FormItem>
                )}
              />
              
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
                    Channel Type
                  </FormLabel>
                  <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200 capitalize">
                        <SelectValue placeholder="Select channel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      {Object.values(ChannelType).map((type) => (
                        <SelectItem 
                          key={type} 
                          value={type} 
                          className="capitalize cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          <div className="flex items-center gap-2">
                            {channelTypeIcons[type]}
                            {type.toLowerCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-rose-500" />
                </FormItem>
              )} />
            </div>
            
            <DialogFooter className="bg-zinc-50 dark:bg-[#2b2d31] px-6 py-4">
              <Button 
                disabled={isLoading} 
                className="bg-indigo-500 dark:bg-zinc-700 dark:text-white hover:bg-indigo-600 text-white font-medium transition-colors"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
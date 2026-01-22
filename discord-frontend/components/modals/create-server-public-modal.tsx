"use client";

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/hooks/user-model-store";
import { FileUpload } from "../file-upload";

const formSchema = z.object({
    name: z.string().min(1, { message: "Server name is required." }),
    imageUrl: z.string().min(1, { message: "Server image is required." }),
});

export function CreatePublicServerModal() {
    const { isOpen, onClose, type, hobbyServer } = useModal();
    const router = useRouter();
    const isModalOpen = isOpen && type === "createPublicServer";
    
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
            const payload = {
                ...values,
                hobbyServer,
                isPublic: true,
            };
            await axios.post("/api/servers", payload);

            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6 pb-2">
                    <div className="flex items-center justify-center mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl text-center font-bold">
                        Create Public Server
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Create a public server that anyone can discover and join.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-6 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
                                            Server Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Enter server name"
                                                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-rose-500" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <div className="bg-zinc-50 dark:bg-[#2b2d31] px-6 py-4 flex flex-col items-center gap-3">
                            <Button 
                                disabled={isLoading} 
                                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
                            >
                                Create Public Server
                            </Button>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                                By creating a public server, you agree to our{" "}
                                <span className="text-indigo-500 dark:text-indigo-400 cursor-pointer hover:underline">
                                    Community Guidelines
                                </span>
                            </p>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

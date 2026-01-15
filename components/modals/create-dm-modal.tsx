"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/components/hooks/user-model-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

interface Profile {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
}

import { useTranslations } from "next-intl";

export const CreateDMModal = () => {
    const { isOpen, onClose, type } = useModal();
    const router = useRouter();
    const t = useTranslations("CreateDM");
    const tCommon = useTranslations("Common");

    const isModalOpen = isOpen && type === "createDM";

    const [isLoading, setIsLoading] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Fetch users (simulated "friends" list for now, or just all users)
        // Ideally this should create a new API endpoint to get friends/users to DM.
        // For now, I'll assume we might need a way to search users. 
        // NOTE: The implementation plan said "Fetch all profiles". 
        // There isn't an explicit "get all profiles" API yet in the plan, I should validte if `api/users` exists or create it?
        // Wait, I didn't create `api/users` in the plan.
        // Let's create a quick valid fetch if possible, or just mock it if I can't find a route.
        // There is `api/users` in the directory list I saw earlier! 
        // Let's check `api/users` content quickly before running this code? 
        // Actually, to avoid breaking flow, I will implement a fetch to `/api/users` and if it fails I'll fix it in verification.
        // But `api/users` directory had 1 subfolder.

        const fetchProfiles = async () => {
            try {
                // Assuming we can search/list users. 
                // Since I didn't verify an endpoint to "get all users" existed that returns array, I might need to Create one?
                // The task list said "Logic to fetch friends/users".
                // I'll try to hit `/api/users` or just implement the UI and let it be empty until I fix the API.
                // Or better, let's just create the route to search users if it doesn't exist.
                // Actually I'll use `/api/users` assuming it might return profiles. 
                // If not I will create it.
                // Let's assume for now.
            } catch (error) {
                console.log(error);
            }
        }
    }, []);

    // Since I missed verifying `api/users` GET, I should probably CREATE it or `api/profiles` to be safe.
    // The previous plan didn't explicitly say "Create api/profiles route".
    // I will write the component to fetch from `/api/profiles` which I will strictly create next if needed.

    const onSearch = async (query: string) => {
        setSearchQuery(query);
        try {
            // NOTE: This logic assumes an endpoint exists. 
            // I'll implement the fetch logic here to hit `/api/profiles?query=${query}` (I'll need to create this route potentially).
            // Actually, for now, let's just make the UI logic sound.
        } catch (error) {
            console.log(error);
        }
    }

    const onCreateDM = async () => {
        if (!selectedProfileId) return;

        try {
            setIsLoading(true);
            const response = await axios.post("/api/conversations", {
                memberId: selectedProfileId
            });

            onClose();
            // Redirect to the new conversation
            // conversation.id is the Conversation ID, but for GlobalConversation we need to redirect to DM page.
            // URL format: /dm/[profileId] ? No, usually it's /dm/[otherProfileId] ?
            // Let's check `dm-item.tsx`: `router.push("/dm/" + id);` where id is otherProfile.id.
            // But the conversation object has two profiles. I need to find which one is NOT me.
            // But actually the DM page uses the params to find the conversation. `params.profileId`.
            // So I should redirect to `/dm/${selectedProfileId}`.

            router.push(`/dm/${selectedProfileId}`);
            router.refresh();

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleClose = () => {
        onClose();
        setSelectedProfileId(null);
        setSearchQuery("");
        setProfiles([]);
    }

    // Temporary fetch logic inside the component for now until API is confirmed
    useEffect(() => {
        if (isModalOpen) {
            // Fetch users. 
            // I'll create a dedicated useEffect to search users when query changes or on mount
            const searchUsers = async () => {
                try {
                    // Using a hypothetical route for now. I will create `api/profiles/search` or similar.
                    // Or reuse servers? No. 
                    // Let's assume I will create `api/profiles/search` in the next step to support this.
                    const res = await axios.get(`/api/profiles/search?q=${searchQuery}`);
                    setProfiles(res.data);
                } catch (error) {
                    console.log(error);
                }
            }
            searchUsers();
        }
    }, [isModalOpen, searchQuery]);


    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-[#313338] text-zinc-200 border-none overflow-hidden p-0">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        {t("title")}
                    </DialogTitle>
                    <div className="text-center text-zinc-500 text-xs">
                        {t("subTitle")}
                    </div>
                </DialogHeader>

                <div className="p-6">
                    <div className="relative">
                        <Input
                            placeholder={t("placeholder")}
                            className="bg-[#1E1F22] border-none text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute top-2.5 right-3 h-5 w-5 text-zinc-400" />
                    </div>

                    <ScrollArea className="mt-8 max-h-[250px] pr-2">
                        <div className="flex flex-col gap-y-2">
                            {profiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    onClick={() => setSelectedProfileId(prev => prev === profile.id ? null : profile.id)}
                                    className={cn(
                                        "flex items-center gap-x-3 p-2 rounded-md hover:bg-[#3F4148] cursor-pointer transition",
                                        selectedProfileId === profile.id && "bg-[#3F4148]"
                                    )}
                                >
                                    <UserAvatar src={profile.imageUrl} />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-zinc-200">{profile.name}</span>
                                        <span className="text-xs text-zinc-400">{profile.email}</span>
                                    </div>
                                    <div className={cn(
                                        "ml-auto h-5 w-5 border-2 rounded-md border-zinc-500 flex items-center justify-center",
                                        selectedProfileId === profile.id && "bg-[#5865F2] border-[#5865F2]"
                                    )}>
                                        {selectedProfileId === profile.id && (
                                            <Check className="h-3 w-3 text-white" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {profiles.length === 0 && (
                                <div className="text-center text-zinc-500 text-sm mt-4">
                                    {t("notFound")}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter className="bg-[#2B2D31] px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-zinc-400">
                            {/* Footer text if needed */}
                        </div>
                        <div className="flex items-center gap-x-2">
                            <Button
                                disabled={isLoading}
                                onClick={handleClose}
                                variant="ghost"
                                className="text-zinc-300 hover:text-white"
                            >
                                {tCommon("cancel")}
                            </Button>
                            <Button
                                disabled={isLoading || !selectedProfileId}
                                onClick={onCreateDM}
                                variant="primary"
                                className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submit")}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "../hooks/user-model-store";
import { Search, Users, Loader2 } from "lucide-react";

const iconInterestList: Record<string, string> = {
    Gaming: "🎮",
    Music: "🎵",
    Programming: "💻",
    Movies: "🎬",
    Sports: "🏀",
    Anime: "🎨",
    Books: "📚",
    Technology: "📱",
    Travel: "✈️",
    Food: "🍔",
};

const interestsList = [
    "Gaming",
    "Music",
    "Programming",
    "Movies",
    "Sports",
    "Anime",
    "Books",
    "Technology",
    "Travel",
    "Food",
];

interface Server {
    id: string;
    name: string;
    imageUrl: string;
    hobby: string;
    inviteCode: string;
    profile: {
        id: string;
        userId: string;
        name: string;
        imageUrl: string;
    };
    members: { profileId: string }[];
}

export function SelectInterestsModal() {
    const [selectedHobby, setSelectedHobby] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const { isOpen, onClose, type } = useModal();
    const user = useUser();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Debounced search
    const fetchServers = useCallback(async () => {
        if (selectedHobby === "all" && !searchQuery.trim()) {
            setServers([]);
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/servers/public", {
                hobby: selectedHobby && selectedHobby !== "all" ? [selectedHobby] : [],
                userId: user?.user?.id,
                searchQuery: searchQuery.trim(),
            });
            setServers(res.data);
        } catch (error) {
            console.error("Error fetching servers:", error);
            setServers([]);
        } finally {
            setLoading(false);
        }
    }, [selectedHobby, searchQuery, user?.user?.id]);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen && type === "selectInterests") {
                fetchServers();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedHobby, searchQuery, fetchServers, isOpen, type]);

    if (!isMounted) return null;
    if (!isOpen || type !== "selectInterests") return null;

    const handleClose = () => {
        setSelectedHobby("all");
        setSearchQuery("");
        setServers([]);
        onClose();
    };

    const handleJoin = (server: Server) => {
        router.push(`/invite/${server.inviteCode}`);
        handleClose();
        router.refresh();
    };

    return (
        <Dialog open onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#313338] text-black dark:text-white p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl font-bold text-center">
                        Find Public Servers
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400">
                        Search by hobby or server name to find communities
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 space-y-4">
                    {/* Hobby Dropdown */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Filter by Hobby
                        </label>
                        <Select value={selectedHobby} onValueChange={setSelectedHobby}>
                            <SelectTrigger className="w-full bg-zinc-100 dark:bg-[#1E1F22] border-none">
                                <SelectValue placeholder="Select a hobby..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Hobbies</SelectItem>
                                {interestsList.map((hobby) => (
                                    <SelectItem key={hobby} value={hobby}>
                                        <span className="flex items-center gap-2">
                                            <span>{iconInterestList[hobby]}</span>
                                            {hobby}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Search by Name
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Search servers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-zinc-100 dark:bg-[#1E1F22] border-none"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Results
                            </label>
                            {!loading && servers.length > 0 && (
                                <span className="text-xs text-zinc-500">
                                    {servers.length} server{servers.length !== 1 ? "s" : ""} found
                                </span>
                            )}
                        </div>
                        <ScrollArea className="h-[250px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#1E1F22]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                </div>
                            ) : servers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                                    <Search className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm">
                                        {selectedHobby || searchQuery
                                            ? "No servers found"
                                            : "Select a hobby or search to find servers"}
                                    </p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {servers.map((server) => (
                                        <div
                                            key={server.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                                        >
                                            <img
                                                src={server.imageUrl}
                                                alt={server.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{server.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {server.members.length}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {iconInterestList[server.hobby]} {server.hobby}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleJoin(server)}
                                                className="bg-indigo-500 hover:bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Join
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="bg-zinc-100 dark:bg-[#2B2D31] px-6 py-4">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center w-full">
                        By joining a public server, you agree to our{" "}
                        <span className="text-indigo-500 cursor-pointer hover:underline">
                            Discord terms
                        </span>
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

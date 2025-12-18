"use client"

import { Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// Lazy load emoji-mart components to reduce initial bundle size
// Requirements: 12.2 - WHEN loading emoji picker THEN the Discord_Clone SHALL lazy load the emoji-mart library
const Picker = dynamic(
    () => import("@emoji-mart/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center w-[352px] h-[435px]">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
        ),
    }
);

interface EmojiPickerProps {
    onChange: (value: string) => void;
}

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
    const { resolvedTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [emojiData, setEmojiData] = useState<any>(null);

    // Lazy load emoji data only when picker is opened
    useEffect(() => {
        if (isOpen && !emojiData) {
            import("@emoji-mart/data").then((mod) => {
                setEmojiData(mod.default);
            });
        }
    }, [isOpen, emojiData]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
                <Smile className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
            </PopoverTrigger>
            <PopoverContent side="right" sideOffset={40} className="bg-transparent border-none shadow-none drop-shadow-none mb-16">
                {emojiData ? (
                    <Picker 
                        theme={resolvedTheme} 
                        data={emojiData} 
                        onEmojiSelect={(emoji: any) => onChange(emoji.native)} 
                    />
                ) : (
                    <div className="flex items-center justify-center w-[352px] h-[435px] bg-white dark:bg-zinc-900 rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

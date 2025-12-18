"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Base64 blur placeholder - a small indigo gradient that matches the fallback color
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzYzNjZmMSIvPjwvc3ZnPg==";

interface UserAvatarProps {
    src?: string;
    className?: string;
    fallback?: string;
}

export const UserAvatar = ({ src, className, fallback }: UserAvatarProps) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Determine avatar size from className for responsive sizes prop
    const getAvatarSize = () => {
        if (className?.includes("h-8")) return 32;
        if (className?.includes("h-10")) return 40;
        if (className?.includes("h-12")) return 48;
        if (className?.includes("h-16")) return 64;
        if (className?.includes("h-20")) return 80;
        return 40; // default
    };

    const size = getAvatarSize();

    // Generate responsive sizes based on display size
    // Request 2x for retina displays
    const sizes = `(max-width: 768px) ${Math.round(size * 0.7)}px, ${size}px`;

    return (
        <Avatar className={cn("h-7 w-7 md:h-10 md:w-10 relative", className)}>
            {src && !hasError ? (
                <>
                    <Image
                        src={src}
                        alt={fallback || "Avatar"}
                        fill
                        className={cn(
                            "object-cover rounded-full transition-opacity duration-300",
                            isLoaded ? "opacity-100" : "opacity-0"
                        )}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        sizes={sizes}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                    />
                    {/* Show blur placeholder while loading */}
                    {!isLoaded && (
                        <div 
                            className="absolute inset-0 rounded-full bg-indigo-500/50 animate-pulse"
                            aria-hidden="true"
                        />
                    )}
                </>
            ) : (
                <AvatarFallback className="bg-indigo-500 text-white text-xs">
                    {fallback?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
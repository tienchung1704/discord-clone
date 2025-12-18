"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "../ui/action-tooltip";

// Base64 blur placeholder - a small gray gradient for server icons
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSIxMiIgZmlsbD0iIzM3NDE1MSIvPjwvc3ZnPg==";

interface NavigationItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export const NavigationItem = ({ id, name, imageUrl }: NavigationItemProps) => {
  const params = useParams();
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const onClick = () => {
    router.push(`/servers/${id}`);
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={onClick} className="group relative flex items-center">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId !== id && "group-hover:h-[16px]",
            params?.serverId === id ? "h-[28px]" : "h-[6px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[40px] w-[40px] rounded-[20px] group-hover:rounded-[12px] transition-all overflow-hidden",
            params?.serverId === id &&
              "bg-primary/10 text-primary rounded-[12px]"
          )}
        >
          {!hasError ? (
            <>
              <Image
                src={imageUrl}
                alt={name}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
                  isLoaded ? "opacity-100" : "opacity-0"
                )}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="40px"
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
              />
              {/* Show blur placeholder while loading */}
              {!isLoaded && (
                <div 
                  className="absolute inset-0 bg-zinc-700 animate-pulse"
                  aria-hidden="true"
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-zinc-700 text-white text-sm font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </button>
    </ActionTooltip>
  );
};

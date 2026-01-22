"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Circle, Moon, MinusCircle, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";

type UserStatus = "ONLINE" | "IDLE" | "DND" | "OFFLINE";

const statusConfig: Record<UserStatus, { label: string; color: string; icon: React.ReactNode }> = {
  ONLINE: {
    label: "Online",
    color: "bg-emerald-500",
    icon: <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" />,
  },
  IDLE: {
    label: "Idle",
    color: "bg-yellow-500",
    icon: <Moon className="h-3 w-3 fill-yellow-500 text-yellow-500" />,
  },
  DND: {
    label: "Do Not Disturb",
    color: "bg-rose-500",
    icon: <MinusCircle className="h-3 w-3 fill-rose-500 text-rose-500" />,
  },
  OFFLINE: {
    label: "Invisible",
    color: "bg-zinc-500",
    icon: <CircleOff className="h-3 w-3 text-zinc-500" />,
  },
};

export const StatusSelector = () => {
  const [status, setStatus] = useState<UserStatus>("ONLINE");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("/api/users/status");
        if (res.data?.status) {
          setStatus(res.data.status);
        }
      } catch {
        // Default to ONLINE if fetch fails
      }
    };
    fetchStatus();
  }, []);

  const updateStatus = async (newStatus: UserStatus) => {
    if (status === newStatus || isLoading) return;
    
    setIsLoading(true);
    try {
      await axios.patch("/api/users/status", { status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center h-[40px] w-[40px] rounded-full transition-all",
            "bg-zinc-700 hover:bg-zinc-600",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn("h-4 w-4 rounded-full", currentStatus.color)} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="center" className="w-48">
        {(Object.keys(statusConfig) as UserStatus[]).map((key) => {
          const config = statusConfig[key];
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => updateStatus(key)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                status === key && "bg-zinc-100 dark:bg-zinc-800"
              )}
            >
              {config.icon}
              <span>{config.label}</span>
              {status === key && (
                <span className="ml-auto text-xs text-zinc-500">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

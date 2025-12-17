"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center h-[40px] w-[40px] rounded-full transition-all",
            "bg-zinc-700 hover:bg-zinc-600",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500"
          )}
        >
          <Sun className="h-5 w-5 text-zinc-200 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 absolute" />
          <Moon className="h-5 w-5 text-zinc-200 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="center" className="w-36">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={cn("flex items-center gap-2 cursor-pointer", theme === "light" && "bg-zinc-100 dark:bg-zinc-800")}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto text-xs text-zinc-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={cn("flex items-center gap-2 cursor-pointer", theme === "dark" && "bg-zinc-100 dark:bg-zinc-800")}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto text-xs text-zinc-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={cn("flex items-center gap-2 cursor-pointer", theme === "system" && "bg-zinc-100 dark:bg-zinc-800")}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto text-xs text-zinc-500">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

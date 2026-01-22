import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full min-w-0 rounded-lg px-3 py-2 text-sm",
        // Colors
        "bg-zinc-100 dark:bg-zinc-800",
        "text-zinc-900 dark:text-zinc-100",
        "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
        // Border
        "border border-zinc-200 dark:border-zinc-700",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent",
        // Transition
        "transition-all duration-200",
        // File input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-700 dark:file:text-zinc-300",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-200 dark:disabled:bg-zinc-900",
        // Selection
        "selection:bg-indigo-500 selection:text-white",
        className
      )}
      {...props}
    />
  )
}

export { Input }

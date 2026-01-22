"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white dark:bg-[#313338]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}

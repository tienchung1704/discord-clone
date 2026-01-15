"use client";

import { Plus } from "lucide-react";
import { useModal } from "@/components/hooks/user-model-store";

export const CreateDMAction = () => {
    const { onOpen } = useModal();

    return (
        <button
            onClick={() => onOpen("createDM")}
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
        >
            <Plus className="h-4 w-4" />
        </button>
    );
}

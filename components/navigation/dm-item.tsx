"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

interface DMItemProps {
    id: string;
    imageUrl: string;
    name: string;
}

export const DMItem = ({
    id,
    imageUrl,
    name
}: DMItemProps) => {
    const params = useParams();
    const router = useRouter();

    const onClick = () => {
        router.push(`/dm/${id}`);
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
                params?.profileId === id && "bg-zinc-700/20 dark:bg-zinc-700"
            )}
        >
            <UserAvatar
                src={imageUrl}
                className="h-8 w-8 md:h-8 md:w-8"
            />
            <p
                className={cn(
                    "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                    params?.profileId === id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
                )}
            >
                {name}
            </p>
        </button>
    )
}

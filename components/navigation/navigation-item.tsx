"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "../ui/action-tooltip";

interface NavigationItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export const NavigationItem = ({ id, name, imageUrl }: NavigationItemProps) => {
  const params = useParams();
  const router = useRouter();

    const onClick= () => {
        router.push(`/servers/${id}`);
    }

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
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      </button>
    </ActionTooltip>
  );
};

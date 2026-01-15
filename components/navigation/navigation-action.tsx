"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "../ui/action-tooltip";
import { useModal } from "../hooks/user-model-store";
import Image from "next/image";
import discordPng from "@/public/discord.png"
import { useTranslations } from "next-intl";

export const NavigationAction = () => {
    const { onOpen } = useModal();
    const t = useTranslations("Navigation");

    return (
        <div>
            {/*           <div>
            <ActionTooltip
                side="right"
                align="center"
                label="Dircect messages"
            >
                <button onClick={() => onOpen("createServer")} className="group flex items-center">
                    <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-800 group-hover:bg-emerald-500">
                        <Image src={discordPng} alt="dm" className="rounded-full" />
                    </div>
                </button>
            </ActionTooltip>
            </div> */}
            <div className="mt-3">
                <ActionTooltip
                    side="right"
                    align="center"
                    label={t("addServer")}
                >
                    <button onClick={() => onOpen("createServer")} className="group flex items-center">
                        <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-800 group-hover:bg-emerald-500">
                            <Plus
                                className="group-hover:text-white transition text-emerald-500"
                            />
                        </div>
                    </button>
                </ActionTooltip>
            </div>
        </div>
    )
}
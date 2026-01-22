"use client";

import { ActionTooltip } from "../ui/action-tooltip";
import Image from "next/image";
import discordPng from "@/public/discord.png"
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export const NavigationDM = () => {
    const router = useRouter();
    const t = useTranslations("Navigation");

    const onClick = () => {
        router.push("/dm");
    }

    return (
        <div>
            <ActionTooltip
                side="right"
                align="center"
                label={t("directMessages")}
            >
                <button onClick={onClick} className="group flex items-center">
                    <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-800 group-hover:bg-emerald-500">
                        <Image
                            src={discordPng}
                            alt={t("directMessages")}
                            width={48}
                            height={48}
                            className="rounded-full transition-all group-hover:bg-emerald-500"
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    )
}


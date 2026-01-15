import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DMItem } from "./dm-item";
import { Separator } from "@/components/ui/separator";
import { CreateDMAction } from "./create-dm-action";

import { getTranslations } from "next-intl/server";

export const DMSidebar = async () => {
    const profile = await currentProfile();
    const t = await getTranslations("Sidebar");

    if (!profile) {
        return redirect("/");
    }

    const conversations = await db.globalConversation.findMany({
        where: {
            OR: [
                { profileOneId: profile.id },
                { profileTwoId: profile.id }
            ]
        },
        include: {
            profileOne: true,
            profileTwo: true
        },
        orderBy: {
            updatedAt: "desc"
        }
    });

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <div className="flex items-center h-12 border-b-2 border-zinc-200 dark:border-zinc-700 px-3 w-full shadow-sm text-md">
                {t("findOrStart")}
            </div>
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <div className="flex items-center gap-x-2 mb-2 justify-between px-2">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">{t("directMessages")}</p>
                        <CreateDMAction />
                    </div>
                    {conversations.map((conversation) => {
                        const otherProfile = conversation.profileOneId === profile.id
                            ? conversation.profileTwo
                            : conversation.profileOne;

                        return (
                            <DMItem
                                key={conversation.id}
                                id={otherProfile.id}
                                name={otherProfile.name}
                                imageUrl={otherProfile.imageUrl}
                            />
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

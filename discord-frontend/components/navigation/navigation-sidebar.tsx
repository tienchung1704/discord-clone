import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-action";
import { NavigationDM } from "./navigation-dm";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { StatusSelector } from "./status-selector";
import { LanguageSwitcher } from "./language-switcher";

export const NanigationSideBar = async () => {
    const profile = await currentProfile();
    if (!profile) {
        return redirect("/");
    }
    const servers = await db.server.findMany({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        },
    })
    return (
        <div className="flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3 overflow-hidden">
            <NavigationDM />
            <Separator
                className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto my-3"
            />
            <ScrollArea className="flex-1 w-full overflow-y-auto">
                <div className="flex flex-col items-center gap-y-2">
                    {servers.map((server) => (
                        <NavigationItem
                            key={server.id}
                            id={server.id}
                            name={server.name}
                            imageUrl={server.imageUrl}
                        />
                    ))}
                    <NavigationAction />
                </div>
            </ScrollArea>
            <Separator
                className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto my-3"
            />
            <div className="flex flex-col items-center gap-y-3 pb-1">
                <ModeToggle />
                <LanguageSwitcher />
                <StatusSelector />
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "h-[40px] w-[40px]",
                        }
                    }}
                />
            </div>
        </div>
    )
}
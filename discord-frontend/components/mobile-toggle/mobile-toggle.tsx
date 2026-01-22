
import { Menu } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NanigationSideBar } from "@/components/navigation/navigation-sidebar"
import { ServerSidebar } from "@/components/server/server-siderbar"
import { DMSidebar } from "@/components/navigation/dm-sidebar"


import { getTranslations } from "next-intl/server";

export const MobileToggle = async ({ serverId }: { serverId?: string }) => {
    const t = await getTranslations("MobileToggle");

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("menu")}>
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0" >
                <div className="w-[72px]">
                    <NanigationSideBar />
                </div>
                {serverId ? (
                    <ServerSidebar serverId={serverId} />
                ) : (
                    <DMSidebar />
                )}
            </SheetContent >
        </Sheet>
    )
}
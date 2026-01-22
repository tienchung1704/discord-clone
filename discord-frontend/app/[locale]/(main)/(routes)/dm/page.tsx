

import { MobileToggle } from "@/components/mobile-toggle/mobile-toggle";
import { getTranslations } from "next-intl/server";

const DMPage = async () => {
    const t = await getTranslations("Sidebar");

    return (
        <div className="flex flex-col h-full items-center justify-center text-zinc-500 dark:text-zinc-400 relative">
            <div className="md:hidden absolute top-4 left-4">
                <MobileToggle />
            </div>
            <p className="text-xl font-semibold">
                {t("findOrStart")}
            </p>
        </div>
    );
}

export default DMPage;

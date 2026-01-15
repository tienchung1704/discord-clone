"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { ActionTooltip } from "@/components/ui/action-tooltip";

const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

export const LanguageSwitcher = () => {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations("Language");

    const currentLanguage = languages.find((lang) => lang.code === locale);

    const switchLocale = (newLocale: string) => {
        if (!pathname) return;
        // Replace the current locale in the pathname with the new locale
        const segments = pathname.split("/");
        if (languages.some((lang) => lang.code === segments[1])) {
            segments[1] = newLocale;
        } else {
            segments.splice(1, 0, newLocale);
        }
        const newPath = segments.join("/");
        router.push(newPath);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-transparent border-0 h-[40px] w-[40px] rounded-full flex items-center justify-center hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
                >
                    <ActionTooltip side="right" align="center" label={t("language")}>
                        <div className="flex items-center justify-center text-xl">
                            {currentLanguage?.flag || <Globe className="h-5 w-5" />}
                        </div>
                    </ActionTooltip>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center" className="w-40">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={`flex items-center gap-2 cursor-pointer ${locale === lang.code ? "bg-zinc-100 dark:bg-zinc-800" : ""
                            }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

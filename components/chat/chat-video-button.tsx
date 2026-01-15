"use client";

import React from "react";
import { Video, VideoOff } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useTranslations } from "next-intl";

import { ActionTooltip } from "../ui/action-tooltip";

export function ChatVideoButton() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const t = useTranslations("Chat");

  const isVideo = searchParams?.get("video");

  const Icon = isVideo ? VideoOff : Video;
  const tooltipLabel = isVideo ? t("endVideoCall") : t("startVideoCall");

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathName || "",
        query: {
          video: isVideo ? undefined : true
        }
      },
      { skipNull: true }
    );

    router.push(url);
  };

  return (
    <ActionTooltip side="bottom" label={tooltipLabel}>
      <button
        onClick={onClick}
        className="hover:opacity-75 transition mr-4"
      >
        <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
}
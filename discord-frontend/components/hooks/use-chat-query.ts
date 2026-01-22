import qs from "query-string";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected, lastDisconnectTime } = useSocket();
  const queryClient = useQueryClient();
  const wasDisconnectedRef = useRef(false);
  const previousDisconnectTimeRef = useRef<number | null>(null);

  const fetchMessages = async ({ pageParam }: { pageParam: string | null }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam ?? undefined,
          [paramKey]: paramValue
        }
      },
      { skipNull: true }
    );

    const res = await fetch(url);
    return res.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000,
      initialPageParam: null,
    });

  // Sync missed messages on reconnection
  useEffect(() => {
    // Track disconnection state
    if (!isConnected) {
      wasDisconnectedRef.current = true;
    }

    // When reconnected after a disconnection, refetch to sync missed messages
    if (isConnected && wasDisconnectedRef.current) {
      // Only refetch if the disconnect time has changed (new reconnection)
      if (lastDisconnectTime !== previousDisconnectTimeRef.current) {
        console.log("[ChatQuery] Reconnected, syncing missed messages for:", queryKey);
        // Invalidate and refetch to get any missed messages
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        refetch();
        previousDisconnectTimeRef.current = lastDisconnectTime;
      }
      wasDisconnectedRef.current = false;
    }
  }, [isConnected, lastDisconnectTime, queryKey, queryClient, refetch]);

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
};

"use client";

import { useState, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import qs from "query-string";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useDebounce } from "@/components/hooks/use-debounce";
import { format } from "date-fns";

interface SearchResult {
  messageId: string;
  content: string;
  highlightedContent: string;
  author: {
    name: string;
    imageUrl: string;
  };
  timestamp: string;
  channelId: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalCount: number;
}

interface MessageSearchProps {
  channelId: string;
  onResultClick: (messageId: string) => void;
  onClose: () => void;
  position?: "absolute" | "fixed";
}

const DATE_FORMAT = "MMM d, yyyy 'at' h:mm a";

export const MessageSearch = ({
  channelId,
  onResultClick,
  onClose,
  position = "absolute"
}: MessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const fetchSearchResults = useCallback(async (): Promise<SearchResponse | null> => {
    if (!debouncedQuery.trim()) return null;

    const url = qs.stringifyUrl({
      url: "/api/messages/search",
      query: {
        query: debouncedQuery,
        channelId
      }
    });

    const res = await fetch(url);
    if (!res.ok) throw new Error("Search failed");
    return res.json();
  }, [debouncedQuery, channelId]);


  const { data, isLoading, isError } = useQuery({
    queryKey: ["message-search", channelId, debouncedQuery],
    queryFn: fetchSearchResults,
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30000, // Cache results for 30 seconds
  });

  const handleResultClick = (messageId: string) => {
    onResultClick(messageId);
    onClose();
  };

  const positionClasses = position === "fixed"
    ? "fixed top-14 right-64 z-50"
    : "absolute top-12 right-0 z-50";

  return (
    <div className={`${positionClasses} w-80 md:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-[500px] overflow-hidden flex flex-col`}>
      {/* Search Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-8 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading && debouncedQuery.trim() && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-4 text-center text-sm text-red-500">
            Failed to search messages. Please try again.
          </div>
        )}

        {/* Empty Query State */}
        {!debouncedQuery.trim() && !isLoading && (
          <div className="p-8 text-center text-sm text-zinc-500">
            Type to search messages in this channel
          </div>
        )}

        {/* No Results State */}
        {data && data.results.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-500">No messages found</p>
            <p className="text-xs text-zinc-400 mt-1">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {/* Results List */}
        {data && data.results.length > 0 && (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {data.results.map((result) => (
              <button
                key={result.messageId}
                onClick={() => handleResultClick(result.messageId)}
                className="w-full p-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <UserAvatar
                    src={result.author.imageUrl}
                    className="h-8 w-8 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {result.author.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {format(new Date(result.timestamp), DATE_FORMAT)}
                      </span>
                    </div>
                    <p
                      className="text-sm text-zinc-600 dark:text-zinc-300 truncate mt-0.5"
                      dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        {data && data.results.length > 0 && (
          <div className="p-2 text-center text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-700">
            {data.totalCount} result{data.totalCount !== 1 ? "s" : ""} found
          </div>
        )}
      </div>
    </div>
  );
};

"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Exponential backoff retry delay function
 * Calculates delay as: min(1000 * 2^attempt, 30000)
 * Attempt 0: 1000ms, Attempt 1: 2000ms, Attempt 2: 4000ms, etc.
 * Max delay capped at 30 seconds
 */
export const exponentialBackoffDelay = (attemptIndex: number): number => {
    return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
};

/**
 * Creates optimized QueryClient configuration
 * - staleTime: 60000ms (1 minute) - reduces unnecessary refetches
 * - gcTime: 300000ms (5 minutes) - improves navigation performance
 * - retry: 3 attempts with exponential backoff
 * - refetchOnWindowFocus: false - prevents unwanted refetches
 */
export const createQueryClientConfig = () => ({
    defaultOptions: {
        queries: {
            staleTime: 60000,           // 1 minute - Requirements 1.1
            gcTime: 300000,             // 5 minutes - Requirements 1.2
            retry: 3,                   // Requirements 1.4
            retryDelay: exponentialBackoffDelay,
            refetchOnWindowFocus: false,
        },
    },
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient(createQueryClientConfig()));
    
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Cree un wrapper QueryClientProvider pour renderHook.
 * Chaque appel retourne un nouveau QueryClient (isolation entre tests).
 */
export function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    }

    return { wrapper: Wrapper, queryClient };
}

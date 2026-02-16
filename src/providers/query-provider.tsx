"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                    },
                },
                mutationCache: new MutationCache({
                    onError: (error) => {
                        console.error("[Mutation error]", error);
                        toast.error("Erreur", {
                            description: error instanceof Error ? error.message : "Une erreur est survenue",
                        });
                    },
                }),
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="top-right"
                theme="dark"
                richColors
                closeButton
            />
        </QueryClientProvider>
    );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
    const { data: user, isLoading } = useQuery({
        queryKey: ["auth", "user"],
        queryFn: async () => {
            const supabase = createClient();
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    return { user: user ?? null, isLoading };
}

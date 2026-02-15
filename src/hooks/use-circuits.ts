"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const circuitKeys = {
    all: ["circuits"] as const,
};

export function useCircuits() {
    return useQuery({
        queryKey: circuitKeys.all,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("circuits")
                .select("*")
                .order("country")
                .order("name");
            if (error) throw error;
            return data;
        },
    });
}

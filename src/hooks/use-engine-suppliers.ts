"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const engineSupplierKeys = {
    all: ["engine-suppliers"] as const,
    bySeason: (seasonId: string) => ["engine-suppliers", { seasonId }] as const,
};

export function useEngineSuppliers(seasonId: string) {
    return useQuery({
        queryKey: engineSupplierKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("engine_suppliers")
                .select("*")
                .eq("season_id", seasonId)
                .order("name");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

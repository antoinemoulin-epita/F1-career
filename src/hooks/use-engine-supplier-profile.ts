"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const engineSupplierProfileKeys = {
    profile: (id: string) => ["engine-supplier-profile", id] as const,
    history: (name: string, universeId: string) => ["engine-supplier-history", name, universeId] as const,
};

export function useEngineSupplierProfile(id: string) {
    return useQuery({
        queryKey: engineSupplierProfileKeys.profile(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("engine_suppliers")
                .select("*, season:seasons(year, universe_id)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useEngineSupplierHistory(name: string, universeId: string) {
    return useQuery({
        queryKey: engineSupplierProfileKeys.history(name, universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_engine_supplier_history")
                .select("*")
                .eq("name", name)
                .eq("universe_id", universeId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!name && !!universeId,
    });
}

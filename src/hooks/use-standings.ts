"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { standingsKeys } from "@/hooks/use-race-results";

const supabase = createClient();

// ─── Queries ────────────────────────────────────────────────────────────────

export function useDriverStandings(seasonId: string) {
    return useQuery({
        queryKey: standingsKeys.drivers(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_current_standings_drivers")
                .select("*")
                .eq("season_id", seasonId)
                .order("position");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useConstructorStandings(seasonId: string) {
    return useQuery({
        queryKey: standingsKeys.constructors(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_current_standings_constructors")
                .select("*")
                .eq("season_id", seasonId)
                .order("position");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { standingsKeys } from "@/hooks/use-race-results";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────────────────────

export const narrativeArcKeys = {
    all: ["narrative-arcs"] as const,
    byUniverse: (universeId: string) => ["narrative-arcs", { universeId }] as const,
};

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

export function useNarrativeArcs(universeId: string) {
    return useQuery({
        queryKey: narrativeArcKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("narrative_arcs")
                .select("*")
                .eq("universe_id", universeId)
                .neq("status", "resolved")
                .order("importance", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const circuitProfileKeys = {
    profile: (circuitId: string) => ["circuit-profile", circuitId] as const,
    raceHistory: (circuitId: string) => ["circuit-race-history", circuitId] as const,
};

export function useCircuitProfile(circuitId: string) {
    return useQuery({
        queryKey: circuitProfileKeys.profile(circuitId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_circuit_profile")
                .select("*")
                .eq("circuit_id", circuitId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!circuitId,
    });
}

export function useCircuitRaceHistory(circuitId: string) {
    return useQuery({
        queryKey: circuitProfileKeys.raceHistory(circuitId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("calendar")
                .select("id, weather, round_number, season:seasons(year), podiums:race_results(finish_position, driver:drivers(first_name, last_name))")
                .eq("circuit_id", circuitId)
                .order("round_number", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!circuitId,
    });
}

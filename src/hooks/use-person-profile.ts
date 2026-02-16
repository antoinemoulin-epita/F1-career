"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const personProfileKeys = {
    career: (personId: string) => ["person-career", personId] as const,
    seasons: (personId: string) => ["person-seasons", personId] as const,
    raceHistory: (personId: string) => ["person-race-history", personId] as const,
    transfers: (personId: string) => ["person-transfers", personId] as const,
    arcs: (personId: string) => ["person-arcs", personId] as const,
};

export function usePersonProfile(personId: string) {
    return useQuery({
        queryKey: personProfileKeys.career(personId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_person_career")
                .select("*")
                .eq("person_id", personId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!personId,
    });
}

export function usePersonSeasons(personId: string) {
    return useQuery({
        queryKey: personProfileKeys.seasons(personId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_person_seasons")
                .select("*")
                .eq("person_id", personId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!personId,
    });
}

export function usePersonRaceHistory(personId: string) {
    return useQuery({
        queryKey: personProfileKeys.raceHistory(personId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_person_race_history")
                .select("*")
                .eq("person_id", personId)
                .order("year", { ascending: false })
                .order("round_number", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!personId,
    });
}

export function usePersonTransfers(personId: string) {
    return useQuery({
        queryKey: personProfileKeys.transfers(personId),
        queryFn: async () => {
            // Get all driver IDs for this person
            const { data: drivers } = await supabase
                .from("drivers")
                .select("id")
                .eq("person_id", personId);
            if (!drivers || drivers.length === 0) return [];
            const driverIds = drivers.map((d) => d.id);
            const { data, error } = await supabase
                .from("transfers")
                .select("*, season:seasons(year), from_team:teams!transfers_from_team_id_fkey(name, color_primary), to_team:teams!transfers_to_team_id_fkey(name, color_primary)")
                .in("driver_id", driverIds)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!personId,
    });
}

export function usePersonArcs(personId: string) {
    return useQuery({
        queryKey: personProfileKeys.arcs(personId),
        queryFn: async () => {
            // Get all driver IDs for this person
            const { data: drivers } = await supabase
                .from("drivers")
                .select("id")
                .eq("person_id", personId);
            if (!drivers || drivers.length === 0) return [];
            const driverIds = drivers.map((d) => d.id);
            const { data, error } = await supabase
                .from("narrative_arcs")
                .select("*, started_season:seasons!narrative_arcs_started_season_id_fkey(year)")
                .contains("related_driver_ids", driverIds.slice(0, 1))
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!personId,
    });
}

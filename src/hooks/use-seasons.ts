"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CreateSeasonForm } from "@/types";
import { universeKeys } from "./use-universes";

const supabase = createClient();

export const seasonKeys = {
    all: ["seasons"] as const,
    byUniverse: (universeId: string) => ["seasons", { universeId }] as const,
    detail: (id: string) => ["seasons", id] as const,
    current: (universeId: string) => ["seasons", "current", universeId] as const,
};

export function useSeasons(universeId: string) {
    return useQuery({
        queryKey: seasonKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("seasons")
                .select("*")
                .eq("universe_id", universeId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

export function useSeason(id: string) {
    return useQuery({
        queryKey: seasonKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("seasons")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCurrentSeason(universeId: string) {
    return useQuery({
        queryKey: seasonKeys.current(universeId),
        queryFn: async () => {
            const { data: universe, error: uError } = await supabase
                .from("universes")
                .select("current_season_id")
                .eq("id", universeId)
                .single();
            if (uError) throw uError;
            if (!universe.current_season_id) return null;

            const { data, error } = await supabase
                .from("seasons")
                .select("*")
                .eq("id", universe.current_season_id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

export function useCreateSeason() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (form: CreateSeasonForm) => {
            const { data, error } = await supabase
                .from("seasons")
                .insert({
                    universe_id: form.universe_id,
                    year: form.year,
                    gp_count: form.gp_count ?? null,
                    quali_laps: form.quali_laps ?? null,
                    race_laps: form.race_laps ?? null,
                })
                .select()
                .single();
            if (error) throw error;

            // Set as current season on the universe
            const { error: updateError } = await supabase
                .from("universes")
                .update({ current_season_id: data.id })
                .eq("id", form.universe_id);
            if (updateError) throw updateError;

            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: seasonKeys.byUniverse(data.universe_id) });
            queryClient.invalidateQueries({ queryKey: seasonKeys.current(data.universe_id) });
            queryClient.invalidateQueries({ queryKey: universeKeys.detail(data.universe_id) });
        },
    });
}

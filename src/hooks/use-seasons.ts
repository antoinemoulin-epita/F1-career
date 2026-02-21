"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CreateSeasonForm } from "@/types";
import { universeKeys } from "./use-universes";
import { calendarKeys } from "./use-calendar";
import { standingsKeys } from "./use-race-results";

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

/**
 * Reinitialise une saison : supprime resultats courses/qualifs et classements,
 * remet le calendrier a "scheduled" et la saison a "preparation".
 */
export function useResetSeason() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { seasonId: string }) => {
            const { seasonId } = input;

            // 1. Get all calendar entry IDs for this season
            const { data: entries, error: calError } = await supabase
                .from("calendar")
                .select("id")
                .eq("season_id", seasonId);
            if (calError) throw calError;

            const raceIds = (entries ?? []).map((e) => e.id);

            if (raceIds.length > 0) {
                // 2. Delete race_results
                const { error: rrError } = await supabase
                    .from("race_results")
                    .delete()
                    .in("race_id", raceIds);
                if (rrError) throw rrError;

                // 3. Delete qualifying_results
                const { error: qrError } = await supabase
                    .from("qualifying_results")
                    .delete()
                    .in("race_id", raceIds);
                if (qrError) throw qrError;

                // 4. Reset calendar entries to "scheduled"
                const { error: calResetError } = await supabase
                    .from("calendar")
                    .update({ status: "scheduled" })
                    .eq("season_id", seasonId);
                if (calResetError) throw calResetError;
            }

            // 5. Delete standings_drivers
            const { error: sdError } = await supabase
                .from("standings_drivers")
                .delete()
                .eq("season_id", seasonId);
            if (sdError) throw sdError;

            // 6. Delete standings_constructors
            const { error: scError } = await supabase
                .from("standings_constructors")
                .delete()
                .eq("season_id", seasonId);
            if (scError) throw scError;

            // 7. Reset season status to "preparation"
            const { error: seasonError } = await supabase
                .from("seasons")
                .update({ status: "preparation" })
                .eq("id", seasonId);
            if (seasonError) throw seasonError;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: seasonKeys.detail(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: calendarKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: standingsKeys.drivers(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: standingsKeys.constructors(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: ["race-results-season", { seasonId: variables.seasonId }] });
            queryClient.invalidateQueries({ queryKey: ["qualifying-results"] });
        },
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

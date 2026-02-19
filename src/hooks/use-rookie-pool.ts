"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { driverKeys } from "./use-drivers";
import type { RookiePoolFormValues } from "@/lib/validators";
import type { RookiePool } from "@/types";

const supabase = createClient();

export const rookiePoolKeys = {
    all: ["rookie-pool"] as const,
    byUniverse: (universeId: string) => ["rookie-pool", { universeId }] as const,
};

export function useRookiePool(universeId: string) {
    return useQuery({
        queryKey: rookiePoolKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("rookie_pool")
                .select("*")
                .eq("universe_id", universeId)
                .order("last_name");
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

function normalizeForm(form: RookiePoolFormValues) {
    return {
        first_name: form.first_name?.trim() || null,
        last_name: form.last_name.trim(),
        nationality: form.nationality?.trim() || null,
        birth_year: form.birth_year ?? null,
        note: form.note ?? null,
        potential_min: form.potential_min,
        potential_max: form.potential_max,
        available_from_year: form.available_from_year ?? null,
    };
}

export function useCreateRookie() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ universeId, form }: { universeId: string; form: RookiePoolFormValues }) => {
            const { data, error } = await supabase
                .from("rookie_pool")
                .insert({ universe_id: universeId, ...normalizeForm(form) })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: rookiePoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useUpdateRookie() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, universeId, form }: { id: string; universeId: string; form: RookiePoolFormValues }) => {
            const { data, error } = await supabase
                .from("rookie_pool")
                .update(normalizeForm(form))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: rookiePoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useDeleteRookie() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; universeId: string }) => {
            const { error } = await supabase
                .from("rookie_pool")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: rookiePoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useDeleteRookies() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids }: { ids: string[]; universeId: string }) => {
            const { error } = await supabase
                .from("rookie_pool")
                .delete()
                .in("id", ids);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: rookiePoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useDraftRookie() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            rookieId,
            seasonId,
            teamId,
            teamName,
            universeId,
            rookie,
            currentYear,
        }: {
            rookieId: string;
            seasonId: string;
            teamId: string;
            teamName: string;
            universeId: string;
            rookie: RookiePool;
            currentYear: number | null;
        }) => {
            // Calculate note: base note minus penalty for early arrival
            const baseNote = rookie.note ?? 1;
            let penalty = 0;
            if (currentYear && rookie.available_from_year && currentYear < rookie.available_from_year) {
                penalty = rookie.available_from_year - currentYear;
            }
            const driverNote = Math.max(1, baseNote - penalty);

            // 1. Create a driver in the target season
            const { error: driverError } = await supabase
                .from("drivers")
                .insert({
                    season_id: seasonId,
                    first_name: rookie.first_name,
                    last_name: rookie.last_name,
                    nationality: rookie.nationality,
                    birth_year: rookie.birth_year,
                    is_rookie: true,
                    note: driverNote,
                    potential_min: rookie.potential_min,
                    potential_max: rookie.potential_max,
                    team_id: teamId,
                    years_in_team: 1,
                    contract_years_remaining: 3,
                })
                .select()
                .single();
            if (driverError) throw driverError;

            // 2. Mark rookie as drafted
            const { data, error: rookieError } = await supabase
                .from("rookie_pool")
                .update({
                    drafted: true,
                    drafted_season_id: seasonId,
                    drafted_team_name: teamName,
                })
                .eq("id", rookieId)
                .select()
                .single();
            if (rookieError) throw rookieError;

            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: rookiePoolKeys.byUniverse(variables.universeId) });
            queryClient.invalidateQueries({ queryKey: driverKeys.bySeason(variables.seasonId) });
        },
    });
}

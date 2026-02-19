"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { historyKeys } from "./use-history";
import type { HistoryChampionFormValues } from "@/lib/validators";

const supabase = createClient();

function normalizeForm(form: HistoryChampionFormValues) {
    return {
        year: form.year,
        champion_driver_name: form.champion_driver_name.trim(),
        champion_driver_team: form.champion_driver_team?.trim() || null,
        champion_driver_points: form.champion_driver_points ?? null,
        champion_team_name: form.champion_team_name?.trim() || null,
        champion_team_points: form.champion_team_points ?? null,
        season_summary: form.season_summary?.trim() || null,
    };
}

export function useCreateChampion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ universeId, form }: { universeId: string; form: HistoryChampionFormValues }) => {
            const { data, error } = await supabase
                .from("history_champions")
                .insert({ universe_id: universeId, ...normalizeForm(form) })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: historyKeys.champions(variables.universeId) });
        },
    });
}

export function useUpdateChampion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, universeId, form }: { id: string; universeId: string; form: HistoryChampionFormValues }) => {
            const { data, error } = await supabase
                .from("history_champions")
                .update(normalizeForm(form))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: historyKeys.champions(variables.universeId) });
        },
    });
}

export function useDeleteChampion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; universeId: string }) => {
            const { error } = await supabase
                .from("history_champions")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: historyKeys.champions(variables.universeId) });
        },
    });
}

export function useDeleteChampions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids }: { ids: string[]; universeId: string }) => {
            const { error } = await supabase
                .from("history_champions")
                .delete()
                .in("id", ids);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: historyKeys.champions(variables.universeId) });
        },
    });
}

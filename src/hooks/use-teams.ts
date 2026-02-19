"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TeamFormValues } from "@/lib/validators";

const supabase = createClient();

export const teamKeys = {
    all: ["teams"] as const,
    bySeason: (seasonId: string) => ["teams", { seasonId }] as const,
    detail: (id: string) => ["teams", id] as const,
};

export function useTeams(seasonId: string) {
    return useQuery({
        queryKey: teamKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_teams_with_budget")
                .select("*")
                .eq("season_id", seasonId)
                .order("name");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useTeam(id: string) {
    return useQuery({
        queryKey: teamKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("teams")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

function normalizeForm(form: TeamFormValues) {
    return {
        name: form.name.trim(),
        short_name: form.short_name?.trim() || null,
        nationality: form.nationality?.trim() || null,
        color_primary: form.color_primary?.trim() || null,
        color_secondary: form.color_secondary?.trim() || null,
        engineer_level: form.engineer_level ?? null,
        engine_supplier_id: form.engine_supplier_id ?? null,
        is_factory_team: form.is_factory_team ?? false,
        shareholders: form.shareholders?.trim() || null,
        owner_investment: form.owner_investment ?? null,
        sponsor_investment: form.sponsor_investment ?? null,
        surperformance_bonus: form.surperformance_bonus ?? null,
        title_sponsor: form.title_sponsor?.trim() || null,
        sponsor_duration: form.sponsor_duration ?? null,
        sponsor_objective: form.sponsor_objective?.trim() || null,
    };
}

export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ seasonId, form }: { seasonId: string; form: TeamFormValues }) => {
            const { data, error } = await supabase
                .from("teams")
                .insert({ season_id: seasonId, ...normalizeForm(form) })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, seasonId, form }: { id: string; seasonId: string; form: TeamFormValues }) => {
            const { data, error } = await supabase
                .from("teams")
                .update(normalizeForm(form))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return { ...data, seasonId };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.id) });
        },
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; seasonId: string }) => {
            const { error } = await supabase
                .from("teams")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useDeleteTeams() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids }: { ids: string[]; seasonId: string }) => {
            const { error } = await supabase
                .from("teams")
                .delete()
                .in("id", ids);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.bySeason(variables.seasonId) });
        },
    });
}

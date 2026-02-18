"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { SponsorObjectiveFormValues } from "@/lib/validators/sponsor-objective";

const supabase = createClient();

export const sponsorObjectiveKeys = {
    all: ["sponsor-objectives"] as const,
    byTeamSeason: (teamId: string, seasonId: string) =>
        ["sponsor-objectives", { teamId, seasonId }] as const,
    bySeason: (seasonId: string) =>
        ["sponsor-objectives", { seasonId }] as const,
};

export function useSponsorObjectives(teamId: string, seasonId: string) {
    return useQuery({
        queryKey: sponsorObjectiveKeys.byTeamSeason(teamId, seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sponsor_objectives")
                .select("*")
                .eq("team_id", teamId)
                .eq("season_id", seasonId)
                .order("created_at");
            if (error) throw error;
            return data;
        },
        enabled: !!teamId && !!seasonId,
    });
}

export function useSeasonSponsorObjectives(seasonId: string) {
    return useQuery({
        queryKey: sponsorObjectiveKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sponsor_objectives")
                .select("*")
                .eq("season_id", seasonId)
                .order("created_at");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useCreateSponsorObjective() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            teamId,
            seasonId,
            form,
        }: {
            teamId: string;
            seasonId: string;
            form: SponsorObjectiveFormValues;
        }) => {
            const { data, error } = await supabase
                .from("sponsor_objectives")
                .insert({
                    team_id: teamId,
                    season_id: seasonId,
                    objective_type: form.objective_type,
                    target_value: form.target_value ?? null,
                    target_entity_id: form.target_entity_id ?? null,
                    description: form.description?.trim() || null,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: sponsorObjectiveKeys.byTeamSeason(variables.teamId, variables.seasonId),
            });
            queryClient.invalidateQueries({
                queryKey: sponsorObjectiveKeys.bySeason(variables.seasonId),
            });
        },
    });
}

export function useUpdateSponsorObjective() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            seasonId,
            updates,
        }: {
            id: string;
            seasonId: string;
            updates: { is_met?: boolean; evaluated_value?: number | null };
        }) => {
            const { data, error } = await supabase
                .from("sponsor_objectives")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: sponsorObjectiveKeys.bySeason(variables.seasonId),
            });
        },
    });
}

export function useDeleteSponsorObjective() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; teamId: string; seasonId: string }) => {
            const { error } = await supabase
                .from("sponsor_objectives")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: sponsorObjectiveKeys.byTeamSeason(variables.teamId, variables.seasonId),
            });
            queryClient.invalidateQueries({
                queryKey: sponsorObjectiveKeys.bySeason(variables.seasonId),
            });
        },
    });
}

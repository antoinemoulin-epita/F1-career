"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { NarrativeArcFormValues } from "@/lib/validators";

const supabase = createClient();

export const narrativeArcKeys = {
    all: ["narrative-arcs"] as const,
    byUniverse: (universeId: string) => ["narrative-arcs", { universeId }] as const,
};

/** Active arcs only (excludes resolved), ordered by importance desc. */
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

/** All arcs (including resolved), ordered by status then importance desc. */
export function useAllNarrativeArcs(universeId: string) {
    return useQuery({
        queryKey: [...narrativeArcKeys.byUniverse(universeId), "all"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("narrative_arcs")
                .select("*")
                .eq("universe_id", universeId)
                .order("status")
                .order("importance", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

export function useCreateArc() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            universeId,
            form,
        }: {
            universeId: string;
            form: NarrativeArcFormValues;
        }) => {
            const { data, error } = await supabase
                .from("narrative_arcs")
                .insert({
                    universe_id: universeId,
                    name: form.name.trim(),
                    description: form.description?.trim() || null,
                    arc_type: form.arc_type,
                    status: form.status,
                    importance: form.importance,
                    related_driver_ids: form.related_driver_ids ?? [],
                    related_team_ids: form.related_team_ids ?? [],
                    started_season_id: form.started_season_id ?? null,
                    started_round: form.started_round ?? null,
                    resolved_season_id: form.resolved_season_id ?? null,
                    resolved_round: form.resolved_round ?? null,
                    resolution_summary: form.resolution_summary?.trim() || null,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: narrativeArcKeys.byUniverse(variables.universeId),
            });
        },
    });
}

export function useUpdateArc() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            universeId,
            form,
        }: {
            id: string;
            universeId: string;
            form: Partial<NarrativeArcFormValues>;
        }) => {
            const payload: Record<string, unknown> = {};
            if (form.name !== undefined) payload.name = form.name.trim();
            if (form.description !== undefined)
                payload.description = form.description?.trim() || null;
            if (form.arc_type !== undefined) payload.arc_type = form.arc_type;
            if (form.status !== undefined) payload.status = form.status;
            if (form.importance !== undefined) payload.importance = form.importance;
            if (form.related_driver_ids !== undefined)
                payload.related_driver_ids = form.related_driver_ids;
            if (form.related_team_ids !== undefined)
                payload.related_team_ids = form.related_team_ids;
            if (form.started_season_id !== undefined)
                payload.started_season_id = form.started_season_id ?? null;
            if (form.started_round !== undefined)
                payload.started_round = form.started_round ?? null;
            if (form.resolved_season_id !== undefined)
                payload.resolved_season_id = form.resolved_season_id ?? null;
            if (form.resolved_round !== undefined)
                payload.resolved_round = form.resolved_round ?? null;
            if (form.resolution_summary !== undefined)
                payload.resolution_summary = form.resolution_summary?.trim() || null;

            const { data, error } = await supabase
                .from("narrative_arcs")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: narrativeArcKeys.byUniverse(variables.universeId),
            });
        },
    });
}

export function useDeleteArc() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; universeId: string }) => {
            const { error } = await supabase
                .from("narrative_arcs")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: narrativeArcKeys.byUniverse(variables.universeId),
            });
        },
    });
}

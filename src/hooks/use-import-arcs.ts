"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { narrativeArcKeys } from "./use-narrative-arcs";
import type { NarrativeArcFormValues } from "@/lib/validators";

const supabase = createClient();

export function useImportArcs() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            universeId,
            rows,
        }: {
            universeId: string;
            rows: NarrativeArcFormValues[];
        }) => {
            const payload = rows.map((form) => ({
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
            }));

            const { data, error } = await supabase
                .from("narrative_arcs")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: narrativeArcKeys.byUniverse(variables.universeId),
            });
            toast.success(`${data.length} arc${data.length > 1 ? "s" : ""} importe${data.length > 1 ? "s" : ""}`);
        },
    });
}

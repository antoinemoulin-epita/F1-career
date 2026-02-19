"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { historyKeys } from "./use-history";
import type { HistoryChampionImportValues } from "@/lib/validators/history-champion-import";

const supabase = createClient();

export function useImportHistoryChampions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            universeId,
            rows,
        }: {
            universeId: string;
            rows: HistoryChampionImportValues[];
        }) => {
            const payload = rows.map((row) => ({
                universe_id: universeId,
                year: row.year,
                champion_driver_name: row.driver_name.trim(),
                champion_driver_team: row.driver_team?.trim() || null,
                champion_driver_points: row.driver_points ?? null,
                champion_team_name: row.team_name?.trim() || null,
                champion_team_points: row.team_points ?? null,
                summary: row.summary?.trim() || null,
            }));

            const { data, error } = await supabase
                .from("history_champions")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: historyKeys.champions(variables.universeId),
            });
            toast.success(`${data.length} saison${data.length > 1 ? "s" : ""} importee${data.length > 1 ? "s" : ""}`);
        },
    });
}

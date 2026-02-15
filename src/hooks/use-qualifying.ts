"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { calendarKeys } from "@/hooks/use-calendar";

const supabase = createClient();

export const qualifyingKeys = {
    all: ["qualifying"] as const,
    byRace: (raceId: string) => ["qualifying", { raceId }] as const,
};

export const raceKeys = {
    detail: (raceId: string) => ["race", raceId] as const,
};

export function useRace(raceId: string) {
    return useQuery({
        queryKey: raceKeys.detail(raceId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("calendar")
                .select("*, circuit:circuits(*)")
                .eq("id", raceId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!raceId,
    });
}

export function useQualifying(raceId: string) {
    return useQuery({
        queryKey: qualifyingKeys.byRace(raceId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("qualifying_results")
                .select("*, driver:v_drivers_with_effective(*)")
                .eq("race_id", raceId)
                .order("position");
            if (error) throw error;
            return data;
        },
        enabled: !!raceId,
    });
}

export function useSaveQualifying() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            raceId,
            seasonId,
            driverIds,
        }: {
            raceId: string;
            seasonId: string;
            driverIds: string[];
        }) => {
            // 1. Delete existing qualifying results for this race
            const { error: deleteError } = await supabase
                .from("qualifying_results")
                .delete()
                .eq("race_id", raceId);
            if (deleteError) throw deleteError;

            // 2. Bulk insert new positions
            const rows = driverIds.map((driverId, index) => ({
                race_id: raceId,
                driver_id: driverId,
                position: index + 1,
            }));
            const { error: insertError } = await supabase
                .from("qualifying_results")
                .insert(rows);
            if (insertError) throw insertError;

            // 3. Update calendar status to qualifying_done
            const { error: updateError } = await supabase
                .from("calendar")
                .update({ status: "qualifying_done" })
                .eq("id", raceId);
            if (updateError) throw updateError;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: qualifyingKeys.byRace(variables.raceId) });
            queryClient.invalidateQueries({ queryKey: raceKeys.detail(variables.raceId) });
            queryClient.invalidateQueries({ queryKey: calendarKeys.bySeason(variables.seasonId) });
        },
    });
}

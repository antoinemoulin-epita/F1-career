"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { calculateRainProbability } from "@/lib/calculations/rain-probability";
import type { Circuit } from "@/types";

const supabase = createClient();

export const calendarKeys = {
    all: ["calendar"] as const,
    bySeason: (seasonId: string) => ["calendar", { seasonId }] as const,
};

export function useCalendar(seasonId: string) {
    return useQuery({
        queryKey: calendarKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("calendar")
                .select("*, circuit:circuits(*)")
                .eq("season_id", seasonId)
                .order("round_number");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useAddRace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            circuit,
            currentCount,
        }: {
            seasonId: string;
            circuit: Circuit;
            currentCount: number;
        }) => {
            const rainProbability = calculateRainProbability(circuit.base_rain_probability);

            const { data, error } = await supabase
                .from("calendar")
                .insert({
                    season_id: seasonId,
                    circuit_id: circuit.id,
                    round_number: currentCount + 1,
                    rain_probability: rainProbability,
                })
                .select("*, circuit:circuits(*)")
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useRemoveRace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            seasonId,
            remainingIds,
        }: {
            id: string;
            seasonId: string;
            remainingIds: string[];
        }) => {
            const { error } = await supabase
                .from("calendar")
                .delete()
                .eq("id", id);
            if (error) throw error;

            // Renumber remaining entries using two-phase approach
            // to avoid UNIQUE(season_id, round_number) constraint violations
            if (remainingIds.length > 0) {
                // Phase 1: offset to temporary high values
                const phase1 = await Promise.all(
                    remainingIds.map((entryId, index) =>
                        supabase
                            .from("calendar")
                            .update({ round_number: index + 1 + 10000 })
                            .eq("id", entryId),
                    ),
                );
                const phase1Error = phase1.find((r) => r.error)?.error;
                if (phase1Error) throw phase1Error;

                // Phase 2: set correct values
                const phase2 = await Promise.all(
                    remainingIds.map((entryId, index) =>
                        supabase
                            .from("calendar")
                            .update({ round_number: index + 1 })
                            .eq("id", entryId),
                    ),
                );
                const phase2Error = phase2.find((r) => r.error)?.error;
                if (phase2Error) throw phase2Error;
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useReorderRaces() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            orderedIds,
        }: {
            seasonId: string;
            orderedIds: string[];
        }) => {
            // Two-phase approach to avoid UNIQUE(season_id, round_number)
            // constraint violations when swapping positions.

            // Phase 1: offset all round_numbers to temporary high values
            const phase1 = await Promise.all(
                orderedIds.map((id, index) =>
                    supabase
                        .from("calendar")
                        .update({ round_number: index + 1 + 10000 })
                        .eq("id", id),
                ),
            );
            const phase1Error = phase1.find((r) => r.error)?.error;
            if (phase1Error) throw phase1Error;

            // Phase 2: set the correct values
            const phase2 = await Promise.all(
                orderedIds.map((id, index) =>
                    supabase
                        .from("calendar")
                        .update({ round_number: index + 1 })
                        .eq("id", id),
                ),
            );
            const phase2Error = phase2.find((r) => r.error)?.error;
            if (phase2Error) throw phase2Error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.bySeason(variables.seasonId) });
        },
    });
}

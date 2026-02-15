"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { computeDriverPredictions, computeConstructorPredictions } from "@/lib/calculations/predictions";
import { seasonKeys } from "@/hooks/use-seasons";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────────────────────

export const predictionKeys = {
    all: ["predictions"] as const,
    drivers: (seasonId: string) => ["predictions", "drivers", { seasonId }] as const,
    constructors: (seasonId: string) => ["predictions", "constructors", { seasonId }] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useDriverPredictions(seasonId: string) {
    return useQuery({
        queryKey: predictionKeys.drivers(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("predictions_drivers")
                .select("*, driver:v_drivers_with_effective(*)")
                .eq("season_id", seasonId)
                .order("predicted_position");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useConstructorPredictions(seasonId: string) {
    return useQuery({
        queryKey: predictionKeys.constructors(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("predictions_constructors")
                .select("*, team:v_teams_with_budget(*)")
                .eq("season_id", seasonId)
                .order("predicted_position");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

// ─── Generate predictions mutation ──────────────────────────────────────────

export function useGeneratePredictions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ seasonId }: { seasonId: string }) => {
            // 1. Fetch drivers with effective notes
            const { data: drivers, error: driversError } = await supabase
                .from("v_drivers_with_effective")
                .select("*")
                .eq("season_id", seasonId);
            if (driversError) throw driversError;

            // 2. Fetch team IDs for this season
            const { data: teams, error: teamsError } = await supabase
                .from("teams")
                .select("id")
                .eq("season_id", seasonId);
            if (teamsError) throw teamsError;

            const teamIds = teams.map((t) => t.id);

            // 3. Fetch cars with stats
            let cars: { team_id: string | null; total: number | null }[] = [];
            if (teamIds.length > 0) {
                const { data: carsData, error: carsError } = await supabase
                    .from("v_cars_with_stats")
                    .select("*")
                    .in("team_id", teamIds);
                if (carsError) throw carsError;
                cars = carsData;
            }

            // 4. Compute predictions
            const driverPredictions = computeDriverPredictions(drivers, cars);
            const constructorPredictions = computeConstructorPredictions(drivers, cars);

            // 5. Delete existing predictions for this season
            const { error: delDrivers } = await supabase
                .from("predictions_drivers")
                .delete()
                .eq("season_id", seasonId);
            if (delDrivers) throw delDrivers;

            const { error: delConstructors } = await supabase
                .from("predictions_constructors")
                .delete()
                .eq("season_id", seasonId);
            if (delConstructors) throw delConstructors;

            // 6. Insert new driver predictions
            if (driverPredictions.length > 0) {
                const { error: insDrivers } = await supabase
                    .from("predictions_drivers")
                    .insert(
                        driverPredictions.map((p) => ({
                            season_id: seasonId,
                            driver_id: p.driver_id,
                            predicted_position: p.predicted_position,
                            score: p.score,
                        })),
                    );
                if (insDrivers) throw insDrivers;
            }

            // 7. Insert new constructor predictions
            if (constructorPredictions.length > 0) {
                const { error: insConstructors } = await supabase
                    .from("predictions_constructors")
                    .insert(
                        constructorPredictions.map((p) => ({
                            season_id: seasonId,
                            team_id: p.team_id,
                            predicted_position: p.predicted_position,
                            score: p.score,
                        })),
                    );
                if (insConstructors) throw insConstructors;
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: predictionKeys.drivers(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: predictionKeys.constructors(variables.seasonId) });
        },
    });
}

// ─── Lock predictions mutation ──────────────────────────────────────────────

export function useLockPredictions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ seasonId }: { seasonId: string }) => {
            const { error } = await supabase
                .from("seasons")
                .update({ predictions_locked: true })
                .eq("id", seasonId);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: seasonKeys.detail(variables.seasonId) });
        },
    });
}

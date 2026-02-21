"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { driverKeys } from "@/hooks/use-drivers";
import { teamKeys } from "@/hooks/use-teams";
import { carKeys } from "@/hooks/use-cars";
import { engineSupplierKeys } from "@/hooks/use-engine-suppliers";
import { seasonKeys } from "@/hooks/use-seasons";
import { universeKeys } from "@/hooks/use-universes";
import { staffKeys } from "@/hooks/use-staff";

const supabase = createClient();

// ─── Types ──────────────────────────────────────────────────────────────────

export type DriverEvolution = {
    driver_id: string;
    potential_change: number; // from surperformance
    decline: number; // -1 if age ≥ 35, else 0
    progression: number; // +1 if age ≤ 26 and note < potential_final, else 0
    champion_bonus: number; // +1 if champion, else 0
    rookie_reveal: number | null; // revealed potential_final, or null if not revealing
};

export type TeamBudgetChange = {
    team_id: string;
    surperformance_delta: number; // +1, -1, or 0
};

export type SponsorEvaluation = {
    objective_id: string;
    is_met: boolean;
    evaluated_value: number | null;
};

export type ArchiveInput = {
    seasonId: string;
    universeId: string;
    year: number;
    championDriverId: string | null;
    championDriverName: string | null;
    championDriverPoints: number | null;
    championDriverTeam: string | null;
    championTeamId: string | null;
    championTeamName: string | null;
    championTeamPoints: number | null;
    seasonSummary: string | null;
    driverEvolutions: DriverEvolution[];
    teamBudgetChanges: TeamBudgetChange[];
    contractDecrements: boolean;
    sponsorEvaluations: SponsorEvaluation[];
};

// ─── Archive season mutation ────────────────────────────────────────────────

export function useArchiveSeason() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: ArchiveInput) => {
            const { data, error } = await supabase.rpc("fn_archive_season", {
                p_payload: {
                    season_id: input.seasonId,
                    universe_id: input.universeId,
                    year: input.year,
                    champion_driver_id: input.championDriverId,
                    champion_driver_name: input.championDriverName,
                    champion_driver_points: input.championDriverPoints,
                    champion_driver_team: input.championDriverTeam,
                    champion_team_id: input.championTeamId,
                    champion_team_name: input.championTeamName,
                    champion_team_points: input.championTeamPoints,
                    season_summary: input.seasonSummary,
                    driver_evolutions: input.driverEvolutions.map((evo) => ({
                        driver_id: evo.driver_id,
                        potential_change: evo.potential_change,
                        decline: evo.decline,
                        progression: evo.progression,
                        champion_bonus: evo.champion_bonus,
                        rookie_reveal: evo.rookie_reveal,
                    })),
                    team_budget_changes: input.teamBudgetChanges.map((c) => ({
                        team_id: c.team_id,
                        surperformance_delta: c.surperformance_delta,
                    })),
                    contract_decrements: input.contractDecrements,
                    sponsor_evaluations: input.sponsorEvaluations.map((e) => ({
                        objective_id: e.objective_id,
                        is_met: e.is_met,
                        evaluated_value: e.evaluated_value,
                    })),
                },
            });
            if (error) throw error;
            return { seasonId: input.seasonId, universeId: input.universeId, result: data };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: driverKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: teamKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: staffKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: seasonKeys.detail(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: seasonKeys.byUniverse(variables.universeId) });
            queryClient.invalidateQueries({ queryKey: universeKeys.detail(variables.universeId) });
        },
    });
}

// ─── Create next season mutation ────────────────────────────────────────────

type CreateNextSeasonInput = {
    seasonId: string;
    universeId: string;
    year: number;
};

export function useCreateNextSeason() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ seasonId, universeId, year }: CreateNextSeasonInput) => {
            const { data, error } = await supabase.rpc("fn_create_next_season", {
                p_payload: {
                    season_id: seasonId,
                    universe_id: universeId,
                    year,
                },
            });
            if (error) throw error;
            return { newSeasonId: (data as unknown as { new_season_id: string }).new_season_id };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: seasonKeys.byUniverse(variables.universeId) });
            queryClient.invalidateQueries({ queryKey: seasonKeys.current(variables.universeId) });
            queryClient.invalidateQueries({ queryKey: universeKeys.detail(variables.universeId) });
            queryClient.invalidateQueries({ queryKey: driverKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: teamKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: carKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: engineSupplierKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: staffKeys.bySeason(variables.seasonId) });
        },
    });
}

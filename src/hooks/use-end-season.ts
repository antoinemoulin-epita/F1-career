"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { driverKeys } from "@/hooks/use-drivers";
import { teamKeys } from "@/hooks/use-teams";
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
};

// ─── Archive season mutation ────────────────────────────────────────────────

export function useArchiveSeason() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: ArchiveInput) => {
            const {
                seasonId,
                universeId,
                year,
                driverEvolutions,
                teamBudgetChanges,
            } = input;

            // 1. Insert history_champions record
            const { error: historyError } = await supabase
                .from("history_champions")
                .insert({
                    universe_id: universeId,
                    year,
                    champion_driver_id: input.championDriverId,
                    champion_driver_name: input.championDriverName,
                    champion_driver_points: input.championDriverPoints,
                    champion_driver_team: input.championDriverTeam,
                    champion_team_id: input.championTeamId,
                    champion_team_name: input.championTeamName,
                    champion_team_points: input.championTeamPoints,
                    season_summary: input.seasonSummary,
                });
            if (historyError) throw historyError;

            // 2. Apply driver evolutions
            for (const evo of driverEvolutions) {
                const totalNoteChange =
                    evo.potential_change + evo.decline + evo.progression + evo.champion_bonus;

                if (totalNoteChange === 0 && evo.rookie_reveal == null) continue;

                // Fetch current driver data
                const { data: driver, error: fetchError } = await supabase
                    .from("drivers")
                    .select("note, potential_final, potential_revealed, world_titles")
                    .eq("id", evo.driver_id)
                    .single();
                if (fetchError) throw fetchError;

                const updates: Record<string, unknown> = {};

                if (totalNoteChange !== 0) {
                    const currentNote = driver.note ?? 0;
                    const maxPotential = driver.potential_final ?? 10;
                    updates.note = Math.max(1, Math.min(currentNote + totalNoteChange, maxPotential));
                }

                if (evo.champion_bonus > 0) {
                    updates.world_titles = (driver.world_titles ?? 0) + 1;
                }

                if (evo.rookie_reveal != null) {
                    updates.potential_final = evo.rookie_reveal;
                    updates.potential_revealed = true;
                    updates.is_rookie = false;
                }

                if (Object.keys(updates).length > 0) {
                    const { error: updateError } = await supabase
                        .from("drivers")
                        .update(updates)
                        .eq("id", evo.driver_id);
                    if (updateError) throw updateError;
                }
            }

            // 3. Apply team budget changes
            for (const change of teamBudgetChanges) {
                if (change.surperformance_delta === 0) continue;

                const { data: team, error: fetchError } = await supabase
                    .from("teams")
                    .select("surperformance_bonus")
                    .eq("id", change.team_id)
                    .single();
                if (fetchError) throw fetchError;

                const current = team.surperformance_bonus ?? 0;
                const newValue = Math.max(0, current + change.surperformance_delta);

                const { error: updateError } = await supabase
                    .from("teams")
                    .update({ surperformance_bonus: newValue })
                    .eq("id", change.team_id);
                if (updateError) throw updateError;
            }

            // 4. Decrement contracts and increment years_in_team
            if (input.contractDecrements) {
                const { data: allDrivers, error: driversError } = await supabase
                    .from("drivers")
                    .select("id, contract_years_remaining, years_in_team")
                    .eq("season_id", seasonId);
                if (driversError) throw driversError;

                for (const d of allDrivers ?? []) {
                    const currentContract = d.contract_years_remaining ?? 0;
                    const currentYears = d.years_in_team ?? 0;
                    const { error: updateError } = await supabase
                        .from("drivers")
                        .update({
                            contract_years_remaining: Math.max(0, currentContract - 1),
                            years_in_team: currentYears + 1,
                        })
                        .eq("id", d.id);
                    if (updateError) throw updateError;
                }
            }

            // 4b. Decrement staff contracts
            if (input.contractDecrements) {
                const { data: allStaff, error: staffError } = await supabase
                    .from("staff_members")
                    .select("id, contract_years_remaining, years_in_team")
                    .eq("season_id", seasonId);
                if (staffError) throw staffError;

                for (const s of allStaff ?? []) {
                    const { error: updateError } = await supabase
                        .from("staff_members")
                        .update({
                            contract_years_remaining: Math.max(0, (s.contract_years_remaining ?? 0) - 1),
                            years_in_team: (s.years_in_team ?? 0) + 1,
                        })
                        .eq("id", s.id);
                    if (updateError) throw updateError;
                }
            }

            // 5. Mark season as completed
            const { error: seasonError } = await supabase
                .from("seasons")
                .update({ status: "completed" })
                .eq("id", seasonId);
            if (seasonError) throw seasonError;

            return { seasonId, universeId };
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

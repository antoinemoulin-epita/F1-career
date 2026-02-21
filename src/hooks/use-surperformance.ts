"use client";

import { useMemo } from "react";
import { useDriverStandings, useConstructorStandings } from "@/hooks/use-standings";
import { useDriverPredictions, useConstructorPredictions } from "@/hooks/use-predictions";
import { useDrivers } from "@/hooks/use-drivers";
import { useTeams } from "@/hooks/use-teams";
import {
    calculateAllDriverSurperformances,
    calculateAllTeamSurperformances,
    type DriverSurperformance,
    type TeamSurperformance,
    type DriverSurperformanceInput,
    type TeamSurperformanceInput,
} from "@/lib/calculations/surperformance";

// ─── Main hook ──────────────────────────────────────────────────────────────

export function useSurperformance(seasonId: string) {
    const { data: driverStandingsRaw, isLoading: dsLoading } = useDriverStandings(seasonId);
    const { data: constructorStandingsRaw, isLoading: csLoading } = useConstructorStandings(seasonId);
    const { data: driverPredictionsRaw, isLoading: dpLoading } = useDriverPredictions(seasonId);
    const { data: constructorPredictionsRaw, isLoading: cpLoading } = useConstructorPredictions(seasonId);
    const { data: driversRaw, isLoading: driversLoading } = useDrivers(seasonId);
    const { data: teamsRaw, isLoading: teamsLoading } = useTeams(seasonId);

    const isLoading = dsLoading || csLoading || dpLoading || cpLoading || driversLoading || teamsLoading;

    // Build driver age map from useDrivers (reliable, direct view query)
    const driverAgeMap = useMemo(() => {
        const map = new Map<string, number | null>();
        driversRaw?.forEach((d) => {
            if (d.id) map.set(d.id, d.age ?? null);
        });
        return map;
    }, [driversRaw]);

    // Build team name map
    const teamNameMap = useMemo(() => {
        const map = new Map<string, string>();
        teamsRaw?.forEach((t) => {
            if (t.id && t.name) map.set(t.id, t.name);
        });
        return map;
    }, [teamsRaw]);

    const data = useMemo<{
        drivers: DriverSurperformance[];
        teams: TeamSurperformance[];
    } | null>(() => {
        if (!driverPredictionsRaw || !driverStandingsRaw) return null;

        // ─── Build final position maps from standings ────────────────────
        const driverFinalPositionMap = new Map<string, { position: number; teamName: string }>();
        driverStandingsRaw.forEach((s) => {
            if (s.driver_id) {
                driverFinalPositionMap.set(s.driver_id, {
                    position: s.position ?? 0,
                    teamName: s.team_name ?? "—",
                });
            }
        });

        const ctorFinalPositionMap = new Map<string, number>();
        constructorStandingsRaw?.forEach((s) => {
            if (s.team_id) {
                ctorFinalPositionMap.set(s.team_id, s.position ?? 0);
            }
        });

        // ─── Driver surperformance inputs ────────────────────────────────
        const driverInputs: DriverSurperformanceInput[] = driverPredictionsRaw
            .filter((p) => driverFinalPositionMap.has(p.driver_id) && p.driver != null)
            .map((p) => {
                const driver = p.driver as {
                    full_name: string | null;
                    team_id: string | null;
                } | null;
                const final = driverFinalPositionMap.get(p.driver_id)!;
                // Use driverAgeMap (from useDrivers, direct view query) instead of
                // FK expansion age which can silently return null for some drivers
                const age = driverAgeMap.get(p.driver_id) ?? null;
                return {
                    driver_id: p.driver_id,
                    name: driver?.full_name ?? "",
                    team: final.teamName,
                    age,
                    predicted_position: p.predicted_position,
                    final_position: final.position,
                };
            });

        // ─── Team surperformance inputs ──────────────────────────────────
        const teamInputs: TeamSurperformanceInput[] = (constructorPredictionsRaw ?? [])
            .filter((p) => ctorFinalPositionMap.has(p.team_id))
            .map((p) => {
                const team = p.team as { name: string | null } | null;
                return {
                    team_id: p.team_id,
                    name: team?.name ?? teamNameMap.get(p.team_id) ?? "",
                    predicted_position: p.predicted_position,
                    final_position: ctorFinalPositionMap.get(p.team_id)!,
                };
            });

        return {
            drivers: calculateAllDriverSurperformances(driverInputs),
            teams: calculateAllTeamSurperformances(teamInputs),
        };
    }, [
        driverPredictionsRaw,
        driverStandingsRaw,
        constructorPredictionsRaw,
        constructorStandingsRaw,
        driverAgeMap,
        teamNameMap,
    ]);

    return {
        data,
        isLoading,
    };
}

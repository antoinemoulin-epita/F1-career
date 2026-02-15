"use client";

import { useMemo } from "react";
import { useRace, useQualifying } from "@/hooks/use-qualifying";
import { useSeason } from "@/hooks/use-seasons";
import { useRaceResults } from "@/hooks/use-race-results";
import { useDriverStandings, useConstructorStandings } from "@/hooks/use-standings";
import { useDriverPredictions, useConstructorPredictions } from "@/hooks/use-predictions";
import { useTeams } from "@/hooks/use-teams";
import type { StandingRow, PredictionRow } from "@/lib/export/pre-race-template";
import type {
    PostRaceExportData,
    QualifyingRow,
    RaceResultRow,
    DnfRow,
    FastestLapData,
} from "@/lib/export/post-race-template";

// ─── Main hook ──────────────────────────────────────────────────────────────

export function usePostRaceExport(seasonId: string, raceId: string) {
    const { data: race, isLoading: raceLoading, error: raceError } = useRace(raceId);
    const { data: season, isLoading: seasonLoading } = useSeason(seasonId);
    const { data: qualifyingRaw, isLoading: qualLoading } = useQualifying(raceId);
    const { data: resultsRaw, isLoading: resultsLoading } = useRaceResults(raceId);
    const { data: teamsRaw, isLoading: teamsLoading } = useTeams(seasonId);
    const { data: driverStandingsRaw, isLoading: dsLoading } = useDriverStandings(seasonId);
    const { data: constructorStandingsRaw, isLoading: csLoading } = useConstructorStandings(seasonId);
    const { data: driverPredictionsRaw, isLoading: dpLoading } = useDriverPredictions(seasonId);
    const { data: constructorPredictionsRaw, isLoading: cpLoading } = useConstructorPredictions(seasonId);

    const isLoading =
        raceLoading || seasonLoading || qualLoading || resultsLoading ||
        teamsLoading || dsLoading || csLoading || dpLoading || cpLoading;

    // Build team name map
    const teamNameMap = useMemo(() => {
        const map = new Map<string, string>();
        teamsRaw?.forEach((t) => {
            if (t.id && t.name) map.set(t.id, t.name);
        });
        return map;
    }, [teamsRaw]);

    const data = useMemo<PostRaceExportData | null>(() => {
        if (!race || !season || !resultsRaw) return null;

        const circuit = race.circuit as {
            name: string;
            country: string;
            flag_emoji: string | null;
        } | null;

        if (!circuit) return null;

        // ─── Qualifying mapping ──────────────────────────────────────────
        const qualifying: QualifyingRow[] = (qualifyingRaw ?? [])
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((q) => {
                const driver = q.driver as { full_name: string | null; team_id: string | null } | null;
                return {
                    position: q.position ?? 0,
                    name: driver?.full_name ?? "",
                    team: teamNameMap.get(driver?.team_id ?? "") ?? "—",
                };
            });

        // ─── Race results mapping ────────────────────────────────────────
        const classified = resultsRaw
            .filter((r) => r.finish_position != null)
            .sort((a, b) => (a.finish_position ?? 0) - (b.finish_position ?? 0));

        const results: RaceResultRow[] = classified.map((r) => {
            const driver = r.driver as { full_name: string | null; team_id: string | null } | null;
            const finishPos = r.finish_position ?? 0;
            const gridPos = r.grid_position ?? 0;
            return {
                finish_position: finishPos,
                name: driver?.full_name ?? "",
                team: teamNameMap.get(driver?.team_id ?? "") ?? "—",
                grid_position: gridPos,
                gain: gridPos - finishPos,
                points: r.points ?? 0,
            };
        });

        // ─── DNFs mapping ────────────────────────────────────────────────
        const dnfResults = resultsRaw.filter((r) => r.finish_position == null);
        const dnfs: DnfRow[] = dnfResults.map((r) => {
            const driver = r.driver as { full_name: string | null; team_id: string | null } | null;
            return {
                name: driver?.full_name ?? "",
                team: teamNameMap.get(driver?.team_id ?? "") ?? "—",
                status: r.status ?? "dnf_other",
                reason: r.dnf_reason,
            };
        });

        // ─── Fastest lap ─────────────────────────────────────────────────
        const fastestResult = resultsRaw.find((r) => r.fastest_lap);
        let fastestLap: FastestLapData = null;
        if (fastestResult) {
            const driver = fastestResult.driver as { full_name: string | null; team_id: string | null } | null;
            fastestLap = {
                name: driver?.full_name ?? "",
                team: teamNameMap.get(driver?.team_id ?? "") ?? "—",
            };
        }

        // ─── Driver standings mapping ────────────────────────────────────
        const leaderPoints = driverStandingsRaw?.[0]?.points ?? 0;
        const driverStandings: StandingRow[] = (driverStandingsRaw ?? []).map((s) => ({
            position: s.position ?? 0,
            name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim(),
            team: s.team_name ?? undefined,
            points: s.points ?? 0,
            wins: s.wins ?? 0,
            podiums: s.podiums ?? 0,
            poles: s.poles ?? 0,
            gap: leaderPoints - (s.points ?? 0),
        }));

        // ─── Constructor standings mapping ───────────────────────────────
        const leaderCtorPoints = constructorStandingsRaw?.[0]?.points ?? 0;
        const constructorStandings: StandingRow[] = (constructorStandingsRaw ?? []).map((s) => ({
            position: s.position ?? 0,
            name: s.team_name ?? "",
            points: s.points ?? 0,
            wins: s.wins ?? 0,
            podiums: s.podiums ?? 0,
            poles: s.poles ?? 0,
            gap: leaderCtorPoints - (s.points ?? 0),
        }));

        // ─── Driver predictions mapping ──────────────────────────────────
        const driverActualPositionMap = new Map<string, number>();
        driverStandingsRaw?.forEach((s) => {
            if (s.driver_id) {
                driverActualPositionMap.set(s.driver_id, s.position ?? 0);
            }
        });

        const driverPredictions: PredictionRow[] = (driverPredictionsRaw ?? []).map((p) => {
            const driver = p.driver as { full_name: string | null } | null;
            const actualPos = driverActualPositionMap.get(p.driver_id) ?? null;
            return {
                predicted_position: p.predicted_position,
                name: driver?.full_name ?? "",
                score: p.score ?? 0,
                actual_position: actualPos,
                delta: actualPos != null ? actualPos - p.predicted_position : null,
            };
        });

        // ─── Constructor predictions mapping ─────────────────────────────
        const ctorActualPositionMap = new Map<string, number>();
        constructorStandingsRaw?.forEach((s) => {
            if (s.team_id) {
                ctorActualPositionMap.set(s.team_id, s.position ?? 0);
            }
        });

        const constructorPredictions: PredictionRow[] = (constructorPredictionsRaw ?? []).map((p) => {
            const team = p.team as { name: string | null } | null;
            const actualPos = ctorActualPositionMap.get(p.team_id) ?? null;
            return {
                predicted_position: p.predicted_position,
                name: team?.name ?? "",
                score: p.score ?? 0,
                actual_position: actualPos,
                delta: actualPos != null ? actualPos - p.predicted_position : null,
            };
        });

        return {
            round_number: race.round_number,
            year: season.year,
            circuit_name: circuit.name,
            circuit_country: circuit.country,
            circuit_flag: circuit.flag_emoji ?? "",
            weather: race.weather ?? "dry",
            notable_events: race.notable_events,
            qualifying,
            results,
            dnfs,
            fastestLap,
            driverStandings,
            constructorStandings,
            driverPredictions,
            constructorPredictions,
        };
    }, [
        race,
        season,
        qualifyingRaw,
        resultsRaw,
        teamNameMap,
        driverStandingsRaw,
        constructorStandingsRaw,
        driverPredictionsRaw,
        constructorPredictionsRaw,
    ]);

    return {
        data,
        isLoading,
        error: raceError,
    };
}

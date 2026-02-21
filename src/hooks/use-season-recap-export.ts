"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useSeason } from "@/hooks/use-seasons";
import { useCalendar } from "@/hooks/use-calendar";
import { useTeams } from "@/hooks/use-teams";
import { useDriverStandings, useConstructorStandings } from "@/hooks/use-standings";
import type { StandingRow } from "@/lib/export/pre-race-template";
import type {
    QualifyingRow,
    RaceResultRow,
    DnfRow,
    FastestLapData,
} from "@/lib/export/post-race-template";
import type {
    SeasonRecapExportData,
    RaceRecap,
} from "@/lib/export/season-recap-template";

const supabase = createClient();

// ─── Main hook ──────────────────────────────────────────────────────────────

export function useSeasonRecapExport(seasonId: string) {
    const { data: season, isLoading: seasonLoading, error: seasonError } = useSeason(seasonId);
    const { data: calendarRaw, isLoading: calendarLoading } = useCalendar(seasonId);
    const { data: teamsRaw, isLoading: teamsLoading } = useTeams(seasonId);
    const { data: driverStandingsRaw, isLoading: dsLoading } = useDriverStandings(seasonId);
    const { data: constructorStandingsRaw, isLoading: csLoading } = useConstructorStandings(seasonId);

    // Completed race IDs
    const completedRaces = useMemo(() => {
        if (!calendarRaw) return [];
        return (calendarRaw as { id: string; status: string | null }[])
            .filter((e) => e.status === "completed");
    }, [calendarRaw]);

    const completedRaceIds = useMemo(
        () => completedRaces.map((e) => e.id),
        [completedRaces],
    );

    // Bulk fetch qualifying_results for all completed races
    const { data: allQualifying, isLoading: qualLoading } = useQuery({
        queryKey: ["season-recap-qualifying", { seasonId, raceIds: completedRaceIds }],
        queryFn: async () => {
            if (completedRaceIds.length === 0) return [];
            const { data, error } = await supabase
                .from("qualifying_results")
                .select("*, driver:v_drivers_with_effective(*)")
                .in("race_id", completedRaceIds)
                .order("position");
            if (error) throw error;
            return data;
        },
        enabled: completedRaceIds.length > 0,
    });

    // Bulk fetch race_results for all completed races
    const { data: allResults, isLoading: resultsLoading } = useQuery({
        queryKey: ["season-recap-results", { seasonId, raceIds: completedRaceIds }],
        queryFn: async () => {
            if (completedRaceIds.length === 0) return [];
            const { data, error } = await supabase
                .from("race_results")
                .select("*, driver:v_drivers_with_effective(*)")
                .in("race_id", completedRaceIds)
                .order("finish_position", { ascending: true, nullsFirst: false });
            if (error) throw error;
            return data;
        },
        enabled: completedRaceIds.length > 0,
    });

    const isLoading =
        seasonLoading || calendarLoading || teamsLoading ||
        dsLoading || csLoading || qualLoading || resultsLoading;

    // Build team name map
    const teamNameMap = useMemo(() => {
        const map = new Map<string, string>();
        teamsRaw?.forEach((t) => {
            if (t.id && t.name) map.set(t.id, t.name);
        });
        return map;
    }, [teamsRaw]);

    const data = useMemo<SeasonRecapExportData | null>(() => {
        if (!season || !calendarRaw) return null;

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

        // ─── Build race recaps ───────────────────────────────────────────
        type CalendarEntry = {
            id: string;
            round_number: number;
            status: string | null;
            weather: string | null;
            notable_events: string | null;
            circuit: {
                name: string | null;
                country: string | null;
                flag_emoji: string | null;
            } | null;
        };

        const calendar = calendarRaw as CalendarEntry[];
        const completedEntries = calendar
            .filter((e) => e.status === "completed")
            .sort((a, b) => a.round_number - b.round_number);

        // Group qualifying and results by race_id
        const qualByRace = new Map<string, typeof allQualifying>();
        for (const q of allQualifying ?? []) {
            const arr = qualByRace.get(q.race_id) ?? [];
            arr.push(q);
            qualByRace.set(q.race_id, arr);
        }

        const resultsByRace = new Map<string, typeof allResults>();
        for (const r of allResults ?? []) {
            const arr = resultsByRace.get(r.race_id) ?? [];
            arr.push(r);
            resultsByRace.set(r.race_id, arr);
        }

        const races: RaceRecap[] = completedEntries.map((entry) => {
            const circuit = entry.circuit;

            // Qualifying
            const qualRaw = qualByRace.get(entry.id) ?? [];
            const qualifying: QualifyingRow[] = qualRaw
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((q) => {
                    const driver = q.driver as { full_name: string | null; team_id: string | null } | null;
                    return {
                        position: q.position ?? 0,
                        name: driver?.full_name ?? "",
                        team: teamNameMap.get(driver?.team_id ?? "") ?? "—",
                    };
                });

            // Race results
            const resRaw = resultsByRace.get(entry.id) ?? [];
            const classified = resRaw.filter((r) => r.finish_position != null);
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

            // DNFs
            const dnfResults = resRaw.filter((r) => r.finish_position == null);
            const dnfs: DnfRow[] = dnfResults.map((r) => {
                const driver = r.driver as { full_name: string | null; team_id: string | null } | null;
                return {
                    name: driver?.full_name ?? "",
                    team: teamNameMap.get(driver?.team_id ?? "") ?? "—",
                    status: r.status ?? "dnf_other",
                    reason: r.dnf_reason,
                };
            });

            // Fastest lap
            const fastestResult = resRaw.find((r) => r.fastest_lap);
            let fastestLap: FastestLapData = null;
            if (fastestResult) {
                const driver = fastestResult.driver as { full_name: string | null; team_id: string | null } | null;
                fastestLap = {
                    name: driver?.full_name ?? "",
                    team: teamNameMap.get(driver?.team_id ?? "") ?? "—",
                };
            }

            return {
                round_number: entry.round_number,
                circuit_name: circuit?.name ?? "Circuit inconnu",
                circuit_flag: circuit?.flag_emoji ?? "",
                circuit_country: circuit?.country ?? "",
                weather: entry.weather ?? "dry",
                notable_events: entry.notable_events,
                qualifying,
                results,
                dnfs,
                fastestLap,
            };
        });

        return {
            year: season.year,
            gpCount: completedEntries.length,
            driverStandings,
            constructorStandings,
            races,
        };
    }, [
        season,
        calendarRaw,
        teamNameMap,
        driverStandingsRaw,
        constructorStandingsRaw,
        allQualifying,
        allResults,
    ]);

    return {
        data,
        isLoading,
        error: seasonError,
    };
}

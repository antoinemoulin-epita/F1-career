"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { buildPointsMap, calculateDriverPoints } from "@/lib/calculations/points";
import { calendarKeys } from "@/hooks/use-calendar";
import { qualifyingKeys, raceKeys } from "@/hooks/use-qualifying";
import type { ResultStatus, WeatherType } from "@/types";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────────────────────

export const raceResultKeys = {
    all: ["race-results"] as const,
    byRace: (raceId: string) => ["race-results", { raceId }] as const,
};

export const pointsSystemKeys = {
    byUniverse: (universeId: string) => ["points-system", { universeId }] as const,
    bySeason: (seasonId: string) => ["points-system", { seasonId }] as const,
};

export const standingsKeys = {
    drivers: (seasonId: string) => ["standings-drivers", { seasonId }] as const,
    constructors: (seasonId: string) => ["standings-constructors", { seasonId }] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useRaceResults(raceId: string) {
    return useQuery({
        queryKey: raceResultKeys.byRace(raceId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("race_results")
                .select("*, driver:v_drivers_with_effective(*)")
                .eq("race_id", raceId)
                .order("finish_position", { ascending: true, nullsFirst: false });
            if (error) throw error;
            return data;
        },
        enabled: !!raceId,
    });
}

export function usePointsSystem(universeId: string) {
    return useQuery({
        queryKey: pointsSystemKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("points_system")
                .select("*")
                .eq("universe_id", universeId)
                .order("position");
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

export function usePointsSystemForSeason(seasonId: string, universeId: string | undefined) {
    return useQuery({
        queryKey: pointsSystemKeys.bySeason(seasonId),
        queryFn: async () => {
            // Try season-specific rows first
            const { data: seasonRows, error: sError } = await supabase
                .from("points_system")
                .select("*")
                .eq("season_id", seasonId)
                .order("position");
            if (sError) throw sError;

            if (seasonRows && seasonRows.length > 0) {
                return { rows: seasonRows, source: "season" as const };
            }

            // Fallback to universe defaults
            if (!universeId) return { rows: [], source: "universe" as const };

            const { data: universeRows, error: uError } = await supabase
                .from("points_system")
                .select("*")
                .eq("universe_id", universeId)
                .is("season_id", null)
                .order("position");
            if (uError) throw uError;

            return { rows: universeRows ?? [], source: "universe" as const };
        },
        enabled: !!seasonId,
    });
}

export function useSaveSeasonPointsSystem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            seasonId: string;
            universeId: string;
            rows: { position: number; points: number }[];
        }) => {
            // Delete existing season-specific rows
            const { error: delError } = await supabase
                .from("points_system")
                .delete()
                .eq("season_id", input.seasonId);
            if (delError) throw delError;

            // Insert new season-specific rows
            if (input.rows.length > 0) {
                const { error: insError } = await supabase
                    .from("points_system")
                    .insert(
                        input.rows.map((r) => ({
                            universe_id: input.universeId,
                            season_id: input.seasonId,
                            position: r.position,
                            points: r.points,
                        })),
                    );
                if (insError) throw insError;
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: pointsSystemKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: pointsSystemKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useResetSeasonPointsSystem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { seasonId: string; universeId: string }) => {
            const { error } = await supabase
                .from("points_system")
                .delete()
                .eq("season_id", input.seasonId);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: pointsSystemKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: pointsSystemKeys.byUniverse(variables.universeId) });
        },
    });
}

/**
 * Fetch all race wins for a season, joined with calendar to get circuit_id.
 * Returns { driver_id, team_id, circuit_id }[] for position-1 finishes.
 */
export function useRaceResultsBySeason(seasonId: string) {
    return useQuery({
        queryKey: ["race-results-season", { seasonId }] as const,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("race_results")
                .select("driver_id, finish_position, race:calendar!inner(id, season_id, circuit_id)")
                .eq("race.season_id", seasonId)
                .eq("finish_position", 1);
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type DnfInfo = {
    status: ResultStatus;
    reason: string;
};

type SaveRaceResultsInput = {
    raceId: string;
    seasonId: string;
    universeId: string;
    roundNumber: number;
    finishOrder: string[];
    gridPositionMap: Map<string, number>;
    dnfMap: Map<string, DnfInfo>;
    fastestLapDriverId: string | null;
    weather: WeatherType;
    notableEvents: string;
    pointsSystemRows: { position: number; points: number }[];
    driverTeamMap: Map<string, string>;
};

// ─── Mutation ───────────────────────────────────────────────────────────────

export function useSaveRaceResults() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: SaveRaceResultsInput) => {
            const {
                raceId,
                seasonId,
                roundNumber,
                finishOrder,
                gridPositionMap,
                dnfMap,
                fastestLapDriverId,
                weather,
                notableEvents,
                pointsSystemRows,
                driverTeamMap,
            } = input;

            const pointsMap = buildPointsMap(pointsSystemRows);

            // 1. Delete existing race_results for this race
            const { error: delResults } = await supabase
                .from("race_results")
                .delete()
                .eq("race_id", raceId);
            if (delResults) throw delResults;

            // 2. Delete standings_drivers for this round
            const { error: delSD } = await supabase
                .from("standings_drivers")
                .delete()
                .eq("season_id", seasonId)
                .eq("after_round", roundNumber);
            if (delSD) throw delSD;

            // 3. Delete standings_constructors for this round
            const { error: delSC } = await supabase
                .from("standings_constructors")
                .delete()
                .eq("season_id", seasonId)
                .eq("after_round", roundNumber);
            if (delSC) throw delSC;

            // 4. Insert race_results
            const resultRows = [
                // Classified drivers
                ...finishOrder.map((driverId, idx) => ({
                    race_id: raceId,
                    driver_id: driverId,
                    grid_position: gridPositionMap.get(driverId) ?? idx + 1,
                    finish_position: idx + 1,
                    status: "finished" as const,
                    points: calculateDriverPoints({
                        finishPosition: idx + 1,
                        isFastestLap: fastestLapDriverId === driverId,
                        pointsMap,
                    }),
                    fastest_lap: fastestLapDriverId === driverId,
                })),
                // DNF drivers
                ...[...dnfMap.entries()].map(([driverId, info]) => ({
                    race_id: raceId,
                    driver_id: driverId,
                    grid_position: gridPositionMap.get(driverId) ?? 0,
                    finish_position: null as number | null,
                    status: info.status,
                    dnf_reason: info.reason || null,
                    points: 0,
                    fastest_lap: false,
                })),
            ];

            const { error: insertError } = await supabase
                .from("race_results")
                .insert(resultRows);
            if (insertError) throw insertError;

            // 5. Fetch all completed/qualifying_done calendar entries for this season
            const { data: calendarEntries, error: calError } = await supabase
                .from("calendar")
                .select("id, round_number, status")
                .eq("season_id", seasonId)
                .in("status", ["completed", "qualifying_done"]);
            if (calError) throw calError;

            // Include current race
            const allRaceIds = [
                ...new Set([
                    ...calendarEntries.map((e) => e.id),
                    raceId,
                ]),
            ];

            // Fetch all race_results for those races
            const { data: allResults, error: allResError } = await supabase
                .from("race_results")
                .select("*")
                .in("race_id", allRaceIds);
            if (allResError) throw allResError;

            // Fetch all qualifying_results for those races (for pole stats)
            const { data: allQuali, error: allQualiError } = await supabase
                .from("qualifying_results")
                .select("*")
                .in("race_id", allRaceIds);
            if (allQualiError) throw allQualiError;

            // 6. Aggregate standings_drivers
            const driverStats = new Map<
                string,
                { points: number; wins: number; podiums: number; poles: number; fastestLaps: number; dnfs: number }
            >();

            for (const r of allResults) {
                const stats = driverStats.get(r.driver_id) ?? {
                    points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, dnfs: 0,
                };
                stats.points += r.points ?? 0;
                if (r.finish_position === 1) stats.wins += 1;
                if (r.finish_position != null && r.finish_position <= 3) stats.podiums += 1;
                if (r.fastest_lap) stats.fastestLaps += 1;
                if (r.finish_position == null) stats.dnfs += 1;
                driverStats.set(r.driver_id, stats);
            }

            // Pole positions from qualifying
            for (const q of allQuali) {
                if (q.position === 1) {
                    const stats = driverStats.get(q.driver_id);
                    if (stats) stats.poles += 1;
                }
            }

            // Sort by points desc, then wins desc
            const sortedDrivers = [...driverStats.entries()].sort((a, b) => {
                if (b[1].points !== a[1].points) return b[1].points - a[1].points;
                return b[1].wins - a[1].wins;
            });

            const driverStandingRows = sortedDrivers.map(([driverId, stats], idx) => ({
                season_id: seasonId,
                after_round: roundNumber,
                driver_id: driverId,
                position: idx + 1,
                points: stats.points,
                wins: stats.wins,
                podiums: stats.podiums,
                poles: stats.poles,
                fastest_laps: stats.fastestLaps,
                dnfs: stats.dnfs,
            }));

            if (driverStandingRows.length > 0) {
                const { error: insSD } = await supabase
                    .from("standings_drivers")
                    .insert(driverStandingRows);
                if (insSD) throw insSD;
            }

            // 7. Aggregate standings_constructors
            const teamStats = new Map<
                string,
                { points: number; wins: number; podiums: number; poles: number }
            >();

            for (const r of allResults) {
                const teamId = driverTeamMap.get(r.driver_id);
                if (!teamId) continue;
                const stats = teamStats.get(teamId) ?? {
                    points: 0, wins: 0, podiums: 0, poles: 0,
                };
                stats.points += r.points ?? 0;
                if (r.finish_position === 1) stats.wins += 1;
                if (r.finish_position != null && r.finish_position <= 3) stats.podiums += 1;
                teamStats.set(teamId, stats);
            }

            for (const q of allQuali) {
                if (q.position === 1) {
                    const teamId = driverTeamMap.get(q.driver_id);
                    if (!teamId) continue;
                    const stats = teamStats.get(teamId);
                    if (stats) stats.poles += 1;
                }
            }

            const sortedTeams = [...teamStats.entries()].sort((a, b) => {
                if (b[1].points !== a[1].points) return b[1].points - a[1].points;
                return b[1].wins - a[1].wins;
            });

            const constructorStandingRows = sortedTeams.map(([teamId, stats], idx) => ({
                season_id: seasonId,
                after_round: roundNumber,
                team_id: teamId,
                position: idx + 1,
                points: stats.points,
                wins: stats.wins,
                podiums: stats.podiums,
                poles: stats.poles,
            }));

            if (constructorStandingRows.length > 0) {
                const { error: insSC } = await supabase
                    .from("standings_constructors")
                    .insert(constructorStandingRows);
                if (insSC) throw insSC;
            }

            // 8. Update calendar: status completed, weather, notable_events
            const { error: updateCal } = await supabase
                .from("calendar")
                .update({
                    status: "completed",
                    weather,
                    notable_events: notableEvents || null,
                })
                .eq("id", raceId);
            if (updateCal) throw updateCal;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: raceResultKeys.byRace(variables.raceId) });
            queryClient.invalidateQueries({ queryKey: raceKeys.detail(variables.raceId) });
            queryClient.invalidateQueries({ queryKey: calendarKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: qualifyingKeys.byRace(variables.raceId) });
            queryClient.invalidateQueries({ queryKey: standingsKeys.drivers(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: standingsKeys.constructors(variables.seasonId) });
        },
    });
}

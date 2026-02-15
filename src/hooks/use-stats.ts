"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────────────────────

export const statsKeys = {
    completedSeasons: (universeId: string) => ["stats", "completed-seasons", { universeId }] as const,
    teamsBySeason: (seasonId: string) => ["stats", "teams-by-season", { seasonId }] as const,
    teammateH2H: (seasonId: string, driverIds: string[]) =>
        ["stats", "teammate-h2h", { seasonId, driverIds }] as const,
    circuitStats: (universeId: string) => ["stats", "circuit-stats", { universeId }] as const,
};

// ─── Types ──────────────────────────────────────────────────────────────────

export type H2HResult = {
    driver1: { id: string; name: string };
    driver2: { id: string; name: string };
    qualiBattles: { d1Wins: number; d2Wins: number };
    raceBattles: { d1Wins: number; d2Wins: number };
    points: { d1: number; d2: number };
    perRace: {
        raceName: string;
        flagEmoji: string;
        round: number;
        qualiD1: number | null;
        qualiD2: number | null;
        raceD1: number | null;
        raceD2: number | null;
    }[];
};

export type TeamWithDrivers = {
    id: string;
    name: string;
    color: string;
    drivers: { id: string; firstName: string; lastName: string }[];
};

export type CircuitStat = {
    circuitId: string;
    circuitName: string;
    flagEmoji: string;
    country: string;
    circuitType: string;
    raceCount: number;
    winners: { driverName: string; teamName: string; year: number }[];
    mostWinsDriver: string;
    mostWinsCount: number;
    weatherHistory: { year: number; weather: string }[];
};

// ─── Hook 1 : useCompletedSeasons ───────────────────────────────────────────

export function useCompletedSeasons(universeId: string) {
    return useQuery({
        queryKey: statsKeys.completedSeasons(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("seasons")
                .select("id, year")
                .eq("universe_id", universeId)
                .eq("status", "completed")
                .order("year", { ascending: false });
            if (error) throw error;
            return data as { id: string; year: number }[];
        },
        enabled: !!universeId,
    });
}

// ─── Hook 2 : useTeamsBySeason ──────────────────────────────────────────────

export function useTeamsBySeason(seasonId: string) {
    return useQuery({
        queryKey: statsKeys.teamsBySeason(seasonId),
        queryFn: async () => {
            const [teamsRes, driversRes] = await Promise.all([
                supabase
                    .from("teams")
                    .select("id, name, color_primary")
                    .eq("season_id", seasonId),
                supabase
                    .from("drivers")
                    .select("id, first_name, last_name, team_id")
                    .eq("season_id", seasonId),
            ]);

            if (teamsRes.error) throw teamsRes.error;
            if (driversRes.error) throw driversRes.error;

            const driversByTeam = new Map<string, { id: string; firstName: string; lastName: string }[]>();
            for (const d of driversRes.data ?? []) {
                if (!d.team_id) continue;
                const list = driversByTeam.get(d.team_id) ?? [];
                list.push({
                    id: d.id,
                    firstName: d.first_name ?? "",
                    lastName: d.last_name ?? "",
                });
                driversByTeam.set(d.team_id, list);
            }

            const teams: TeamWithDrivers[] = (teamsRes.data ?? []).map((t) => ({
                id: t.id,
                name: t.name ?? "",
                color: t.color_primary ?? "#888888",
                drivers: driversByTeam.get(t.id) ?? [],
            }));

            return teams;
        },
        enabled: !!seasonId,
    });
}

// ─── Hook 3 : useTeammateH2H ───────────────────────────────────────────────

export function useTeammateH2H(seasonId: string, driverIds: [string, string]) {
    return useQuery({
        queryKey: statsKeys.teammateH2H(seasonId, driverIds),
        queryFn: async () => {
            // 1. Completed races for the season with circuit info
            const { data: races, error: rErr } = await supabase
                .from("calendar")
                .select("id, round_number, circuit:circuits(name, flag_emoji)")
                .eq("season_id", seasonId)
                .eq("status", "completed")
                .order("round_number", { ascending: true });
            if (rErr) throw rErr;

            const raceIds = races?.map((r) => r.id) ?? [];
            if (raceIds.length === 0) {
                return null;
            }

            // 2. Fetch qualifying, race results, and driver names in parallel
            const [qualiRes, raceRes, driversRes] = await Promise.all([
                supabase
                    .from("qualifying_results")
                    .select("race_id, driver_id, position")
                    .in("race_id", raceIds)
                    .in("driver_id", driverIds),
                supabase
                    .from("race_results")
                    .select("race_id, driver_id, finish_position, points")
                    .in("race_id", raceIds)
                    .in("driver_id", driverIds),
                supabase
                    .from("drivers")
                    .select("id, first_name, last_name")
                    .in("id", driverIds),
            ]);

            if (qualiRes.error) throw qualiRes.error;
            if (raceRes.error) throw raceRes.error;
            if (driversRes.error) throw driversRes.error;

            // Build driver name map
            const driverNameMap = new Map<string, string>();
            for (const d of driversRes.data ?? []) {
                driverNameMap.set(d.id, `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim());
            }

            // Build lookup maps: raceId -> driverId -> position
            const qualiMap = new Map<string, Map<string, number>>();
            for (const q of qualiRes.data ?? []) {
                if (!qualiMap.has(q.race_id)) qualiMap.set(q.race_id, new Map());
                qualiMap.get(q.race_id)!.set(q.driver_id, q.position);
            }

            const raceMap = new Map<string, Map<string, { pos: number | null; pts: number }>>();
            for (const r of raceRes.data ?? []) {
                if (!raceMap.has(r.race_id)) raceMap.set(r.race_id, new Map());
                raceMap.get(r.race_id)!.set(r.driver_id, {
                    pos: r.finish_position,
                    pts: r.points ?? 0,
                });
            }

            // Aggregate
            const [d1Id, d2Id] = driverIds;
            let qualiBattles = { d1Wins: 0, d2Wins: 0 };
            let raceBattles = { d1Wins: 0, d2Wins: 0 };
            let points = { d1: 0, d2: 0 };
            const perRace: H2HResult["perRace"] = [];

            for (const race of races ?? []) {
                const circuit = race.circuit as { name: string | null; flag_emoji: string | null } | null;
                const qualiRace = qualiMap.get(race.id);
                const raceRace = raceMap.get(race.id);

                const qD1 = qualiRace?.get(d1Id) ?? null;
                const qD2 = qualiRace?.get(d2Id) ?? null;
                const rD1 = raceRace?.get(d1Id) ?? null;
                const rD2 = raceRace?.get(d2Id) ?? null;

                // Quali battle
                if (qD1 !== null && qD2 !== null) {
                    if (qD1 < qD2) qualiBattles.d1Wins++;
                    else if (qD2 < qD1) qualiBattles.d2Wins++;
                }

                // Race battle
                if (rD1?.pos !== null && rD1?.pos !== undefined && rD2?.pos !== null && rD2?.pos !== undefined) {
                    if (rD1.pos < rD2.pos) raceBattles.d1Wins++;
                    else if (rD2.pos < rD1.pos) raceBattles.d2Wins++;
                }

                points.d1 += rD1?.pts ?? 0;
                points.d2 += rD2?.pts ?? 0;

                perRace.push({
                    raceName: circuit?.name ?? `GP ${race.round_number}`,
                    flagEmoji: circuit?.flag_emoji ?? "",
                    round: race.round_number,
                    qualiD1: qD1,
                    qualiD2: qD2,
                    raceD1: rD1?.pos ?? null,
                    raceD2: rD2?.pos ?? null,
                });
            }

            const result: H2HResult = {
                driver1: { id: d1Id, name: driverNameMap.get(d1Id) ?? "" },
                driver2: { id: d2Id, name: driverNameMap.get(d2Id) ?? "" },
                qualiBattles,
                raceBattles,
                points,
                perRace,
            };

            return result;
        },
        enabled: !!seasonId && driverIds.length === 2 && !!driverIds[0] && !!driverIds[1],
    });
}

// ─── Hook 4 : useCircuitStats ───────────────────────────────────────────────

export function useCircuitStats(universeId: string) {
    return useQuery({
        queryKey: statsKeys.circuitStats(universeId),
        queryFn: async () => {
            // 1. Completed seasons
            const { data: seasons, error: sErr } = await supabase
                .from("seasons")
                .select("id, year")
                .eq("universe_id", universeId)
                .eq("status", "completed")
                .order("year", { ascending: true });
            if (sErr) throw sErr;

            const seasonIds = seasons?.map((s) => s.id) ?? [];
            if (seasonIds.length === 0) return [] as CircuitStat[];

            const seasonYearMap = new Map<string, number>();
            for (const s of seasons ?? []) {
                seasonYearMap.set(s.id, s.year);
            }

            // 2. Completed races with circuit info and weather
            const { data: races, error: rErr } = await supabase
                .from("calendar")
                .select("id, season_id, round_number, weather, circuit_id, circuit:circuits(id, name, flag_emoji, country, circuit_type)")
                .in("season_id", seasonIds)
                .eq("status", "completed")
                .order("round_number", { ascending: true });
            if (rErr) throw rErr;

            const raceIds = races?.map((r) => r.id) ?? [];
            if (raceIds.length === 0) return [] as CircuitStat[];

            // 3. P1 results with driver info
            const { data: winResults, error: wErr } = await supabase
                .from("race_results")
                .select("race_id, driver_id, driver:drivers(first_name, last_name, team_id)")
                .in("race_id", raceIds)
                .eq("finish_position", 1);
            if (wErr) throw wErr;

            // 4. Teams for name resolution
            const teamIds = new Set<string>();
            for (const w of winResults ?? []) {
                const driver = w.driver as { first_name: string | null; last_name: string | null; team_id: string | null } | null;
                if (driver?.team_id) teamIds.add(driver.team_id);
            }

            let teamNameMap = new Map<string, string>();
            if (teamIds.size > 0) {
                const { data: teams } = await supabase
                    .from("teams")
                    .select("id, name")
                    .in("id", [...teamIds]);
                if (teams) {
                    teamNameMap = new Map(teams.map((t) => [t.id, t.name ?? ""]));
                }
            }

            // Build win map: raceId -> winner info
            const winMap = new Map<string, { driverName: string; teamName: string }>();
            for (const w of winResults ?? []) {
                const driver = w.driver as { first_name: string | null; last_name: string | null; team_id: string | null } | null;
                winMap.set(w.race_id, {
                    driverName: `${driver?.first_name ?? ""} ${driver?.last_name ?? ""}`.trim(),
                    teamName: teamNameMap.get(driver?.team_id ?? "") ?? "",
                });
            }

            // Group by circuit
            const circuitMap = new Map<string, CircuitStat>();
            for (const race of races ?? []) {
                const circuit = race.circuit as { id: string; name: string | null; flag_emoji: string | null; country: string | null; circuit_type: string | null } | null;
                const circuitId = circuit?.id ?? race.circuit_id;
                const year = seasonYearMap.get(race.season_id) ?? 0;

                const existing = circuitMap.get(circuitId) ?? {
                    circuitId,
                    circuitName: circuit?.name ?? "",
                    flagEmoji: circuit?.flag_emoji ?? "",
                    country: circuit?.country ?? "",
                    circuitType: circuit?.circuit_type ?? "balanced",
                    raceCount: 0,
                    winners: [],
                    mostWinsDriver: "",
                    mostWinsCount: 0,
                    weatherHistory: [],
                };

                existing.raceCount++;

                const winner = winMap.get(race.id);
                if (winner) {
                    existing.winners.push({
                        driverName: winner.driverName,
                        teamName: winner.teamName,
                        year,
                    });
                }

                existing.weatherHistory.push({
                    year,
                    weather: race.weather ?? "dry",
                });

                circuitMap.set(circuitId, existing);
            }

            // Compute most wins driver for each circuit
            const result: CircuitStat[] = [];
            for (const stat of circuitMap.values()) {
                const winCounts = new Map<string, number>();
                for (const w of stat.winners) {
                    winCounts.set(w.driverName, (winCounts.get(w.driverName) ?? 0) + 1);
                }

                let bestDriver = "";
                let bestCount = 0;
                for (const [name, count] of winCounts) {
                    if (count > bestCount) {
                        bestDriver = name;
                        bestCount = count;
                    }
                }

                stat.mostWinsDriver = bestDriver;
                stat.mostWinsCount = bestCount;
                result.push(stat);
            }

            return result.sort((a, b) => b.raceCount - a.raceCount);
        },
        enabled: !!universeId,
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────────────────────

export const historyKeys = {
    all: ["history"] as const,
    champions: (universeId: string) => ["history", "champions", { universeId }] as const,
    allTimeStats: (universeId: string) => ["history", "all-time-stats", { universeId }] as const,
    raceWins: (universeId: string) => ["history", "race-wins", { universeId }] as const,
    archivedSeason: (universeId: string, year: number) =>
        ["history", "archived-season", { universeId, year }] as const,
};

// ─── Types ──────────────────────────────────────────────────────────────────

export type AllTimeDriverStat = {
    name: string;
    totalWins: number;
    totalPodiums: number;
    totalPoles: number;
    totalPoints: number;
    seasonsCount: number;
    bestFinish: number;
    teams: string[];
    /** Per-season breakdown for records */
    perSeason: {
        year: number;
        wins: number;
        podiums: number;
        poles: number;
        points: number;
        position: number;
        teamName: string;
    }[];
};

export type AllTimeTeamStat = {
    name: string;
    totalWins: number;
    totalPodiums: number;
    totalPoles: number;
    totalPoints: number;
    seasonsCount: number;
    bestFinish: number;
};

export type RaceWinDetail = {
    driverName: string;
    teamName: string;
    circuitName: string;
    flagEmoji: string;
    year: number;
    round: number;
};

export type PodiumDetail = {
    driverName: string;
    position: number;
    year: number;
    round: number;
};

export type StreakRecord = {
    driverName: string;
    streak: number;
    fromYear: number;
    fromRound: number;
    toYear: number;
    toRound: number;
};

// ─── Hook 1 : useChampions ──────────────────────────────────────────────────

export function useChampions(universeId: string) {
    return useQuery({
        queryKey: historyKeys.champions(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("history_champions")
                .select("*")
                .eq("universe_id", universeId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

// ─── Hook : useArchivedSeason ────────────────────────────────────────────────

export function useArchivedSeason(universeId: string, year: number) {
    return useQuery({
        queryKey: historyKeys.archivedSeason(universeId, year),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("seasons")
                .select("id, year, gp_count, status")
                .eq("universe_id", universeId)
                .eq("year", year)
                .in("status", ["completed", "active"])
                .single();
            if (error) throw error;
            return data as { id: string; year: number; gp_count: number; status: string };
        },
        enabled: !!universeId && year > 0,
    });
}

// ─── Hook 2 : useAllTimeStats ───────────────────────────────────────────────

export function useAllTimeStats(universeId: string) {
    return useQuery({
        queryKey: historyKeys.allTimeStats(universeId),
        queryFn: async () => {
            // 1. Completed + active seasons for this universe
            const { data: seasons, error: sErr } = await supabase
                .from("seasons")
                .select("id, year")
                .eq("universe_id", universeId)
                .in("status", ["completed", "active"])
                .order("year", { ascending: true });
            if (sErr) throw sErr;

            const seasonIds = seasons?.map((s) => s.id) ?? [];
            if (seasonIds.length === 0) {
                return { drivers: [] as AllTimeDriverStat[], teams: [] as AllTimeTeamStat[], seasons: seasons ?? [] };
            }

            // 2. Driver standings for all completed seasons
            const { data: driverStandings, error: dsErr } = await supabase
                .from("v_current_standings_drivers")
                .select("*")
                .in("season_id", seasonIds);
            if (dsErr) throw dsErr;

            // 3. Constructor standings for all completed seasons
            const { data: ctorStandings, error: csErr } = await supabase
                .from("v_current_standings_constructors")
                .select("*")
                .in("season_id", seasonIds);
            if (csErr) throw csErr;

            // Build season year map
            const seasonYearMap = new Map<string, number>();
            for (const s of seasons ?? []) {
                seasonYearMap.set(s.id, s.year);
            }

            // 4. Aggregate drivers by name
            const driverMap = new Map<string, AllTimeDriverStat>();
            for (const row of driverStandings ?? []) {
                const name = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
                if (!name) continue;

                const existing = driverMap.get(name) ?? {
                    name,
                    totalWins: 0,
                    totalPodiums: 0,
                    totalPoles: 0,
                    totalPoints: 0,
                    seasonsCount: 0,
                    bestFinish: Infinity,
                    teams: [],
                    perSeason: [],
                };

                existing.totalWins += row.wins ?? 0;
                existing.totalPodiums += row.podiums ?? 0;
                existing.totalPoles += row.poles ?? 0;
                existing.totalPoints += row.points ?? 0;
                existing.seasonsCount += 1;

                const pos = row.position ?? Infinity;
                if (pos < existing.bestFinish) existing.bestFinish = pos;

                const teamName = row.team_name ?? "";
                if (teamName && !existing.teams.includes(teamName)) {
                    existing.teams.push(teamName);
                }

                existing.perSeason.push({
                    year: seasonYearMap.get(row.season_id ?? "") ?? 0,
                    wins: row.wins ?? 0,
                    podiums: row.podiums ?? 0,
                    poles: row.poles ?? 0,
                    points: row.points ?? 0,
                    position: row.position ?? 0,
                    teamName,
                });

                driverMap.set(name, existing);
            }

            // Fix bestFinish for drivers with Infinity
            const drivers = [...driverMap.values()].map((d) => ({
                ...d,
                bestFinish: d.bestFinish === Infinity ? 0 : d.bestFinish,
            }));

            // 5. Aggregate teams by name
            const teamMap = new Map<string, AllTimeTeamStat>();
            for (const row of ctorStandings ?? []) {
                const name = row.team_name ?? "";
                if (!name) continue;

                const existing = teamMap.get(name) ?? {
                    name,
                    totalWins: 0,
                    totalPodiums: 0,
                    totalPoles: 0,
                    totalPoints: 0,
                    seasonsCount: 0,
                    bestFinish: Infinity,
                };

                existing.totalWins += row.wins ?? 0;
                existing.totalPodiums += row.podiums ?? 0;
                existing.totalPoles += row.poles ?? 0;
                existing.totalPoints += row.points ?? 0;
                existing.seasonsCount += 1;

                const pos = row.position ?? Infinity;
                if (pos < existing.bestFinish) existing.bestFinish = pos;

                teamMap.set(name, existing);
            }

            const teams = [...teamMap.values()].map((t) => ({
                ...t,
                bestFinish: t.bestFinish === Infinity ? 0 : t.bestFinish,
            }));

            return { drivers, teams, seasons: seasons ?? [] };
        },
        enabled: !!universeId,
    });
}

// ─── Hook 3 : useRaceWinDetails ─────────────────────────────────────────────

export function useRaceWinDetails(universeId: string) {
    return useQuery({
        queryKey: historyKeys.raceWins(universeId),
        queryFn: async () => {
            // 1. Completed + active seasons
            const { data: seasons, error: sErr } = await supabase
                .from("seasons")
                .select("id, year")
                .eq("universe_id", universeId)
                .in("status", ["completed", "active"])
                .order("year", { ascending: true });
            if (sErr) throw sErr;

            const seasonIds = seasons?.map((s) => s.id) ?? [];
            if (seasonIds.length === 0) {
                return { wins: [] as RaceWinDetail[], podiums: [] as PodiumDetail[], allRaces: [] as { year: number; round: number }[] };
            }

            const seasonYearMap = new Map<string, number>();
            for (const s of seasons ?? []) {
                seasonYearMap.set(s.id, s.year);
            }

            // 2. Completed races with circuit info
            const { data: races, error: rErr } = await supabase
                .from("calendar")
                .select("id, round_number, season_id, circuit:circuits(name, flag_emoji)")
                .in("season_id", seasonIds)
                .eq("status", "completed")
                .order("round_number", { ascending: true });
            if (rErr) throw rErr;

            const raceIds = races?.map((r) => r.id) ?? [];
            if (raceIds.length === 0) {
                return { wins: [] as RaceWinDetail[], podiums: [] as PodiumDetail[], allRaces: [] as { year: number; round: number }[] };
            }

            // Build race info map
            const raceInfoMap = new Map<string, { year: number; round: number; circuitName: string; flagEmoji: string }>();
            for (const r of races ?? []) {
                const circuit = r.circuit as { name: string | null; flag_emoji: string | null } | null;
                raceInfoMap.set(r.id, {
                    year: seasonYearMap.get(r.season_id) ?? 0,
                    round: r.round_number,
                    circuitName: circuit?.name ?? "",
                    flagEmoji: circuit?.flag_emoji ?? "",
                });
            }

            // 3. P1 results (wins)
            const { data: winResults, error: wErr } = await supabase
                .from("race_results")
                .select("race_id, driver_id, driver:drivers(first_name, last_name, team_id)")
                .in("race_id", raceIds)
                .eq("finish_position", 1);
            if (wErr) throw wErr;

            // 4. P1-P3 results (podiums)
            const { data: podiumResults, error: pErr } = await supabase
                .from("race_results")
                .select("race_id, driver_id, finish_position, driver:drivers(first_name, last_name)")
                .in("race_id", raceIds)
                .lte("finish_position", 3);
            if (pErr) throw pErr;

            // 5. Teams map for team name resolution
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

            // 6. Build wins list
            const wins: RaceWinDetail[] = [];
            for (const w of winResults ?? []) {
                const raceInfo = raceInfoMap.get(w.race_id);
                if (!raceInfo) continue;
                const driver = w.driver as { first_name: string | null; last_name: string | null; team_id: string | null } | null;
                wins.push({
                    driverName: `${driver?.first_name ?? ""} ${driver?.last_name ?? ""}`.trim(),
                    teamName: teamNameMap.get(driver?.team_id ?? "") ?? "",
                    circuitName: raceInfo.circuitName,
                    flagEmoji: raceInfo.flagEmoji,
                    year: raceInfo.year,
                    round: raceInfo.round,
                });
            }

            // Sort chronologically
            wins.sort((a, b) => a.year - b.year || a.round - b.round);

            // 7. Build podiums list
            const podiums: PodiumDetail[] = [];
            for (const p of podiumResults ?? []) {
                const raceInfo = raceInfoMap.get(p.race_id);
                if (!raceInfo) continue;
                const driver = p.driver as { first_name: string | null; last_name: string | null } | null;
                podiums.push({
                    driverName: `${driver?.first_name ?? ""} ${driver?.last_name ?? ""}`.trim(),
                    position: p.finish_position ?? 0,
                    year: raceInfo.year,
                    round: raceInfo.round,
                });
            }

            podiums.sort((a, b) => a.year - b.year || a.round - b.round);

            // 8. All races ordered (for streak computation)
            const allRaces = [...raceInfoMap.values()].sort((a, b) => a.year - b.year || a.round - b.round);

            return { wins, podiums, allRaces };
        },
        enabled: !!universeId,
    });
}

// ─── Streak computation ─────────────────────────────────────────────────────

export function computeStreaks(
    allRaces: { year: number; round: number }[],
    results: { driverName: string; year: number; round: number }[],
): StreakRecord[] {
    // Build set of (year, round) → driverName for quick lookup
    const resultMap = new Map<string, string>();
    for (const r of results) {
        resultMap.set(`${r.year}-${r.round}`, r.driverName);
    }

    // Track current streak per driver
    const currentStreak = new Map<string, { count: number; fromYear: number; fromRound: number }>();
    const bestStreak = new Map<string, StreakRecord>();

    for (const race of allRaces) {
        const key = `${race.year}-${race.round}`;
        const driverInRace = resultMap.get(key);

        // For each driver with an active streak, check if they continue
        for (const [name, streak] of currentStreak) {
            if (name !== driverInRace) {
                // Streak broken — check if it's the best
                const best = bestStreak.get(name);
                if (!best || streak.count > best.streak) {
                    bestStreak.set(name, {
                        driverName: name,
                        streak: streak.count,
                        fromYear: streak.fromYear,
                        fromRound: streak.fromRound,
                        toYear: race.year,
                        toRound: race.round,
                    });
                }
                currentStreak.delete(name);
            }
        }

        // Extend or start streak for the current result driver
        if (driverInRace) {
            const existing = currentStreak.get(driverInRace);
            if (existing) {
                existing.count += 1;
            } else {
                currentStreak.set(driverInRace, {
                    count: 1,
                    fromYear: race.year,
                    fromRound: race.round,
                });
            }
        }
    }

    // Flush remaining active streaks
    const lastRace = allRaces[allRaces.length - 1];
    for (const [name, streak] of currentStreak) {
        const best = bestStreak.get(name);
        if (!best || streak.count > best.streak) {
            bestStreak.set(name, {
                driverName: name,
                streak: streak.count,
                fromYear: streak.fromYear,
                fromRound: streak.fromRound,
                toYear: lastRace?.year ?? streak.fromYear,
                toRound: lastRace?.round ?? streak.fromRound,
            });
        }
    }

    return [...bestStreak.values()].sort((a, b) => b.streak - a.streak);
}

/** Compute podium streaks (where a driver finishes P1-P3 in consecutive races) */
export function computePodiumStreaks(
    allRaces: { year: number; round: number }[],
    podiums: { driverName: string; year: number; round: number }[],
): StreakRecord[] {
    // Build set of drivers who got a podium per race
    const podiumByRace = new Map<string, Set<string>>();
    for (const p of podiums) {
        const key = `${p.year}-${p.round}`;
        if (!podiumByRace.has(key)) podiumByRace.set(key, new Set());
        podiumByRace.get(key)!.add(p.driverName);
    }

    // Track per driver
    const currentStreak = new Map<string, { count: number; fromYear: number; fromRound: number }>();
    const bestStreak = new Map<string, StreakRecord>();

    for (const race of allRaces) {
        const key = `${race.year}-${race.round}`;
        const driversOnPodium = podiumByRace.get(key) ?? new Set<string>();

        // Check all active streaks
        for (const [name, streak] of currentStreak) {
            if (!driversOnPodium.has(name)) {
                const best = bestStreak.get(name);
                if (!best || streak.count > best.streak) {
                    bestStreak.set(name, {
                        driverName: name,
                        streak: streak.count,
                        fromYear: streak.fromYear,
                        fromRound: streak.fromRound,
                        toYear: race.year,
                        toRound: race.round,
                    });
                }
                currentStreak.delete(name);
            }
        }

        // Extend or start streaks for podium drivers
        for (const name of driversOnPodium) {
            const existing = currentStreak.get(name);
            if (existing) {
                existing.count += 1;
            } else {
                currentStreak.set(name, {
                    count: 1,
                    fromYear: race.year,
                    fromRound: race.round,
                });
            }
        }
    }

    // Flush remaining
    const lastRace = allRaces[allRaces.length - 1];
    for (const [name, streak] of currentStreak) {
        const best = bestStreak.get(name);
        if (!best || streak.count > best.streak) {
            bestStreak.set(name, {
                driverName: name,
                streak: streak.count,
                fromYear: streak.fromYear,
                fromRound: streak.fromRound,
                toYear: lastRace?.year ?? streak.fromYear,
                toRound: lastRace?.round ?? streak.fromRound,
            });
        }
    }

    return [...bestStreak.values()].sort((a, b) => b.streak - a.streak);
}

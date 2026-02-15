"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRace } from "@/hooks/use-qualifying";
import { useSeason } from "@/hooks/use-seasons";
import { useDriverStandings, useConstructorStandings } from "@/hooks/use-standings";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useDriverPredictions, useConstructorPredictions } from "@/hooks/use-predictions";
import type {
    PreRaceExportData,
    StandingRow,
    PredictionRow,
    NarrativeArcData,
    RecentRaceData,
} from "@/lib/export/pre-race-template";

const supabase = createClient();

// ─── Query keys ─────────────────────────────────────────────────────────────

const recentFormKeys = {
    bySeason: (seasonId: string, beforeRound: number) =>
        ["recent-form", { seasonId, beforeRound }] as const,
};

// ─── Recent form query ──────────────────────────────────────────────────────

function useRecentForm(seasonId: string, beforeRound: number) {
    return useQuery({
        queryKey: recentFormKeys.bySeason(seasonId, beforeRound),
        queryFn: async () => {
            const { data: races, error: racesError } = await supabase
                .from("calendar")
                .select("*, circuit:circuits(*)")
                .eq("season_id", seasonId)
                .eq("status", "completed")
                .lt("round_number", beforeRound)
                .order("round_number", { ascending: false })
                .limit(3);
            if (racesError) throw racesError;
            if (!races || races.length === 0) return [];

            const results = await Promise.all(
                races.map(async (race) => {
                    const { data, error } = await supabase
                        .from("race_results")
                        .select("*, driver:v_drivers_with_effective(*)")
                        .eq("race_id", race.id)
                        .not("finish_position", "is", null)
                        .order("finish_position")
                        .limit(3);
                    if (error) throw error;
                    return { race, results: data ?? [] };
                }),
            );
            return results;
        },
        enabled: !!seasonId && beforeRound > 1,
    });
}

// ─── Main hook ──────────────────────────────────────────────────────────────

export function usePreRaceExport(seasonId: string, raceId: string) {
    const { data: race, isLoading: raceLoading, error: raceError } = useRace(raceId);
    const { data: season, isLoading: seasonLoading } = useSeason(seasonId);
    const { data: driverStandingsRaw, isLoading: dsLoading } = useDriverStandings(seasonId);
    const { data: constructorStandingsRaw, isLoading: csLoading } = useConstructorStandings(seasonId);
    const { data: driverPredictionsRaw, isLoading: dpLoading } = useDriverPredictions(seasonId);
    const { data: constructorPredictionsRaw, isLoading: cpLoading } = useConstructorPredictions(seasonId);
    const { data: narrativeArcsRaw, isLoading: naLoading } = useNarrativeArcs(season?.universe_id ?? "");
    const { data: recentFormRaw, isLoading: rfLoading } = useRecentForm(
        seasonId,
        race?.round_number ?? 1,
    );

    const isLoading =
        raceLoading || seasonLoading || dsLoading || csLoading ||
        dpLoading || cpLoading || naLoading || rfLoading;

    const data = useMemo<PreRaceExportData | null>(() => {
        if (!race || !season) return null;

        const circuit = race.circuit as {
            name: string;
            country: string;
            flag_emoji: string | null;
            circuit_type: string | null;
            key_attribute: string | null;
            region_climate: string | null;
            prestige: number | null;
            base_rain_probability: number | null;
        } | null;

        if (!circuit) return null;

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
        // Build actual position map from current standings
        const driverActualPositionMap = new Map<string, number>();
        driverStandings.forEach((s) => {
            // Find the matching driver_id from raw standings
            const raw = driverStandingsRaw?.find(
                (r) => `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() === s.name,
            );
            if (raw?.driver_id) {
                driverActualPositionMap.set(raw.driver_id, s.position);
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

        // ─── Narrative arcs mapping ──────────────────────────────────────
        const narrativeArcs: NarrativeArcData[] = (narrativeArcsRaw ?? []).map((a) => ({
            name: a.name,
            arc_type: a.arc_type ?? "other",
            status: a.status ?? "signal",
            importance: a.importance ?? 1,
            description: a.description,
        }));

        // ─── Recent form mapping ─────────────────────────────────────────
        const recentForm: RecentRaceData[] = (recentFormRaw ?? []).map((entry) => {
            const raceCircuit = entry.race.circuit as {
                name: string;
                flag_emoji: string | null;
            } | null;

            return {
                round_number: entry.race.round_number,
                circuit_name: raceCircuit?.name ?? "",
                flag_emoji: raceCircuit?.flag_emoji ?? "",
                weather: entry.race.weather ?? "dry",
                podium: entry.results.map((r, i) => {
                    const d = r.driver as {
                        full_name: string | null;
                        team_id: string | null;
                    } | null;
                    // Find team name from constructor standings
                    const teamName =
                        constructorStandingsRaw?.find((cs) => cs.team_id === d?.team_id)
                            ?.team_name ?? "—";
                    return {
                        position: i + 1,
                        driver_name: d?.full_name ?? "",
                        team_name: teamName,
                    };
                }),
                notable_events: entry.race.notable_events,
            };
        });

        return {
            round_number: race.round_number,
            year: season.year,
            circuit: {
                name: circuit.name,
                country: circuit.country,
                flag_emoji: circuit.flag_emoji ?? "",
                circuit_type: circuit.circuit_type ?? "",
                key_attribute: circuit.key_attribute ?? "",
                region_climate: circuit.region_climate ?? "",
                prestige: circuit.prestige ?? 0,
                rain_probability: race.rain_probability ?? circuit.base_rain_probability ?? 0,
            },
            driverStandings,
            constructorStandings,
            driverPredictions,
            constructorPredictions,
            narrativeArcs,
            recentForm,
        };
    }, [
        race,
        season,
        driverStandingsRaw,
        constructorStandingsRaw,
        driverPredictionsRaw,
        constructorPredictionsRaw,
        narrativeArcsRaw,
        recentFormRaw,
    ]);

    return {
        data,
        isLoading,
        error: raceError,
    };
}

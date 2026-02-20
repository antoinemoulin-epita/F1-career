import { createClient } from "@/lib/supabase/client";
import type { UniverseExportData } from "./json-schema";

export type ImportResult = {
    universeId: string;
    seasonCount: number;
    errors: string[];
};

export async function importUniverse(data: UniverseExportData): Promise<ImportResult> {
    const supabase = createClient();
    const errors: string[] = [];

    // ID mappings: old export ID → new DB ID
    const seasonMap = new Map<string, string>();
    const engineSupplierMap = new Map<string, string>();
    const teamMap = new Map<string, string>();
    const driverMap = new Map<string, string>();
    const raceMap = new Map<string, string>();
    const arcMap = new Map<string, string>();

    // Helper to remap an ID, returning null if not found
    function remap(map: Map<string, string>, oldId: string | null | undefined, label: string): string | null {
        if (!oldId) return null;
        const newId = map.get(oldId);
        if (!newId) {
            errors.push(`Could not remap ${label}: ${oldId}`);
            return null;
        }
        return newId;
    }

    // ─── 1. Create universe ─────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: newUniverse, error: uError } = await supabase
        .from("universes")
        .insert({
            name: data.universe.name,
            description: data.universe.description ?? null,
            start_year: data.universe.start_year,
            user_id: user.id,
        })
        .select()
        .single();
    if (uError) throw new Error(`Failed to create universe: ${uError.message}`);
    const universeId = newUniverse.id;

    // ─── 2. Points system ───────────────────────────────────────────────────
    if (data.pointsSystem.length > 0) {
        const { error } = await supabase
            .from("points_system")
            .insert(data.pointsSystem.map((p) => ({
                universe_id: universeId,
                position: p.position,
                points: p.points,
            })));
        if (error) errors.push(`Points system: ${error.message}`);
    }

    // ─── 3. Regulations ─────────────────────────────────────────────────────
    if (data.regulations.length > 0) {
        const { error } = await supabase
            .from("regulations")
            .insert(data.regulations.map((r) => ({
                universe_id: universeId,
                effective_year: r.effective_year,
                name: r.name ?? null,
                description: r.description ?? null,
                affects_aero: r.affects_aero ?? null,
                affects_chassis: r.affects_chassis ?? null,
                affects_motor: r.affects_motor ?? null,
                reset_type: r.reset_type as never ?? null,
            })));
        if (error) errors.push(`Regulations: ${error.message}`);
    }

    // ─── 4. Narrative arcs ──────────────────────────────────────────────────
    // Insert without season FK references first, then update after seasons are created
    const arcsToUpdate: { exportId: string; started_season_id?: string | null; resolved_season_id?: string | null }[] = [];

    for (const arc of data.narrativeArcs) {
        const { data: newArc, error } = await supabase
            .from("narrative_arcs")
            .insert({
                universe_id: universeId,
                name: arc.name,
                description: arc.description ?? null,
                arc_type: arc.arc_type as never ?? null,
                status: arc.status as never ?? null,
                importance: arc.importance ?? null,
                related_driver_ids: arc.related_driver_ids ?? [],
                related_team_ids: arc.related_team_ids ?? [],
                started_round: arc.started_round ?? null,
                resolved_round: arc.resolved_round ?? null,
                resolution_summary: arc.resolution_summary ?? null,
            })
            .select()
            .single();
        if (error) {
            errors.push(`Narrative arc "${arc.name}": ${error.message}`);
            continue;
        }
        arcMap.set(arc._exportId, newArc.id);

        // Track season FK references for later update
        if (arc.started_season_id || arc.resolved_season_id) {
            arcsToUpdate.push({
                exportId: arc._exportId,
                started_season_id: arc.started_season_id,
                resolved_season_id: arc.resolved_season_id,
            });
        }
    }

    // ─── 5. Seasons ─────────────────────────────────────────────────────────
    let currentSeasonExportId: string | null = null;

    // Sort seasons by year ascending for proper ordering
    const sortedSeasons = [...data.seasons].sort((a, b) => a.year - b.year);

    for (const season of sortedSeasons) {
        if (season.isCurrent) currentSeasonExportId = season._exportId;

        // 5a. Create season
        const { data: newSeason, error: sError } = await supabase
            .from("seasons")
            .insert({
                universe_id: universeId,
                year: season.year,
                status: season.status as never ?? null,
                gp_count: season.gp_count ?? null,
                quali_laps: season.quali_laps ?? null,
                race_laps: season.race_laps ?? null,
                predictions_locked: season.predictions_locked ?? null,
            })
            .select()
            .single();
        if (sError) {
            errors.push(`Season ${season.year}: ${sError.message}`);
            continue;
        }
        const newSeasonId = newSeason.id;
        seasonMap.set(season._exportId, newSeasonId);

        // 5a-bis. Season-level points system
        if (season.pointsSystem && season.pointsSystem.length > 0) {
            const { error } = await supabase
                .from("points_system")
                .insert(season.pointsSystem.map((p) => ({
                    universe_id: universeId,
                    season_id: newSeasonId,
                    position: p.position,
                    points: p.points,
                })));
            if (error) errors.push(`Season points system (season ${season.year}): ${error.message}`);
        }

        // 5b. Engine suppliers
        for (const es of season.engineSuppliers) {
            const { data: newEs, error } = await supabase
                .from("engine_suppliers")
                .insert({
                    season_id: newSeasonId,
                    name: es.name,
                    nationality: es.nationality ?? null,
                    note: es.note,
                    investment_level: es.investment_level ?? null,
                })
                .select()
                .single();
            if (error) {
                errors.push(`Engine supplier "${es.name}" (season ${season.year}): ${error.message}`);
                continue;
            }
            engineSupplierMap.set(es._exportId, newEs.id);
        }

        // 5c. Teams
        for (const team of season.teams) {
            const { data: newTeam, error } = await supabase
                .from("teams")
                .insert({
                    season_id: newSeasonId,
                    name: team.name,
                    short_name: team.short_name ?? null,
                    nationality: team.nationality ?? null,
                    color_primary: team.color_primary ?? null,
                    color_secondary: team.color_secondary ?? null,
                    team_principal: team.team_principal ?? null,
                    technical_director: team.technical_director ?? null,
                    engineer_level: team.engineer_level ?? null,
                    engine_supplier_id: remap(engineSupplierMap, team.engine_supplier_id, "engine_supplier"),
                    is_factory_team: team.is_factory_team ?? null,
                    shareholders: team.shareholders ?? null,
                    owner_investment: team.owner_investment ?? null,
                    sponsor_investment: team.sponsor_investment ?? null,
                    surperformance_bonus: team.surperformance_bonus ?? null,
                    title_sponsor: team.title_sponsor ?? null,
                    sponsor_duration: team.sponsor_duration ?? null,
                    sponsor_objective: team.sponsor_objective ?? null,
                    sponsor_objective_met: team.sponsor_objective_met ?? null,
                })
                .select()
                .single();
            if (error) {
                errors.push(`Team "${team.name}" (season ${season.year}): ${error.message}`);
                continue;
            }
            teamMap.set(team._exportId, newTeam.id);
        }

        // 5d. Drivers
        for (const driver of season.drivers) {
            const { data: newDriver, error } = await supabase
                .from("drivers")
                .insert({
                    season_id: newSeasonId,
                    first_name: driver.first_name ?? null,
                    last_name: driver.last_name,
                    nationality: driver.nationality ?? null,
                    birth_year: driver.birth_year ?? null,
                    note: driver.note,
                    potential_min: driver.potential_min ?? null,
                    potential_max: driver.potential_max ?? null,
                    potential_revealed: driver.potential_revealed ?? null,
                    potential_final: driver.potential_final ?? null,
                    team_id: remap(teamMap, driver.team_id, "team"),
                    years_in_team: driver.years_in_team ?? null,
                    is_first_driver: driver.is_first_driver ?? null,
                    contract_years_remaining: driver.contract_years_remaining ?? null,
                    is_rookie: driver.is_rookie ?? null,
                    is_retiring: driver.is_retiring ?? null,
                    world_titles: driver.world_titles ?? null,
                    career_races: driver.career_races ?? null,
                    career_wins: driver.career_wins ?? null,
                    career_poles: driver.career_poles ?? null,
                    career_podiums: driver.career_podiums ?? null,
                    career_points: driver.career_points ?? null,
                })
                .select()
                .single();
            if (error) {
                errors.push(`Driver "${driver.last_name}" (season ${season.year}): ${error.message}`);
                continue;
            }
            driverMap.set(driver._exportId, newDriver.id);
        }

        // 5e. Cars
        if (season.cars.length > 0) {
            const carRows = season.cars
                .map((c) => {
                    const newTeamId = remap(teamMap, c.team_id, "team (car)");
                    if (!newTeamId) return null;
                    return {
                        team_id: newTeamId,
                        motor: c.motor,
                        aero: c.aero,
                        chassis: c.chassis,
                        engine_change_penalty: c.engine_change_penalty ?? null,
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (carRows.length > 0) {
                const { error } = await supabase.from("cars").insert(carRows);
                if (error) errors.push(`Cars (season ${season.year}): ${error.message}`);
            }
        }

        // 5f. Calendar
        for (const race of season.calendar) {
            const { data: newRace, error } = await supabase
                .from("calendar")
                .insert({
                    season_id: newSeasonId,
                    circuit_id: race.circuit_id,
                    round_number: race.round_number,
                    status: race.status as never ?? null,
                    weather: race.weather as never ?? null,
                    rain_probability: race.rain_probability ?? null,
                    notable_events: race.notable_events ?? null,
                })
                .select()
                .single();
            if (error) {
                errors.push(`Race round ${race.round_number} (season ${season.year}): ${error.message}`);
                continue;
            }
            raceMap.set(race._exportId, newRace.id);
        }

        // 5g. Qualifying results
        if (season.qualifyingResults.length > 0) {
            const qRows = season.qualifyingResults
                .map((q) => {
                    const newRaceId = remap(raceMap, q.race_id, "race (qualifying)");
                    const newDriverId = remap(driverMap, q.driver_id, "driver (qualifying)");
                    if (!newRaceId || !newDriverId) return null;
                    return {
                        race_id: newRaceId,
                        driver_id: newDriverId,
                        position: q.position,
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (qRows.length > 0) {
                const { error } = await supabase.from("qualifying_results").insert(qRows);
                if (error) errors.push(`Qualifying results (season ${season.year}): ${error.message}`);
            }
        }

        // 5h. Race results
        if (season.raceResults.length > 0) {
            const rrRows = season.raceResults
                .map((r) => {
                    const newRaceId = remap(raceMap, r.race_id, "race (result)");
                    const newDriverId = remap(driverMap, r.driver_id, "driver (result)");
                    if (!newRaceId || !newDriverId) return null;
                    return {
                        race_id: newRaceId,
                        driver_id: newDriverId,
                        grid_position: r.grid_position,
                        finish_position: r.finish_position ?? null,
                        status: r.status as never ?? null,
                        points: r.points ?? null,
                        fastest_lap: r.fastest_lap ?? null,
                        dnf_lap: r.dnf_lap ?? null,
                        dnf_reason: r.dnf_reason ?? null,
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (rrRows.length > 0) {
                const { error } = await supabase.from("race_results").insert(rrRows);
                if (error) errors.push(`Race results (season ${season.year}): ${error.message}`);
            }
        }

        // 5i. Standings drivers
        if (season.standingsDrivers.length > 0) {
            const sdRows = season.standingsDrivers
                .map((s) => {
                    const newDriverId = remap(driverMap, s.driver_id, "driver (standings)");
                    if (!newDriverId) return null;
                    return {
                        season_id: newSeasonId,
                        after_round: s.after_round,
                        driver_id: newDriverId,
                        position: s.position,
                        points: s.points ?? null,
                        wins: s.wins ?? null,
                        podiums: s.podiums ?? null,
                        poles: s.poles ?? null,
                        fastest_laps: s.fastest_laps ?? null,
                        dnfs: s.dnfs ?? null,
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (sdRows.length > 0) {
                const { error } = await supabase.from("standings_drivers").insert(sdRows);
                if (error) errors.push(`Standings drivers (season ${season.year}): ${error.message}`);
            }
        }

        // 5j. Standings constructors
        if (season.standingsConstructors.length > 0) {
            const scRows = season.standingsConstructors
                .map((s) => {
                    const newTeamId = remap(teamMap, s.team_id, "team (standings)");
                    if (!newTeamId) return null;
                    return {
                        season_id: newSeasonId,
                        after_round: s.after_round,
                        team_id: newTeamId,
                        position: s.position,
                        points: s.points ?? null,
                        wins: s.wins ?? null,
                        podiums: s.podiums ?? null,
                        poles: s.poles ?? null,
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (scRows.length > 0) {
                const { error } = await supabase.from("standings_constructors").insert(scRows);
                if (error) errors.push(`Standings constructors (season ${season.year}): ${error.message}`);
            }
        }

        // 5k. Predictions drivers
        if (season.predictionsDrivers.length > 0) {
            const pdRows = season.predictionsDrivers
                .map((p) => {
                    const newDriverId = remap(driverMap, p.driver_id, "driver (prediction)");
                    if (!newDriverId) return null;
                    return {
                        season_id: newSeasonId,
                        driver_id: newDriverId,
                        predicted_position: p.predicted_position,
                        score: p.score ?? null,
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (pdRows.length > 0) {
                const { error } = await supabase.from("predictions_drivers").insert(pdRows);
                if (error) errors.push(`Predictions drivers (season ${season.year}): ${error.message}`);
            }
        }

        // 5l. Predictions constructors
        if (season.predictionsConstructors.length > 0) {
            const pcRows = season.predictionsConstructors
                .map((p) => {
                    const newTeamId = remap(teamMap, p.team_id, "team (prediction)");
                    if (!newTeamId) return null;
                    return {
                        season_id: newSeasonId,
                        team_id: newTeamId,
                        predicted_position: p.predicted_position,
                        score: p.score ?? null,
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (pcRows.length > 0) {
                const { error } = await supabase.from("predictions_constructors").insert(pcRows);
                if (error) errors.push(`Predictions constructors (season ${season.year}): ${error.message}`);
            }
        }

        // 5m. News
        if (season.news.length > 0) {
            const newsRows = season.news.map((n) => ({
                season_id: newSeasonId,
                headline: n.headline,
                content: n.content ?? null,
                news_type: n.news_type as never ?? null,
                importance: n.importance ?? null,
                after_round: n.after_round ?? null,
                arc_id: remap(arcMap, n.arc_id, "arc (news)"),
            }));

            const { error } = await supabase.from("news").insert(newsRows);
            if (error) errors.push(`News (season ${season.year}): ${error.message}`);
        }

        // 5n. Transfers
        if (season.transfers.length > 0) {
            const transferRows = season.transfers
                .map((t) => {
                    const newDriverId = remap(driverMap, t.driver_id, "driver (transfer)");
                    if (!newDriverId) return null;
                    return {
                        season_id: newSeasonId,
                        driver_id: newDriverId,
                        from_team_id: remap(teamMap, t.from_team_id, "from_team (transfer)"),
                        to_team_id: remap(teamMap, t.to_team_id, "to_team (transfer)"),
                        transfer_type: t.transfer_type as never ?? null,
                        effective_year: t.effective_year,
                        contract_years: t.contract_years ?? null,
                        is_first_driver: t.is_first_driver ?? null,
                        arc_id: remap(arcMap, t.arc_id, "arc (transfer)"),
                    };
                })
                .filter((r): r is NonNullable<typeof r> => r !== null);

            if (transferRows.length > 0) {
                const { error } = await supabase.from("transfers").insert(transferRows);
                if (error) errors.push(`Transfers (season ${season.year}): ${error.message}`);
            }
        }
    }

    // ─── 6. Rookie pool ─────────────────────────────────────────────────────
    if (data.rookiePool.length > 0) {
        const rookieRows = data.rookiePool.map((r) => ({
            universe_id: universeId,
            first_name: r.first_name ?? null,
            last_name: r.last_name,
            nationality: r.nationality ?? null,
            birth_year: r.birth_year ?? null,
            potential_min: r.potential_min,
            potential_max: r.potential_max,
            available_from_year: r.available_from_year ?? null,
            drafted: r.drafted ?? null,
            drafted_season_id: remap(seasonMap, r.drafted_season_id, "season (rookie drafted)"),
            drafted_team_name: r.drafted_team_name ?? null,
        }));

        const { error } = await supabase.from("rookie_pool").insert(rookieRows);
        if (error) errors.push(`Rookie pool: ${error.message}`);
    }

    // ─── 7. History champions ───────────────────────────────────────────────
    if (data.historyChampions.length > 0) {
        const { error } = await supabase
            .from("history_champions")
            .insert(data.historyChampions.map((h) => ({
                universe_id: universeId,
                year: h.year,
                champion_driver_name: h.champion_driver_name ?? null,
                champion_driver_team: h.champion_driver_team ?? null,
                champion_driver_points: h.champion_driver_points ?? null,
                champion_team_name: h.champion_team_name ?? null,
                champion_team_points: h.champion_team_points ?? null,
                season_summary: h.season_summary ?? null,
            })));
        if (error) errors.push(`History champions: ${error.message}`);
    }

    // ─── 8. Update narrative arcs season references ─────────────────────────
    for (const arc of arcsToUpdate) {
        const newArcId = arcMap.get(arc.exportId);
        if (!newArcId) continue;

        const updates: Record<string, string | null> = {};
        if (arc.started_season_id) {
            updates.started_season_id = remap(seasonMap, arc.started_season_id, "season (arc started)");
        }
        if (arc.resolved_season_id) {
            updates.resolved_season_id = remap(seasonMap, arc.resolved_season_id, "season (arc resolved)");
        }

        if (Object.keys(updates).length > 0) {
            const { error } = await supabase
                .from("narrative_arcs")
                .update(updates)
                .eq("id", newArcId);
            if (error) errors.push(`Update arc season refs: ${error.message}`);
        }
    }

    // ─── 9. Set current_season_id ───────────────────────────────────────────
    const lastSeasonId = currentSeasonExportId
        ? seasonMap.get(currentSeasonExportId)
        : sortedSeasons.length > 0
            ? seasonMap.get(sortedSeasons[sortedSeasons.length - 1]._exportId)
            : null;

    if (lastSeasonId) {
        const { error } = await supabase
            .from("universes")
            .update({ current_season_id: lastSeasonId })
            .eq("id", universeId);
        if (error) errors.push(`Set current season: ${error.message}`);
    }

    return {
        universeId,
        seasonCount: data.seasons.length,
        errors,
    };
}

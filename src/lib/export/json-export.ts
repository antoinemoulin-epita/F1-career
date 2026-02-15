import { createClient } from "@/lib/supabase/client";

// ─── Export types ────────────────────────────────────────────────────────────

export interface UniverseExport {
    version: "1.0";
    exportDate: string;
    universe: {
        name: string;
        description: string | null;
        start_year: number;
    };
    pointsSystem: {
        position: number;
        points: number;
    }[];
    regulations: {
        effective_year: number;
        name: string | null;
        description: string | null;
        affects_aero: boolean | null;
        affects_chassis: boolean | null;
        affects_motor: boolean | null;
        reset_type: string | null;
    }[];
    rookiePool: {
        first_name: string | null;
        last_name: string;
        nationality: string | null;
        birth_year: number | null;
        potential_min: number;
        potential_max: number;
        available_from_year: number | null;
        drafted: boolean | null;
        drafted_season_id: string | null;
        drafted_team_name: string | null;
    }[];
    narrativeArcs: {
        _exportId: string;
        name: string;
        description: string | null;
        arc_type: string | null;
        status: string | null;
        importance: number | null;
        related_driver_ids: string[] | null;
        related_team_ids: string[] | null;
        started_season_id: string | null;
        started_round: number | null;
        resolved_season_id: string | null;
        resolved_round: number | null;
        resolution_summary: string | null;
    }[];
    historyChampions: {
        year: number;
        champion_driver_name: string | null;
        champion_driver_team: string | null;
        champion_driver_points: number | null;
        champion_team_name: string | null;
        champion_team_points: number | null;
        season_summary: string | null;
    }[];
    seasons: SeasonExport[];
}

export interface SeasonExport {
    _exportId: string;
    year: number;
    status: string | null;
    gp_count: number | null;
    quali_laps: number | null;
    race_laps: number | null;
    predictions_locked: boolean | null;
    isCurrent: boolean;
    engineSuppliers: {
        _exportId: string;
        name: string;
        nationality: string | null;
        note: number;
        investment_level: number | null;
    }[];
    teams: {
        _exportId: string;
        name: string;
        short_name: string | null;
        nationality: string | null;
        color_primary: string | null;
        color_secondary: string | null;
        team_principal: string | null;
        technical_director: string | null;
        engineer_level: number | null;
        engine_supplier_id: string | null;
        is_factory_team: boolean | null;
        shareholders: string | null;
        owner_investment: number | null;
        sponsor_investment: number | null;
        surperformance_bonus: number | null;
        title_sponsor: string | null;
        sponsor_duration: number | null;
        sponsor_objective: string | null;
        sponsor_objective_met: boolean | null;
    }[];
    drivers: {
        _exportId: string;
        first_name: string | null;
        last_name: string;
        nationality: string | null;
        birth_year: number | null;
        note: number;
        potential_min: number | null;
        potential_max: number | null;
        potential_revealed: boolean | null;
        potential_final: number | null;
        team_id: string | null;
        years_in_team: number | null;
        is_first_driver: boolean | null;
        contract_years_remaining: number | null;
        is_rookie: boolean | null;
        is_retiring: boolean | null;
        world_titles: number | null;
        career_races: number | null;
        career_wins: number | null;
        career_poles: number | null;
        career_podiums: number | null;
        career_points: number | null;
    }[];
    cars: {
        team_id: string | null;
        motor: number;
        aero: number;
        chassis: number;
        engine_change_penalty: boolean | null;
    }[];
    calendar: {
        _exportId: string;
        circuit_id: string;
        round_number: number;
        status: string | null;
        weather: string | null;
        rain_probability: number | null;
        notable_events: string | null;
    }[];
    qualifyingResults: {
        race_id: string;
        driver_id: string;
        position: number;
    }[];
    raceResults: {
        race_id: string;
        driver_id: string;
        grid_position: number;
        finish_position: number | null;
        status: string | null;
        points: number | null;
        fastest_lap: boolean | null;
        dnf_lap: number | null;
        dnf_reason: string | null;
    }[];
    standingsDrivers: {
        after_round: number;
        driver_id: string;
        position: number;
        points: number | null;
        wins: number | null;
        podiums: number | null;
        poles: number | null;
        fastest_laps: number | null;
        dnfs: number | null;
    }[];
    standingsConstructors: {
        after_round: number;
        team_id: string;
        position: number;
        points: number | null;
        wins: number | null;
        podiums: number | null;
        poles: number | null;
    }[];
    predictionsDrivers: {
        driver_id: string;
        predicted_position: number;
        score: number | null;
    }[];
    predictionsConstructors: {
        team_id: string;
        predicted_position: number;
        score: number | null;
    }[];
    news: {
        headline: string;
        content: string | null;
        news_type: string | null;
        importance: number | null;
        after_round: number | null;
        arc_id: string | null;
    }[];
    transfers: {
        driver_id: string;
        from_team_id: string | null;
        to_team_id: string | null;
        transfer_type: string | null;
        effective_year: number;
        contract_years: number | null;
        is_first_driver: boolean | null;
        arc_id: string | null;
    }[];
}

// ─── Export function ─────────────────────────────────────────────────────────

export async function exportUniverse(universeId: string): Promise<UniverseExport> {
    const supabase = createClient();

    // 1. Fetch universe
    const { data: universe, error: uError } = await supabase
        .from("universes")
        .select("*")
        .eq("id", universeId)
        .single();
    if (uError) throw new Error(`Failed to fetch universe: ${uError.message}`);

    // 2. Fetch universe-scoped data in parallel
    const [
        { data: pointsSystem },
        { data: regulations },
        { data: rookiePool },
        { data: narrativeArcs },
        { data: historyChampions },
        { data: seasons },
    ] = await Promise.all([
        supabase.from("points_system").select("*").eq("universe_id", universeId).order("position"),
        supabase.from("regulations").select("*").eq("universe_id", universeId).order("effective_year"),
        supabase.from("rookie_pool").select("*").eq("universe_id", universeId).order("last_name"),
        supabase.from("narrative_arcs").select("*").eq("universe_id", universeId),
        supabase.from("history_champions").select("*").eq("universe_id", universeId).order("year"),
        supabase.from("seasons").select("*").eq("universe_id", universeId).order("year"),
    ]);

    // 3. Fetch season-scoped data for each season
    const seasonExports: SeasonExport[] = [];

    for (const season of seasons ?? []) {
        const [
            { data: engineSuppliers },
            { data: teams },
            { data: drivers },
            { data: calendar },
            { data: predictionsDrivers },
            { data: predictionsConstructors },
            { data: standingsDrivers },
            { data: standingsConstructors },
            { data: news },
            { data: transfers },
        ] = await Promise.all([
            supabase.from("engine_suppliers").select("*").eq("season_id", season.id),
            supabase.from("teams").select("*").eq("season_id", season.id),
            supabase.from("drivers").select("*").eq("season_id", season.id),
            supabase.from("calendar").select("*").eq("season_id", season.id).order("round_number"),
            supabase.from("predictions_drivers").select("*").eq("season_id", season.id),
            supabase.from("predictions_constructors").select("*").eq("season_id", season.id),
            supabase.from("standings_drivers").select("*").eq("season_id", season.id),
            supabase.from("standings_constructors").select("*").eq("season_id", season.id),
            supabase.from("news").select("*").eq("season_id", season.id),
            supabase.from("transfers").select("*").eq("season_id", season.id),
        ]);

        // Fetch cars by team IDs
        const teamIds = (teams ?? []).map((t) => t.id);
        let cars: typeof carsResult.data = [];
        const carsResult = teamIds.length > 0
            ? await supabase.from("cars").select("*").in("team_id", teamIds)
            : { data: [] as never[], error: null };
        cars = carsResult.data ?? [];

        // Fetch qualifying and race results for each calendar entry
        const raceIds = (calendar ?? []).map((c) => c.id);
        let qualifyingResults: typeof qResult.data = [];
        let raceResults: typeof rrResult.data = [];

        const qResult = raceIds.length > 0
            ? await supabase.from("qualifying_results").select("*").in("race_id", raceIds)
            : { data: [] as never[], error: null };
        qualifyingResults = qResult.data ?? [];

        const rrResult = raceIds.length > 0
            ? await supabase.from("race_results").select("*").in("race_id", raceIds)
            : { data: [] as never[], error: null };
        raceResults = rrResult.data ?? [];

        seasonExports.push({
            _exportId: season.id,
            year: season.year,
            status: season.status,
            gp_count: season.gp_count,
            quali_laps: season.quali_laps,
            race_laps: season.race_laps,
            predictions_locked: season.predictions_locked,
            isCurrent: season.id === universe.current_season_id,
            engineSuppliers: (engineSuppliers ?? []).map((es) => ({
                _exportId: es.id,
                name: es.name,
                nationality: es.nationality,
                note: es.note,
                investment_level: es.investment_level,
            })),
            teams: (teams ?? []).map((t) => ({
                _exportId: t.id,
                name: t.name,
                short_name: t.short_name,
                nationality: t.nationality,
                color_primary: t.color_primary,
                color_secondary: t.color_secondary,
                team_principal: t.team_principal,
                technical_director: t.technical_director,
                engineer_level: t.engineer_level,
                engine_supplier_id: t.engine_supplier_id,
                is_factory_team: t.is_factory_team,
                shareholders: t.shareholders,
                owner_investment: t.owner_investment,
                sponsor_investment: t.sponsor_investment,
                surperformance_bonus: t.surperformance_bonus,
                title_sponsor: t.title_sponsor,
                sponsor_duration: t.sponsor_duration,
                sponsor_objective: t.sponsor_objective,
                sponsor_objective_met: t.sponsor_objective_met,
            })),
            drivers: (drivers ?? []).map((d) => ({
                _exportId: d.id,
                first_name: d.first_name,
                last_name: d.last_name,
                nationality: d.nationality,
                birth_year: d.birth_year,
                note: d.note,
                potential_min: d.potential_min,
                potential_max: d.potential_max,
                potential_revealed: d.potential_revealed,
                potential_final: d.potential_final,
                team_id: d.team_id,
                years_in_team: d.years_in_team,
                is_first_driver: d.is_first_driver,
                contract_years_remaining: d.contract_years_remaining,
                is_rookie: d.is_rookie,
                is_retiring: d.is_retiring,
                world_titles: d.world_titles,
                career_races: d.career_races,
                career_wins: d.career_wins,
                career_poles: d.career_poles,
                career_podiums: d.career_podiums,
                career_points: d.career_points,
            })),
            cars: (cars ?? []).map((c) => ({
                team_id: c.team_id,
                motor: c.motor,
                aero: c.aero,
                chassis: c.chassis,
                engine_change_penalty: c.engine_change_penalty,
            })),
            calendar: (calendar ?? []).map((c) => ({
                _exportId: c.id,
                circuit_id: c.circuit_id,
                round_number: c.round_number,
                status: c.status,
                weather: c.weather,
                rain_probability: c.rain_probability,
                notable_events: c.notable_events,
            })),
            qualifyingResults: (qualifyingResults ?? []).map((q) => ({
                race_id: q.race_id,
                driver_id: q.driver_id,
                position: q.position,
            })),
            raceResults: (raceResults ?? []).map((r) => ({
                race_id: r.race_id,
                driver_id: r.driver_id,
                grid_position: r.grid_position,
                finish_position: r.finish_position,
                status: r.status,
                points: r.points,
                fastest_lap: r.fastest_lap,
                dnf_lap: r.dnf_lap,
                dnf_reason: r.dnf_reason,
            })),
            standingsDrivers: (standingsDrivers ?? []).map((s) => ({
                after_round: s.after_round,
                driver_id: s.driver_id,
                position: s.position,
                points: s.points,
                wins: s.wins,
                podiums: s.podiums,
                poles: s.poles,
                fastest_laps: s.fastest_laps,
                dnfs: s.dnfs,
            })),
            standingsConstructors: (standingsConstructors ?? []).map((s) => ({
                after_round: s.after_round,
                team_id: s.team_id,
                position: s.position,
                points: s.points,
                wins: s.wins,
                podiums: s.podiums,
                poles: s.poles,
            })),
            predictionsDrivers: (predictionsDrivers ?? []).map((p) => ({
                driver_id: p.driver_id,
                predicted_position: p.predicted_position,
                score: p.score,
            })),
            predictionsConstructors: (predictionsConstructors ?? []).map((p) => ({
                team_id: p.team_id,
                predicted_position: p.predicted_position,
                score: p.score,
            })),
            news: (news ?? []).map((n) => ({
                headline: n.headline,
                content: n.content,
                news_type: n.news_type,
                importance: n.importance,
                after_round: n.after_round,
                arc_id: n.arc_id,
            })),
            transfers: (transfers ?? []).map((t) => ({
                driver_id: t.driver_id,
                from_team_id: t.from_team_id,
                to_team_id: t.to_team_id,
                transfer_type: t.transfer_type,
                effective_year: t.effective_year,
                contract_years: t.contract_years,
                is_first_driver: t.is_first_driver,
                arc_id: t.arc_id,
            })),
        });
    }

    return {
        version: "1.0",
        exportDate: new Date().toISOString(),
        universe: {
            name: universe.name,
            description: universe.description,
            start_year: universe.start_year,
        },
        pointsSystem: (pointsSystem ?? []).map((p) => ({
            position: p.position,
            points: p.points,
        })),
        regulations: (regulations ?? []).map((r) => ({
            effective_year: r.effective_year,
            name: r.name,
            description: r.description,
            affects_aero: r.affects_aero,
            affects_chassis: r.affects_chassis,
            affects_motor: r.affects_motor,
            reset_type: r.reset_type,
        })),
        rookiePool: (rookiePool ?? []).map((r) => ({
            first_name: r.first_name,
            last_name: r.last_name,
            nationality: r.nationality,
            birth_year: r.birth_year,
            potential_min: r.potential_min,
            potential_max: r.potential_max,
            available_from_year: r.available_from_year,
            drafted: r.drafted,
            drafted_season_id: r.drafted_season_id,
            drafted_team_name: r.drafted_team_name,
        })),
        narrativeArcs: (narrativeArcs ?? []).map((a) => ({
            _exportId: a.id,
            name: a.name,
            description: a.description,
            arc_type: a.arc_type,
            status: a.status,
            importance: a.importance,
            related_driver_ids: a.related_driver_ids,
            related_team_ids: a.related_team_ids,
            started_season_id: a.started_season_id,
            started_round: a.started_round,
            resolved_season_id: a.resolved_season_id,
            resolved_round: a.resolved_round,
            resolution_summary: a.resolution_summary,
        })),
        historyChampions: (historyChampions ?? []).map((h) => ({
            year: h.year,
            champion_driver_name: h.champion_driver_name,
            champion_driver_team: h.champion_driver_team,
            champion_driver_points: h.champion_driver_points,
            champion_team_name: h.champion_team_name,
            champion_team_points: h.champion_team_points,
            season_summary: h.season_summary,
        })),
        seasons: seasonExports,
    };
}

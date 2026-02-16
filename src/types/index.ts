import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/lib/supabase/types";

// ─── Row types (read from DB) ────────────────────────────────────────────────

export type Universe = Tables<"universes">;
export type Season = Tables<"seasons">;
export type Team = Tables<"teams">;
export type Driver = Tables<"drivers">;
export type Car = Tables<"cars">;
export type EngineSupplier = Tables<"engine_suppliers">;
export type Circuit = Tables<"circuits">;
export type CalendarEntry = Tables<"calendar">;
export type QualifyingResult = Tables<"qualifying_results">;
export type RaceResult = Tables<"race_results">;
export type StandingsDriver = Tables<"standings_drivers">;
export type StandingsConstructor = Tables<"standings_constructors">;
export type PredictionDriver = Tables<"predictions_drivers">;
export type PredictionConstructor = Tables<"predictions_constructors">;
export type NarrativeArc = Tables<"narrative_arcs">;
export type News = Tables<"news">;
export type Transfer = Tables<"transfers">;
export type Regulation = Tables<"regulations">;
export type HistoryChampion = Tables<"history_champions">;
export type PointsSystem = Tables<"points_system">;
export type RookiePool = Tables<"rookie_pool">;
export type PersonIdentity = Tables<"person_identities">;
export type TeamIdentity = Tables<"team_identities">;
export type StaffMember = Tables<"staff_members">;

// ─── View types ──────────────────────────────────────────────────────────────

export type TeamWithBudget = Tables<"v_teams_with_budget">;
export type CarWithStats = Tables<"v_cars_with_stats">;
export type DriverWithEffective = Tables<"v_drivers_with_effective">;
export type CurrentStandingsDriver = Tables<"v_current_standings_drivers">;
export type CurrentStandingsConstructor = Tables<"v_current_standings_constructors">;
export type RaceSummary = Tables<"v_race_summary">;
export type PersonCareer = Tables<"v_person_career">;
export type PersonRaceHistory = Tables<"v_person_race_history">;
export type PersonSeason = Tables<"v_person_seasons">;
export type TeamIdentityHistory = Tables<"v_team_identity_history">;
export type TeamIdentityFull = Tables<"v_team_identity_full">;
export type CircuitProfile = Tables<"v_circuit_profile">;
export type StaffCareer = Tables<"v_staff_career">;
export type EngineSupplierHistory = Tables<"v_engine_supplier_history">;

// ─── Insert types (create) ───────────────────────────────────────────────────

export type UniverseInsert = TablesInsert<"universes">;
export type SeasonInsert = TablesInsert<"seasons">;
export type TeamInsert = TablesInsert<"teams">;
export type DriverInsert = TablesInsert<"drivers">;
export type CarInsert = TablesInsert<"cars">;
export type CalendarEntryInsert = TablesInsert<"calendar">;
export type RaceResultInsert = TablesInsert<"race_results">;
export type QualifyingResultInsert = TablesInsert<"qualifying_results">;

// ─── Update types (patch) ────────────────────────────────────────────────────

export type UniverseUpdate = TablesUpdate<"universes">;
export type SeasonUpdate = TablesUpdate<"seasons">;
export type TeamUpdate = TablesUpdate<"teams">;
export type DriverUpdate = TablesUpdate<"drivers">;
export type CarUpdate = TablesUpdate<"cars">;
export type CalendarEntryUpdate = TablesUpdate<"calendar">;
export type RaceResultUpdate = TablesUpdate<"race_results">;

// ─── Enum types ──────────────────────────────────────────────────────────────

export type SeasonStatus = Enums<"season_status">;
export type RaceStatus = Enums<"race_status">;
export type WeatherType = Enums<"weather_type">;
export type ResultStatus = Enums<"result_status">;
export type CircuitType = Enums<"circuit_type">;
export type KeyAttribute = Enums<"key_attribute">;
export type RegionClimate = Enums<"region_climate">;
export type ArcStatus = Enums<"arc_status">;
export type ArcType = Enums<"arc_type">;
export type NewsType = Enums<"news_type">;
export type TransferType = Enums<"transfer_type">;
export type ResetType = Enums<"reset_type">;

// ─── Form types ──────────────────────────────────────────────────────────────

export type CreateSeasonForm = {
    universe_id: string;
    year: number;
    gp_count?: number;
    quali_laps?: number;
    race_laps?: number;
};

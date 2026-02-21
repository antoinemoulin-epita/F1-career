import { describe, it, expect } from "vitest";
import { evaluateObjective } from "./sponsor-evaluation";
import type { SponsorObjective, CurrentStandingsDriver, CurrentStandingsConstructor } from "@/types";

// ─── Test helpers ────────────────────────────────────────────────────────────

function makeDriverStanding(overrides: Partial<CurrentStandingsDriver> = {}): CurrentStandingsDriver {
    return {
        id: null,
        driver_id: "d1",
        season_id: "s1",
        position: 1,
        points: 100,
        wins: 3,
        podiums: 5,
        poles: 2,
        fastest_laps: null,
        dnfs: null,
        after_round: 20,
        first_name: "Max",
        last_name: "Verstappen",
        team_name: "Red Bull",
        team_color: "#1E41FF",
        person_id: null,
        team_identity_id: null,
        created_at: null,
        ...overrides,
    };
}

function makeConstructorStanding(overrides: Partial<CurrentStandingsConstructor> = {}): CurrentStandingsConstructor {
    return {
        id: null,
        team_id: "t1",
        season_id: "s1",
        position: 1,
        points: 200,
        wins: 5,
        podiums: 10,
        poles: 4,
        after_round: 20,
        team_name: "Red Bull",
        team_color: "#1E41FF",
        team_identity_id: null,
        created_at: null,
        ...overrides,
    };
}

function makeObjective(overrides: Partial<SponsorObjective> = {}): SponsorObjective {
    return {
        id: "obj1",
        season_id: "s1",
        team_id: "t1",
        objective_type: "constructor_position",
        target_value: null,
        target_entity_id: null,
        description: null,
        is_met: null,
        evaluated_value: null,
        created_at: null,
        ...overrides,
    };
}

function makeContext(overrides: {
    driverStandings?: CurrentStandingsDriver[];
    constructorStandings?: CurrentStandingsConstructor[];
    teamWinCircuits?: Map<string, Set<string>>;
    driverTeamMap?: Map<string, string>;
} = {}) {
    return {
        driverStandings: overrides.driverStandings ?? [],
        constructorStandings: overrides.constructorStandings ?? [],
        teamWinCircuits: overrides.teamWinCircuits ?? new Map(),
        driverTeamMap: overrides.driverTeamMap ?? new Map(),
    };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("evaluateObjective", () => {
    // ─── constructor_position ────────────────────────────────────────

    describe("constructor_position", () => {
        it("is met when position <= target", () => {
            const obj = makeObjective({ objective_type: "constructor_position", target_value: 3 });
            const ctx = makeContext({
                constructorStandings: [makeConstructorStanding({ team_id: "t1", position: 2 })],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
            expect(result.evaluated_value).toBe(2);
        });

        it("is not met when position > target", () => {
            const obj = makeObjective({ objective_type: "constructor_position", target_value: 3 });
            const ctx = makeContext({
                constructorStandings: [makeConstructorStanding({ team_id: "t1", position: 5 })],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
        });
    });

    // ─── driver_position ─────────────────────────────────────────────

    describe("driver_position", () => {
        it("is met when driver finishes at or above target", () => {
            const obj = makeObjective({
                objective_type: "driver_position",
                target_value: 5,
                target_entity_id: "d1",
            });
            const ctx = makeContext({
                driverStandings: [makeDriverStanding({ driver_id: "d1", position: 3 })],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
        });

        it("is not met when driver finishes below target", () => {
            const obj = makeObjective({
                objective_type: "driver_position",
                target_value: 3,
                target_entity_id: "d1",
            });
            const ctx = makeContext({
                driverStandings: [makeDriverStanding({ driver_id: "d1", position: 7 })],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
        });
    });

    // ─── wins ────────────────────────────────────────────────────────

    describe("wins", () => {
        it("counts wins by team_id via driverTeamMap (not team_color)", () => {
            const obj = makeObjective({ objective_type: "wins", target_value: 3 });
            const ctx = makeContext({
                driverStandings: [
                    makeDriverStanding({ driver_id: "d1", wins: 2, team_color: "#FF0000" }),
                    makeDriverStanding({ driver_id: "d2", wins: 2, team_color: "#FF0000" }),
                ],
                driverTeamMap: new Map([["d1", "t1"], ["d2", "t1"]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
            expect(result.evaluated_value).toBe(4);
        });

        it("does not count drivers from other teams", () => {
            const obj = makeObjective({ objective_type: "wins", target_value: 3 });
            const ctx = makeContext({
                driverStandings: [
                    makeDriverStanding({ driver_id: "d1", wins: 2, team_color: "#FF0000" }),
                    makeDriverStanding({ driver_id: "d2", wins: 5, team_color: "#FF0000" }),
                ],
                driverTeamMap: new Map([["d1", "t1"], ["d2", "t2"]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
            expect(result.evaluated_value).toBe(2);
        });
    });

    // ─── podiums ─────────────────────────────────────────────────────

    describe("podiums", () => {
        it("counts podiums by team_id via driverTeamMap", () => {
            const obj = makeObjective({ objective_type: "podiums", target_value: 5 });
            const ctx = makeContext({
                driverStandings: [
                    makeDriverStanding({ driver_id: "d1", podiums: 3 }),
                    makeDriverStanding({ driver_id: "d2", podiums: 4 }),
                ],
                driverTeamMap: new Map([["d1", "t1"], ["d2", "t1"]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
            expect(result.evaluated_value).toBe(7);
        });

        it("is not met when podiums < target", () => {
            const obj = makeObjective({ objective_type: "podiums", target_value: 10 });
            const ctx = makeContext({
                driverStandings: [
                    makeDriverStanding({ driver_id: "d1", podiums: 3 }),
                ],
                driverTeamMap: new Map([["d1", "t1"]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
            expect(result.evaluated_value).toBe(3);
        });
    });

    // ─── points_minimum ──────────────────────────────────────────────

    describe("points_minimum", () => {
        it("is met when team points >= target", () => {
            const obj = makeObjective({ objective_type: "points_minimum", target_value: 100 });
            const ctx = makeContext({
                constructorStandings: [makeConstructorStanding({ team_id: "t1", points: 150 })],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
            expect(result.evaluated_value).toBe(150);
        });

        it("is not met when team points < target", () => {
            const obj = makeObjective({ objective_type: "points_minimum", target_value: 200 });
            const ctx = makeContext({
                constructorStandings: [makeConstructorStanding({ team_id: "t1", points: 150 })],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
        });
    });

    // ─── beat_team ───────────────────────────────────────────────────

    describe("beat_team", () => {
        it("is met when our team finishes ahead of rival", () => {
            const obj = makeObjective({
                objective_type: "beat_team",
                target_entity_id: "t2",
            });
            const ctx = makeContext({
                constructorStandings: [
                    makeConstructorStanding({ team_id: "t1", position: 2 }),
                    makeConstructorStanding({ team_id: "t2", position: 5 }),
                ],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
            expect(result.label).toBe("Devant");
        });

        it("is not met when our team finishes behind rival", () => {
            const obj = makeObjective({
                objective_type: "beat_team",
                target_entity_id: "t2",
            });
            const ctx = makeContext({
                constructorStandings: [
                    makeConstructorStanding({ team_id: "t1", position: 6 }),
                    makeConstructorStanding({ team_id: "t2", position: 3 }),
                ],
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
            expect(result.label).toBe("Derriere");
        });
    });

    // ─── beat_driver ─────────────────────────────────────────────────

    describe("beat_driver", () => {
        it("is met when best team driver finishes ahead of target driver", () => {
            const obj = makeObjective({
                objective_type: "beat_driver",
                target_entity_id: "d_rival",
            });
            const ctx = makeContext({
                driverStandings: [
                    makeDriverStanding({ driver_id: "d1", position: 3 }),
                    makeDriverStanding({ driver_id: "d2", position: 6 }),
                    makeDriverStanding({ driver_id: "d_rival", position: 5 }),
                ],
                driverTeamMap: new Map([["d1", "t1"], ["d2", "t1"], ["d_rival", "t2"]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
        });

        it("is not met when all team drivers finish behind target", () => {
            const obj = makeObjective({
                objective_type: "beat_driver",
                target_entity_id: "d_rival",
            });
            const ctx = makeContext({
                driverStandings: [
                    makeDriverStanding({ driver_id: "d1", position: 7 }),
                    makeDriverStanding({ driver_id: "d_rival", position: 4 }),
                ],
                driverTeamMap: new Map([["d1", "t1"], ["d_rival", "t2"]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
        });
    });

    // ─── race_win_at_circuit ─────────────────────────────────────────

    describe("race_win_at_circuit", () => {
        it("is met when team has won at the target circuit", () => {
            const obj = makeObjective({
                objective_type: "race_win_at_circuit",
                target_entity_id: "circuit_monaco",
            });
            const ctx = makeContext({
                teamWinCircuits: new Map([["t1", new Set(["circuit_monaco", "circuit_spa"])]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(true);
            expect(result.evaluated_value).toBe(1);
        });

        it("is not met when team has not won at the target circuit", () => {
            const obj = makeObjective({
                objective_type: "race_win_at_circuit",
                target_entity_id: "circuit_monaco",
            });
            const ctx = makeContext({
                teamWinCircuits: new Map([["t1", new Set(["circuit_spa"])]]),
            });
            const result = evaluateObjective(obj, ctx);
            expect(result.is_met).toBe(false);
            expect(result.evaluated_value).toBe(0);
        });

        it("returns not met when no entity_id provided", () => {
            const obj = makeObjective({
                objective_type: "race_win_at_circuit",
                target_entity_id: null,
            });
            const result = evaluateObjective(obj, makeContext());
            expect(result.is_met).toBe(false);
        });
    });

    // ─── custom ──────────────────────────────────────────────────────

    describe("custom", () => {
        it("uses is_met from the record", () => {
            const obj = makeObjective({ objective_type: "custom", is_met: true });
            const result = evaluateObjective(obj, makeContext());
            expect(result.is_met).toBe(true);
            expect(result.label).toBe("Manuel");
        });

        it("defaults to false when is_met is null", () => {
            const obj = makeObjective({ objective_type: "custom", is_met: null });
            const result = evaluateObjective(obj, makeContext());
            expect(result.is_met).toBe(false);
        });
    });
});

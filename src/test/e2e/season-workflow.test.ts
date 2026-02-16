import { describe, it, expect, vi } from "vitest";
import { computeDriverPredictions, computeConstructorPredictions } from "@/lib/calculations/predictions";
import { calculateDerivedStats } from "@/lib/calculations/car-stats";
import { buildPointsMap, calculateDriverPoints } from "@/lib/calculations/points";
import {
    calculateAllDriverSurperformances,
    calculateAllTeamSurperformances,
} from "@/lib/calculations/surperformance";
import { calculateRainProbability } from "@/lib/calculations/rain-probability";

// ─── Workflow saison complete ────────────────────────────────────────────────
// Ce test verifie le cycle complet d'une saison sans Supabase, en testant
// toute la logique metier de bout en bout.

describe("Workflow saison complete", () => {
    // ─── Donnees de reference ────────────────────────────────────────

    const pointsSystemRows = [
        { position: 1, points: 25 },
        { position: 2, points: 18 },
        { position: 3, points: 15 },
        { position: 4, points: 12 },
        { position: 5, points: 10 },
        { position: 6, points: 8 },
        { position: 7, points: 6 },
        { position: 8, points: 4 },
        { position: 9, points: 2 },
        { position: 10, points: 1 },
    ];

    // ─── 1. Configuration des equipes et pilotes ─────────────────────

    const teams = [
        { id: "t-ferrari", name: "Ferrari", season_id: "s1" },
        { id: "t-mercedes", name: "Mercedes", season_id: "s1" },
    ];

    const drivers = [
        { id: "d-leclerc", team_id: "t-ferrari", full_name: "Charles Leclerc", effective_note: 9, age: 27 },
        { id: "d-sainz", team_id: "t-ferrari", full_name: "Carlos Sainz", effective_note: 8, age: 30 },
        { id: "d-hamilton", team_id: "t-mercedes", full_name: "Lewis Hamilton", effective_note: 9, age: 40 },
        { id: "d-russell", team_id: "t-mercedes", full_name: "George Russell", effective_note: 8, age: 26 },
    ];

    const carsRaw = [
        { team_id: "t-ferrari", motor: 8, aero: 9, chassis: 8, engine_change_penalty: false },
        { team_id: "t-mercedes", motor: 9, aero: 8, chassis: 7, engine_change_penalty: false },
    ];

    // ─── 2. Calcul des stats voitures ────────────────────────────────

    it("calcule les stats derivees de chaque voiture", () => {
        const ferrari = calculateDerivedStats(8, 9, 8, false);
        expect(ferrari.total).toBe(25); // 8 + 9 + 8
        expect(ferrari.speed).toBe(9); // round((9+8)/2)
        expect(ferrari.grip).toBe(9); // round((9+8)/2)
        expect(ferrari.acceleration).toBe(8); // motor

        const mercedes = calculateDerivedStats(9, 8, 7, false);
        expect(mercedes.total).toBe(24); // 9 + 8 + 7
        expect(mercedes.speed).toBe(9); // round((8+9)/2)
        expect(mercedes.acceleration).toBe(9); // motor
    });

    // ─── 3. Generation des predictions ───────────────────────────────

    it("genere les predictions pilotes et constructeurs", () => {
        const cars = carsRaw.map((c) => {
            const stats = calculateDerivedStats(c.motor, c.aero, c.chassis, c.engine_change_penalty);
            return { team_id: c.team_id, total: stats.total };
        });

        const driverPredictions = computeDriverPredictions(drivers, cars);
        const constructorPredictions = computeConstructorPredictions(drivers, cars);

        // 4 pilotes
        expect(driverPredictions).toHaveLength(4);

        // Leclerc: 9 + 25 = 34, Hamilton: 9 + 24 = 33, Sainz: 8 + 25 = 33, Russell: 8 + 24 = 32
        expect(driverPredictions[0].driver_id).toBe("d-leclerc");
        expect(driverPredictions[0].score).toBe(34);
        expect(driverPredictions[0].predicted_position).toBe(1);

        // Hamilton and Sainz tied at 33 - order depends on sort stability
        expect(driverPredictions[1].score).toBe(33);
        expect(driverPredictions[1].predicted_position).toBe(2);

        expect(driverPredictions[3].driver_id).toBe("d-russell");
        expect(driverPredictions[3].predicted_position).toBe(4);

        // 2 equipes
        expect(constructorPredictions).toHaveLength(2);
        // Ferrari: total=25, avg_driver=(9+8)/2=8.5, score=33.5
        // Mercedes: total=24, avg_driver=(9+8)/2=8.5, score=32.5
        expect(constructorPredictions[0].team_id).toBe("t-ferrari");
        expect(constructorPredictions[1].team_id).toBe("t-mercedes");
    });

    // ─── 4. Calcul de pluie ──────────────────────────────────────────

    it("genere une probabilite de pluie dans les bornes", () => {
        // Pas de mock → variation aleatoire
        const prob = calculateRainProbability(50);
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(100);
    });

    it("gere une base nulle", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);
        expect(calculateRainProbability(null)).toBe(0);
        vi.restoreAllMocks();
    });

    // ─── 5. Saisie des resultats de course ───────────────────────────

    it("calcule les points de course correctement", () => {
        const pointsMap = buildPointsMap(pointsSystemRows);

        // P1 avec meilleur tour
        expect(
            calculateDriverPoints({
                finishPosition: 1,
                isFastestLap: true,
                pointsMap,
            }),
        ).toBe(26); // 25 + 1

        // P2 sans meilleur tour
        expect(
            calculateDriverPoints({
                finishPosition: 2,
                isFastestLap: false,
                pointsMap,
            }),
        ).toBe(18);

        // DNF
        expect(
            calculateDriverPoints({
                finishPosition: null,
                isFastestLap: false,
                pointsMap,
            }),
        ).toBe(0);
    });

    // ─── 6. Classements apres course ─────────────────────────────────

    it("execute le cycle complet sans erreur", () => {
        const pointsMap = buildPointsMap(pointsSystemRows);

        // Simuler les resultats: Leclerc P1 (FL), Hamilton P2, Sainz P3, Russell P4
        const raceResults = [
            { driver_id: "d-leclerc", team_id: "t-ferrari", finish_position: 1, fastest_lap: true },
            { driver_id: "d-hamilton", team_id: "t-mercedes", finish_position: 2, fastest_lap: false },
            { driver_id: "d-sainz", team_id: "t-ferrari", finish_position: 3, fastest_lap: false },
            { driver_id: "d-russell", team_id: "t-mercedes", finish_position: 4, fastest_lap: false },
        ];

        // Calculer les points
        const resultsWithPoints = raceResults.map((r) => ({
            ...r,
            points: calculateDriverPoints({
                finishPosition: r.finish_position,
                isFastestLap: r.fastest_lap,
                pointsMap,
            }),
        }));

        expect(resultsWithPoints[0].points).toBe(26); // P1 + FL
        expect(resultsWithPoints[1].points).toBe(18); // P2
        expect(resultsWithPoints[2].points).toBe(15); // P3
        expect(resultsWithPoints[3].points).toBe(12); // P4

        // Classement pilotes
        const driverStandings = [...resultsWithPoints]
            .sort((a, b) => b.points - a.points)
            .map((r, i) => ({
                ...r,
                position: i + 1,
            }));

        expect(driverStandings[0].driver_id).toBe("d-leclerc");
        expect(driverStandings[0].points).toBe(26);
        expect(driverStandings[0].position).toBe(1);

        // Classement constructeurs
        const teamPoints = new Map<string, { points: number; wins: number }>();
        for (const r of resultsWithPoints) {
            const stats = teamPoints.get(r.team_id) ?? { points: 0, wins: 0 };
            stats.points += r.points;
            if (r.finish_position === 1) stats.wins += 1;
            teamPoints.set(r.team_id, stats);
        }

        const constructorStandings = [...teamPoints.entries()]
            .sort((a, b) => b[1].points - a[1].points)
            .map(([teamId, stats], i) => ({
                team_id: teamId,
                points: stats.points,
                wins: stats.wins,
                position: i + 1,
            }));

        // Ferrari: 26 + 15 = 41, Mercedes: 18 + 12 = 30
        expect(constructorStandings[0].team_id).toBe("t-ferrari");
        expect(constructorStandings[0].points).toBe(41);
        expect(constructorStandings[1].team_id).toBe("t-mercedes");
        expect(constructorStandings[1].points).toBe(30);
    });

    // ─── 7. Surperformances ──────────────────────────────────────────

    it("calcule les surperformances pilotes et constructeurs", () => {
        // Setup: predictions vs real results
        const driverInputs = [
            { driver_id: "d-leclerc", name: "Leclerc", team: "Ferrari", age: 27, predicted_position: 1, final_position: 1 },
            { driver_id: "d-hamilton", name: "Hamilton", team: "Mercedes", age: 40, predicted_position: 3, final_position: 2 },
            { driver_id: "d-sainz", name: "Sainz", team: "Ferrari", age: 30, predicted_position: 2, final_position: 3 },
            { driver_id: "d-russell", name: "Russell", team: "Mercedes", age: 26, predicted_position: 4, final_position: 4 },
        ];

        const driverSurperfs = calculateAllDriverSurperformances(driverInputs);

        // Tries par |delta| decroissant
        // Hamilton: predit P3, fini P2 → delta +1 → neutral
        // Sainz: predit P2, fini P3 → delta -1 → neutral
        // Leclerc: predit P1, fini P1 → delta 0 → neutral
        // Russell: predit P4, fini P4 → delta 0 → neutral
        expect(driverSurperfs).toHaveLength(4);
        // Hamilton et Sainz ont |delta| = 1, les autres 0
        expect(Math.abs(driverSurperfs[0].delta)).toBeGreaterThanOrEqual(
            Math.abs(driverSurperfs[1].delta),
        );

        // Tous neutres (delta ± 1 seulement)
        for (const s of driverSurperfs) {
            expect(s.effect).toBe("neutral");
            expect(s.potential_change).toBe(0);
        }

        // Constructeurs
        const teamInputs = [
            { team_id: "t-ferrari", name: "Ferrari", predicted_position: 1, final_position: 1 },
            { team_id: "t-mercedes", name: "Mercedes", predicted_position: 2, final_position: 2 },
        ];

        const teamSurperfs = calculateAllTeamSurperformances(teamInputs);
        expect(teamSurperfs).toHaveLength(2);

        // Tous conforme
        for (const t of teamSurperfs) {
            expect(t.delta).toBe(0);
            expect(t.budget_change).toBe(0);
        }
    });

    it("detecte une surperformance significative (+2)", () => {
        const driverInputs = [
            { driver_id: "d-russell", name: "Russell", team: "Mercedes", age: 26, predicted_position: 4, final_position: 1 },
        ];

        const surperfs = calculateAllDriverSurperformances(driverInputs);

        expect(surperfs[0].delta).toBe(3); // predit P4, fini P1
        expect(surperfs[0].effect).toBe("positive");
        // Russell 26 ans → potential_change +1
        expect(surperfs[0].potential_change).toBe(1);
    });

    it("detecte une sous-performance significative (-2)", () => {
        const teamInputs = [
            { team_id: "t-ferrari", name: "Ferrari", predicted_position: 1, final_position: 5 },
        ];

        const surperfs = calculateAllTeamSurperformances(teamInputs);

        expect(surperfs[0].delta).toBe(-4);
        expect(surperfs[0].effect).toBe("negative");
        expect(surperfs[0].budget_change).toBe(-1);
    });

    // ─── 8. Cycle multi-courses ──────────────────────────────────────

    it("accumule les points sur plusieurs courses", () => {
        const pointsMap = buildPointsMap(pointsSystemRows);

        // Course 1: Leclerc P1, Hamilton P2
        // Course 2: Hamilton P1 (FL), Leclerc P3
        const races = [
            [
                { driver_id: "d-leclerc", finish_position: 1, fastest_lap: false },
                { driver_id: "d-hamilton", finish_position: 2, fastest_lap: false },
            ],
            [
                { driver_id: "d-hamilton", finish_position: 1, fastest_lap: true },
                { driver_id: "d-leclerc", finish_position: 3, fastest_lap: false },
            ],
        ];

        const cumulativePoints = new Map<string, number>();

        for (const race of races) {
            for (const result of race) {
                const pts = calculateDriverPoints({
                    finishPosition: result.finish_position,
                    isFastestLap: result.fastest_lap,
                    pointsMap,
                });
                const current = cumulativePoints.get(result.driver_id) ?? 0;
                cumulativePoints.set(result.driver_id, current + pts);
            }
        }

        // Leclerc: 25 (P1) + 15 (P3) = 40
        expect(cumulativePoints.get("d-leclerc")).toBe(40);
        // Hamilton: 18 (P2) + 26 (P1+FL) = 44
        expect(cumulativePoints.get("d-hamilton")).toBe(44);
    });

    // ─── 9. Scenario avec DNF ────────────────────────────────────────

    it("gere les DNF dans le classement", () => {
        const pointsMap = buildPointsMap(pointsSystemRows);

        const results = [
            { driver_id: "d-leclerc", finish_position: 1 as number | null, fastest_lap: true },
            { driver_id: "d-hamilton", finish_position: null as number | null, fastest_lap: false }, // DNF
            { driver_id: "d-sainz", finish_position: 2 as number | null, fastest_lap: false },
        ];

        const withPoints = results.map((r) => ({
            ...r,
            points: calculateDriverPoints({
                finishPosition: r.finish_position,
                isFastestLap: r.fastest_lap,
                pointsMap,
            }),
        }));

        expect(withPoints[0].points).toBe(26); // P1 + FL
        expect(withPoints[1].points).toBe(0); // DNF
        expect(withPoints[2].points).toBe(18); // P2

        // Hamilton DNF ne marque aucun point
        const standings = [...withPoints]
            .sort((a, b) => b.points - a.points);
        expect(standings[0].driver_id).toBe("d-leclerc");
        expect(standings[2].driver_id).toBe("d-hamilton");
        expect(standings[2].points).toBe(0);
    });

    // ─── 10. Chaine complete predictions → course → surperf ─────────

    it("chaine predictions → resultats → surperformances de bout en bout", () => {
        const pointsMap = buildPointsMap(pointsSystemRows);

        // Etape 1: Predictions
        const cars = [
            { team_id: "t-ferrari", total: 25 },
            { team_id: "t-mercedes", total: 24 },
        ];

        const predictions = computeDriverPredictions(drivers, cars);
        expect(predictions).toHaveLength(4);

        // Predictions: Leclerc P1, Hamilton/Sainz P2/P3, Russell P4
        const predictionMap = new Map(
            predictions.map((p) => [p.driver_id, p.predicted_position]),
        );

        // Etape 2: Course (bouleversement: Russell P1, Leclerc P4)
        const raceResults = [
            { driver_id: "d-russell", finish_position: 1, fastest_lap: true },
            { driver_id: "d-hamilton", finish_position: 2, fastest_lap: false },
            { driver_id: "d-sainz", finish_position: 3, fastest_lap: false },
            { driver_id: "d-leclerc", finish_position: 4, fastest_lap: false },
        ];

        const resultsWithPoints = raceResults.map((r) => ({
            ...r,
            points: calculateDriverPoints({
                finishPosition: r.finish_position,
                isFastestLap: r.fastest_lap,
                pointsMap,
            }),
        }));

        expect(resultsWithPoints[0].points).toBe(26); // Russell P1 + FL

        // Etape 3: Surperformances basees sur predictions vs resultats
        const surperfInputs = raceResults.map((r) => {
            const driver = drivers.find((d) => d.id === r.driver_id)!;
            return {
                driver_id: r.driver_id,
                name: driver.full_name,
                team: teams.find((t) => t.id === driver.team_id)!.name,
                age: driver.age,
                predicted_position: predictionMap.get(r.driver_id) ?? 0,
                final_position: r.finish_position,
            };
        });

        const surperfs = calculateAllDriverSurperformances(surperfInputs);

        // Russell: predit P4, fini P1 → delta +3 → positive
        const russellSurperf = surperfs.find((s) => s.driver_id === "d-russell");
        expect(russellSurperf).toBeDefined();
        expect(russellSurperf!.delta).toBe(3);
        expect(russellSurperf!.effect).toBe("positive");
        // Russell 26 ans → potential_change +1
        expect(russellSurperf!.potential_change).toBe(1);

        // Leclerc: predit P1, fini P4 → delta -3 → negative
        const leclercSurperf = surperfs.find((s) => s.driver_id === "d-leclerc");
        expect(leclercSurperf).toBeDefined();
        expect(leclercSurperf!.delta).toBe(-3);
        expect(leclercSurperf!.effect).toBe("negative");
        // Leclerc 27 ans (>26) → potential_change 0
        expect(leclercSurperf!.potential_change).toBe(0);
    });
});

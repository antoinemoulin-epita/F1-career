import { describe, it, expect } from "vitest";
import { calculateDerivedStats } from "./car-stats";

describe("calculateDerivedStats", () => {
    describe("formules de base", () => {
        it("calcule total = motor + aero + chassis (sans penalite)", () => {
            expect(calculateDerivedStats(8, 7, 6, false).total).toBe(21);
        });

        it("calcule vitesse = ROUND((aero + motor) / 2)", () => {
            expect(calculateDerivedStats(8, 6, 5, false).speed).toBe(7);
            expect(calculateDerivedStats(7, 6, 5, false).speed).toBe(7); // 6.5 → 7
            expect(calculateDerivedStats(10, 10, 5, false).speed).toBe(10);
        });

        it("calcule grip = ROUND((aero + effectiveChassis) / 2)", () => {
            expect(calculateDerivedStats(5, 8, 6, false).grip).toBe(7);
            expect(calculateDerivedStats(5, 7, 6, false).grip).toBe(7); // 6.5 → 7
        });

        it("calcule acceleration = motor", () => {
            expect(calculateDerivedStats(9, 5, 5, false).acceleration).toBe(9);
        });
    });

    describe("penalite changement moteur", () => {
        it("reduit le chassis effectif de 1", () => {
            const result = calculateDerivedStats(8, 7, 6, true);
            expect(result.effectiveChassis).toBe(5);
        });

        it("affecte le grip mais pas le total", () => {
            const withPenalty = calculateDerivedStats(8, 7, 6, true);
            const withoutPenalty = calculateDerivedStats(8, 7, 6, false);

            // Total utilise chassis brut, pas effectif
            expect(withPenalty.total).toBe(withoutPenalty.total);

            // Grip utilise effectiveChassis
            expect(withPenalty.grip).toBeLessThan(withoutPenalty.grip);
        });

        it("n'affecte pas la vitesse ni l'acceleration", () => {
            const withPenalty = calculateDerivedStats(8, 7, 6, true);
            const withoutPenalty = calculateDerivedStats(8, 7, 6, false);

            expect(withPenalty.speed).toBe(withoutPenalty.speed);
            expect(withPenalty.acceleration).toBe(withoutPenalty.acceleration);
        });
    });

    describe("cas limites", () => {
        it("gere les valeurs minimales (0)", () => {
            const result = calculateDerivedStats(0, 0, 0, false);
            expect(result.speed).toBe(0);
            expect(result.grip).toBe(0);
            expect(result.acceleration).toBe(0);
            expect(result.total).toBe(0);
        });

        it("gere les valeurs maximales (10)", () => {
            const result = calculateDerivedStats(10, 10, 10, false);
            expect(result.speed).toBe(10);
            expect(result.grip).toBe(10);
            expect(result.acceleration).toBe(10);
            expect(result.total).toBe(30);
        });

        it("penalite moteur avec chassis a 0 donne effectiveChassis -1", () => {
            const result = calculateDerivedStats(5, 5, 0, true);
            expect(result.effectiveChassis).toBe(-1);
        });
    });
});

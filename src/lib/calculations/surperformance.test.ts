import { describe, it, expect } from "vitest";
import {
    calculateDelta,
    getSurperformanceEffect,
    getDriverPotentialChange,
    getTeamBudgetChange,
    calculateAllDriverSurperformances,
    calculateAllTeamSurperformances,
} from "./surperformance";

describe("calculateDelta", () => {
    it("positif quand meilleur que prevu (predit P5, fini P2 = +3)", () => {
        expect(calculateDelta(5, 2)).toBe(3);
    });

    it("negatif quand pire que prevu (predit P2, fini P5 = -3)", () => {
        expect(calculateDelta(2, 5)).toBe(-3);
    });

    it("zero quand conforme (predit P3, fini P3 = 0)", () => {
        expect(calculateDelta(3, 3)).toBe(0);
    });
});

describe("getSurperformanceEffect", () => {
    it("positive si delta >= +2", () => {
        expect(getSurperformanceEffect(2)).toBe("positive");
        expect(getSurperformanceEffect(5)).toBe("positive");
    });

    it("negative si delta <= -2", () => {
        expect(getSurperformanceEffect(-2)).toBe("negative");
        expect(getSurperformanceEffect(-5)).toBe("negative");
    });

    it("neutre si delta entre -1 et +1", () => {
        expect(getSurperformanceEffect(0)).toBe("neutral");
        expect(getSurperformanceEffect(1)).toBe("neutral");
        expect(getSurperformanceEffect(-1)).toBe("neutral");
    });
});

describe("getDriverPotentialChange", () => {
    describe("pilote jeune (<=26 ans)", () => {
        it("+1 potentiel si delta >= +2", () => {
            expect(getDriverPotentialChange(3, 24)).toBe(1);
            expect(getDriverPotentialChange(2, 20)).toBe(1);
        });

        it("-1 potentiel si delta <= -2", () => {
            expect(getDriverPotentialChange(-3, 24)).toBe(-1);
            expect(getDriverPotentialChange(-2, 20)).toBe(-1);
        });

        it("0 si delta entre -1 et +1", () => {
            expect(getDriverPotentialChange(0, 24)).toBe(0);
            expect(getDriverPotentialChange(1, 24)).toBe(0);
            expect(getDriverPotentialChange(-1, 24)).toBe(0);
        });
    });

    describe("pilote age (>26 ans)", () => {
        it("toujours 0 quel que soit le delta", () => {
            expect(getDriverPotentialChange(5, 27)).toBe(0);
            expect(getDriverPotentialChange(-5, 30)).toBe(0);
            expect(getDriverPotentialChange(3, 35)).toBe(0);
        });
    });

    describe("pilote exactement 26 ans", () => {
        it("affecte par la surperformance (<=26)", () => {
            expect(getDriverPotentialChange(3, 26)).toBe(1);
            expect(getDriverPotentialChange(-3, 26)).toBe(-1);
        });
    });

    describe("age null", () => {
        it("retourne 0", () => {
            expect(getDriverPotentialChange(5, null)).toBe(0);
        });
    });
});

describe("getTeamBudgetChange", () => {
    it("+1 si delta >= +2", () => {
        expect(getTeamBudgetChange(2)).toBe(1);
        expect(getTeamBudgetChange(5)).toBe(1);
    });

    it("-1 si delta <= -2", () => {
        expect(getTeamBudgetChange(-2)).toBe(-1);
        expect(getTeamBudgetChange(-5)).toBe(-1);
    });

    it("0 si delta entre -1 et +1", () => {
        expect(getTeamBudgetChange(0)).toBe(0);
        expect(getTeamBudgetChange(1)).toBe(0);
        expect(getTeamBudgetChange(-1)).toBe(0);
    });
});

describe("calculateAllDriverSurperformances", () => {
    it("calcule et trie par delta absolu decroissant", () => {
        const inputs = [
            { driver_id: "d1", name: "A", team: "T1", age: 24, predicted_position: 5, final_position: 2 },
            { driver_id: "d2", name: "B", team: "T2", age: 30, predicted_position: 3, final_position: 3 },
            { driver_id: "d3", name: "C", team: "T3", age: 22, predicted_position: 1, final_position: 5 },
        ];

        const result = calculateAllDriverSurperformances(inputs);

        // d3 has |delta| = 4, d1 has |delta| = 3, d2 has |delta| = 0
        expect(result[0].driver_id).toBe("d3");
        expect(result[0].delta).toBe(-4);
        expect(result[0].effect).toBe("negative");
        expect(result[0].potential_change).toBe(-1); // age 22, delta -4

        expect(result[1].driver_id).toBe("d1");
        expect(result[1].delta).toBe(3);
        expect(result[1].effect).toBe("positive");
        expect(result[1].potential_change).toBe(1); // age 24, delta +3

        expect(result[2].driver_id).toBe("d2");
        expect(result[2].delta).toBe(0);
        expect(result[2].effect).toBe("neutral");
        expect(result[2].potential_change).toBe(0); // age 30
    });
});

describe("calculateAllTeamSurperformances", () => {
    it("calcule et trie par delta absolu decroissant", () => {
        const inputs = [
            { team_id: "t1", name: "Team A", predicted_position: 1, final_position: 4 },
            { team_id: "t2", name: "Team B", predicted_position: 5, final_position: 1 },
        ];

        const result = calculateAllTeamSurperformances(inputs);

        // t2 has |delta| = 4, t1 has |delta| = 3
        expect(result[0].team_id).toBe("t2");
        expect(result[0].delta).toBe(4);
        expect(result[0].budget_change).toBe(1);

        expect(result[1].team_id).toBe("t1");
        expect(result[1].delta).toBe(-3);
        expect(result[1].budget_change).toBe(-1);
    });

    it("delta exactement +2 → effect positive, budget +1", () => {
        const inputs = [
            { team_id: "t1", name: "Team A", predicted_position: 5, final_position: 3 },
        ];
        const result = calculateAllTeamSurperformances(inputs);
        expect(result[0].delta).toBe(2);
        expect(result[0].effect).toBe("positive");
        expect(result[0].budget_change).toBe(1);
    });

    it("delta exactement -2 → effect negative, budget -1", () => {
        const inputs = [
            { team_id: "t1", name: "Team A", predicted_position: 3, final_position: 5 },
        ];
        const result = calculateAllTeamSurperformances(inputs);
        expect(result[0].delta).toBe(-2);
        expect(result[0].effect).toBe("negative");
        expect(result[0].budget_change).toBe(-1);
    });
});

describe("calculateAllDriverSurperformances — edge cases", () => {
    it("delta exactement +2 pour jeune → potential_change +1", () => {
        const inputs = [
            { driver_id: "d1", name: "A", team: "T1", age: 22, predicted_position: 5, final_position: 3 },
        ];
        const result = calculateAllDriverSurperformances(inputs);
        expect(result[0].delta).toBe(2);
        expect(result[0].effect).toBe("positive");
        expect(result[0].potential_change).toBe(1);
    });

    it("delta exactement -2 pour jeune → potential_change -1", () => {
        const inputs = [
            { driver_id: "d1", name: "A", team: "T1", age: 22, predicted_position: 3, final_position: 5 },
        ];
        const result = calculateAllDriverSurperformances(inputs);
        expect(result[0].delta).toBe(-2);
        expect(result[0].effect).toBe("negative");
        expect(result[0].potential_change).toBe(-1);
    });

    it("tableau vide → resultat vide", () => {
        expect(calculateAllDriverSurperformances([]).length).toBe(0);
    });
});

// ─── Non-regression: 4 young drivers with surperformance (Senna/Brundle bug) ─

describe("calculateAllDriverSurperformances — non-regression age 25", () => {
    it("4 pilotes de 25 ans avec delta >= 2 obtiennent TOUS +1 potentiel", () => {
        const inputs = [
            { driver_id: "senna", name: "Ayrton Senna", team: "Lotus", age: 25, predicted_position: 6, final_position: 3 },
            { driver_id: "brundle", name: "Martin Brundle", team: "Tyrrell", age: 25, predicted_position: 12, final_position: 8 },
            { driver_id: "de_angelis", name: "Elio de Angelis", team: "Lotus", age: 25, predicted_position: 5, final_position: 2 },
            { driver_id: "cheever", name: "Eddie Cheever", team: "Alfa Romeo", age: 25, predicted_position: 14, final_position: 10 },
        ];

        const result = calculateAllDriverSurperformances(inputs);

        // All 4 drivers have delta >= 2 and age = 25 (≤ 26)
        // Every single one must get potential_change = +1
        expect(result).toHaveLength(4);
        for (const driver of result) {
            expect(driver.delta).toBeGreaterThanOrEqual(2);
            expect(driver.effect).toBe("positive");
            expect(driver.potential_change).toBe(1);
        }

        // Verify each driver individually
        const sennaResult = result.find((d) => d.driver_id === "senna")!;
        expect(sennaResult.potential_change).toBe(1);
        expect(sennaResult.delta).toBe(3);

        const brundleResult = result.find((d) => d.driver_id === "brundle")!;
        expect(brundleResult.potential_change).toBe(1);
        expect(brundleResult.delta).toBe(4);

        const deAngelisResult = result.find((d) => d.driver_id === "de_angelis")!;
        expect(deAngelisResult.potential_change).toBe(1);
        expect(deAngelisResult.delta).toBe(3);

        const cheeverResult = result.find((d) => d.driver_id === "cheever")!;
        expect(cheeverResult.potential_change).toBe(1);
        expect(cheeverResult.delta).toBe(4);
    });

    it("meme scenario mais age = null → aucun ne recoit +1 potentiel (garde age)", () => {
        const inputs = [
            { driver_id: "senna", name: "Ayrton Senna", team: "Lotus", age: null as number | null, predicted_position: 6, final_position: 3 },
            { driver_id: "brundle", name: "Martin Brundle", team: "Tyrrell", age: null as number | null, predicted_position: 12, final_position: 8 },
            { driver_id: "de_angelis", name: "Elio de Angelis", team: "Lotus", age: null as number | null, predicted_position: 5, final_position: 2 },
            { driver_id: "cheever", name: "Eddie Cheever", team: "Alfa Romeo", age: null as number | null, predicted_position: 14, final_position: 10 },
        ];

        const result = calculateAllDriverSurperformances(inputs);

        // With null age, potential_change must be 0 for all
        for (const driver of result) {
            expect(driver.potential_change).toBe(0);
        }
    });
});

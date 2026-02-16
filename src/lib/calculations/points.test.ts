import { describe, it, expect } from "vitest";
import { buildPointsMap, calculateDriverPoints } from "./points";

describe("buildPointsMap", () => {
    it("convertit un tableau en Map<position, points>", () => {
        const rows = [
            { position: 1, points: 25 },
            { position: 2, points: 18 },
            { position: 3, points: 15 },
        ];
        const map = buildPointsMap(rows);
        expect(map.get(1)).toBe(25);
        expect(map.get(2)).toBe(18);
        expect(map.get(3)).toBe(15);
        expect(map.size).toBe(3);
    });

    it("gere un tableau vide", () => {
        const map = buildPointsMap([]);
        expect(map.size).toBe(0);
    });
});

describe("calculateDriverPoints", () => {
    const defaultRows = [
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
    const pointsMap = buildPointsMap(defaultRows);

    describe("points de base", () => {
        it("attribue les points corrects pour P1", () => {
            expect(
                calculateDriverPoints({ finishPosition: 1, isFastestLap: false, pointsMap }),
            ).toBe(25);
        });

        it("attribue les points corrects pour P10", () => {
            expect(
                calculateDriverPoints({ finishPosition: 10, isFastestLap: false, pointsMap }),
            ).toBe(1);
        });

        it("retourne 0 pour position hors bareme", () => {
            expect(
                calculateDriverPoints({ finishPosition: 11, isFastestLap: false, pointsMap }),
            ).toBe(0);
        });
    });

    describe("DNF (abandon)", () => {
        it("retourne 0 pour position null (DNF)", () => {
            expect(
                calculateDriverPoints({ finishPosition: null, isFastestLap: false, pointsMap }),
            ).toBe(0);
        });

        it("retourne 0 pour DNF meme avec meilleur tour", () => {
            expect(
                calculateDriverPoints({ finishPosition: null, isFastestLap: true, pointsMap }),
            ).toBe(0);
        });
    });

    describe("meilleur tour", () => {
        it("+1 point pour meilleur tour si top 10", () => {
            expect(
                calculateDriverPoints({ finishPosition: 1, isFastestLap: true, pointsMap }),
            ).toBe(26); // 25 + 1
        });

        it("+1 point pour meilleur tour en P10", () => {
            expect(
                calculateDriverPoints({ finishPosition: 10, isFastestLap: true, pointsMap }),
            ).toBe(2); // 1 + 1
        });

        it("pas de bonus meilleur tour si hors top 10", () => {
            expect(
                calculateDriverPoints({ finishPosition: 11, isFastestLap: true, pointsMap }),
            ).toBe(0); // 0 + 0
        });
    });
});

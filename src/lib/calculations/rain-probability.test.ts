import { describe, it, expect, vi, afterEach } from "vitest";
import { calculateRainProbability, snapToRainScale, rainLabel, RAIN_SCALE } from "./rain-probability";

describe("RAIN_SCALE", () => {
    it("contient les 4 paliers", () => {
        expect(RAIN_SCALE).toEqual([0, 10, 25, 50]);
    });
});

describe("snapToRainScale", () => {
    it.each([
        [0, 0], [3, 0], [5, 0],
        [6, 10], [10, 10], [15, 10],
        [18, 25], [25, 25], [30, 25], [37, 25],
        [38, 50], [45, 50], [50, 50], [80, 50],
    ])("snap %i → %i", (input, expected) => {
        expect(snapToRainScale(input)).toBe(expected);
    });
});

describe("rainLabel", () => {
    it("affiche Sec pour 0", () => {
        expect(rainLabel(0)).toBe("Sec");
    });

    it("affiche Sec pour null", () => {
        expect(rainLabel(null)).toBe("Sec");
    });

    it("affiche le pourcentage sinon", () => {
        expect(rainLabel(10)).toBe("10%");
        expect(rainLabel(25)).toBe("25%");
        expect(rainLabel(50)).toBe("50%");
    });
});

describe("calculateRainProbability", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("retourne la meme valeur a 70% (roll < 0.7)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);
        expect(calculateRainProbability(25)).toBe(25);
    });

    it("retourne un palier au-dessus a 15% (0.7 <= roll < 0.85)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.75);
        expect(calculateRainProbability(25)).toBe(50);
    });

    it("retourne un palier en-dessous a 15% (roll >= 0.85)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.9);
        expect(calculateRainProbability(25)).toBe(10);
    });

    it("clamp en haut (50 ne depasse pas)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.75);
        expect(calculateRainProbability(50)).toBe(50);
    });

    it("clamp en bas (0 ne descend pas)", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.9);
        expect(calculateRainProbability(0)).toBe(0);
    });

    it("gere null comme base 0", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);
        expect(calculateRainProbability(null)).toBe(0);
    });

    it("snap une valeur hors-echelle", () => {
        expect(calculateRainProbability(33)).toBe(25);
    });
});

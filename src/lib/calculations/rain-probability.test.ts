import { describe, it, expect, vi, afterEach } from "vitest";
import { calculateRainProbability } from "./rain-probability";

describe("calculateRainProbability", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("utilise la base et ajoute une variation aleatoire", () => {
        // Mock Math.random to return 0.5 → variation = Math.floor(0.5 * 21) - 10 = 10 - 10 = 0
        vi.spyOn(Math, "random").mockReturnValue(0.5);
        expect(calculateRainProbability(30)).toBe(30);
    });

    it("applique variation maximale (+10)", () => {
        // Math.random() ≈ 1 → Math.floor(0.999 * 21) - 10 = 20 - 10 = +10
        vi.spyOn(Math, "random").mockReturnValue(0.999);
        expect(calculateRainProbability(50)).toBe(60);
    });

    it("applique variation minimale (-10)", () => {
        // Math.random() = 0 → Math.floor(0 * 21) - 10 = 0 - 10 = -10
        vi.spyOn(Math, "random").mockReturnValue(0);
        expect(calculateRainProbability(50)).toBe(40);
    });

    it("clamp a 0 minimum", () => {
        vi.spyOn(Math, "random").mockReturnValue(0); // variation = -10
        expect(calculateRainProbability(5)).toBe(0); // 5 - 10 → clamped to 0
    });

    it("clamp a 100 maximum", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.999); // variation = +10
        expect(calculateRainProbability(95)).toBe(100); // 95 + 10 → clamped to 100
    });

    it("gere null comme base 0", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5); // variation = 0
        expect(calculateRainProbability(null)).toBe(0);
    });
});

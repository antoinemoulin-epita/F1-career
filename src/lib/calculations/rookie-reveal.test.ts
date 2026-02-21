import { describe, it, expect } from "vitest";
import { calculateRookieReveal } from "./rookie-reveal";

describe("calculateRookieReveal", () => {
    const MIN = 3;
    const MAX = 8;

    // ─── High case ──────────────────────────────────────────────────────

    it("returns high case with autoValue = potential_max when delta >= 2", () => {
        const result = calculateRookieReveal(3, MIN, MAX);
        expect(result.case).toBe("high");
        expect(result.autoValue).toBe(MAX);
    });

    it("returns high case when delta is exactly 2", () => {
        const result = calculateRookieReveal(2, MIN, MAX);
        expect(result.case).toBe("high");
        expect(result.autoValue).toBe(MAX);
    });

    it("returns high case with large positive delta", () => {
        const result = calculateRookieReveal(10, MIN, MAX);
        expect(result.case).toBe("high");
        expect(result.autoValue).toBe(MAX);
    });

    // ─── Low case ───────────────────────────────────────────────────────

    it("returns low case with autoValue = potential_min when delta <= -2", () => {
        const result = calculateRookieReveal(-3, MIN, MAX);
        expect(result.case).toBe("low");
        expect(result.autoValue).toBe(MIN);
    });

    it("returns low case when delta is exactly -2", () => {
        const result = calculateRookieReveal(-2, MIN, MAX);
        expect(result.case).toBe("low");
        expect(result.autoValue).toBe(MIN);
    });

    it("returns low case with large negative delta", () => {
        const result = calculateRookieReveal(-8, MIN, MAX);
        expect(result.case).toBe("low");
        expect(result.autoValue).toBe(MIN);
    });

    // ─── Draw case ──────────────────────────────────────────────────────

    it("returns draw case with autoValue = null when delta is 0", () => {
        const result = calculateRookieReveal(0, MIN, MAX);
        expect(result.case).toBe("draw");
        expect(result.autoValue).toBeNull();
    });

    it("returns draw case when delta is 1", () => {
        const result = calculateRookieReveal(1, MIN, MAX);
        expect(result.case).toBe("draw");
        expect(result.autoValue).toBeNull();
    });

    it("returns draw case when delta is -1", () => {
        const result = calculateRookieReveal(-1, MIN, MAX);
        expect(result.case).toBe("draw");
        expect(result.autoValue).toBeNull();
    });

    // ─── Label and explanation ──────────────────────────────────────────

    it("includes descriptive label for each case", () => {
        expect(calculateRookieReveal(3, MIN, MAX).label).toBe("Haut potentiel");
        expect(calculateRookieReveal(-3, MIN, MAX).label).toBe("Bas potentiel");
        expect(calculateRookieReveal(0, MIN, MAX).label).toBe("Tirage au sort");
    });

    it("includes explanation with correct values", () => {
        const high = calculateRookieReveal(4, 2, 9);
        expect(high.explanation).toContain("9");
        expect(high.explanation).toContain("+4");

        const low = calculateRookieReveal(-5, 2, 9);
        expect(low.explanation).toContain("2");
        expect(low.explanation).toContain("-5");
    });

    // ─── Edge cases ─────────────────────────────────────────────────────

    it("works with min = max", () => {
        const result = calculateRookieReveal(5, 7, 7);
        expect(result.case).toBe("high");
        expect(result.autoValue).toBe(7);
    });

    it("works with min = 1, max = 10 (full range)", () => {
        const high = calculateRookieReveal(2, 1, 10);
        expect(high.autoValue).toBe(10);

        const low = calculateRookieReveal(-2, 1, 10);
        expect(low.autoValue).toBe(1);
    });
});

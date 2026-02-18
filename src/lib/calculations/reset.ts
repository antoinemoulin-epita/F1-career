export type ResetResult = {
    rangeMin: number;
    rangeMax: number;
    bonusApplied: boolean;
    label: string;
    color: "error" | "warning" | "brand";
};

/**
 * Calculate the reset result range based on reset type and progression.
 *
 * | reset_type | Base Range | Bonus if progression >= 2 |
 * |------------|-----------|---------------------------|
 * | critical   | 0–3       | +1 (→ 1–4)               |
 * | important  | 2–5       | +1 (→ 3–6)               |
 * | partial    | 4–7       | +1 (→ 5–8)               |
 */
export function calculateResetResult(
    resetType: "critical" | "important" | "partial",
    progression: number,
): ResetResult {
    const ranges: Record<string, { min: number; max: number; label: string; color: "error" | "warning" | "brand" }> = {
        critical: { min: 0, max: 3, label: "Critique", color: "error" },
        important: { min: 2, max: 5, label: "Important", color: "warning" },
        partial: { min: 4, max: 7, label: "Partiel", color: "brand" },
    };

    const base = ranges[resetType];
    const bonusApplied = progression >= 2;
    const bonus = bonusApplied ? 1 : 0;

    return {
        rangeMin: base.min + bonus,
        rangeMax: base.max + bonus,
        bonusApplied,
        label: base.label,
        color: base.color,
    };
}

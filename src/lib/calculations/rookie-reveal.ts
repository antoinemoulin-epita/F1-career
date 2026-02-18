export type RookieRevealCase = "high" | "low" | "draw";

export type RookieRevealResult = {
    case: RookieRevealCase;
    autoValue: number | null;
    label: string;
    explanation: string;
};

/**
 * Calculate the rookie potential reveal outcome based on surperformance delta.
 *
 * - delta >= 2  → high case (auto-assign potential_max)
 * - delta <= -2 → low case (auto-assign potential_min)
 * - between     → draw (manual choice required)
 */
export function calculateRookieReveal(
    delta: number,
    potentialMin: number,
    potentialMax: number,
): RookieRevealResult {
    if (delta >= 2) {
        return {
            case: "high",
            autoValue: potentialMax,
            label: "Haut potentiel",
            explanation: `Surperformance nette (+${delta}) : potentiel revele au maximum (${potentialMax}).`,
        };
    }

    if (delta <= -2) {
        return {
            case: "low",
            autoValue: potentialMin,
            label: "Bas potentiel",
            explanation: `Sous-performance nette (${delta}) : potentiel revele au minimum (${potentialMin}).`,
        };
    }

    return {
        case: "draw",
        autoValue: null,
        label: "Tirage au sort",
        explanation: `Performance neutre (${delta > 0 ? "+" : ""}${delta}) : choisissez manuellement le potentiel revele.`,
    };
}

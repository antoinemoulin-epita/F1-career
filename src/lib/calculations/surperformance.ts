// ─── Types ──────────────────────────────────────────────────────────────────

export type SurperformanceEffect = "positive" | "negative" | "neutral";

export type DriverSurperformance = {
    driver_id: string;
    name: string;
    team: string;
    age: number | null;
    predicted_position: number;
    final_position: number;
    delta: number; // predicted - final (positive = surperformance)
    effect: SurperformanceEffect;
    potential_change: number; // +1, -1, or 0
};

export type TeamSurperformance = {
    team_id: string;
    name: string;
    predicted_position: number;
    final_position: number;
    delta: number; // predicted - final (positive = surperformance)
    effect: SurperformanceEffect;
    budget_change: number; // +1, -1, or 0
};

// ─── Core calculations ─────────────────────────────────────────────────────

/**
 * Calculate surperformance delta.
 * Positive delta = performed better than predicted (e.g. predicted P5, finished P3 → +2).
 */
export function calculateDelta(predictedPosition: number, finalPosition: number): number {
    return predictedPosition - finalPosition;
}

/**
 * Determine the surperformance effect based on delta.
 * ≥ +2 places → positive
 * ≤ -2 places → negative
 * otherwise → neutral
 */
export function getSurperformanceEffect(delta: number): SurperformanceEffect {
    if (delta >= 2) return "positive";
    if (delta <= -2) return "negative";
    return "neutral";
}

/**
 * Calculate potential change for a driver based on surperformance and age.
 * Only drivers aged ≤26 are affected.
 * +2 or more places → +1 potential
 * -2 or more places → -1 potential
 */
export function getDriverPotentialChange(delta: number, age: number | null): number {
    if (age == null || age > 26) return 0;
    if (delta >= 2) return 1;
    if (delta <= -2) return -1;
    return 0;
}

/**
 * Calculate budget surperformance change for a team.
 * +2 or more places → +1 budget surperformance
 * -2 or more places → -1 budget surperformance
 */
export function getTeamBudgetChange(delta: number): number {
    if (delta >= 2) return 1;
    if (delta <= -2) return -1;
    return 0;
}

// ─── Batch calculations ────────────────────────────────────────────────────

export type DriverSurperformanceInput = {
    driver_id: string;
    name: string;
    team: string;
    age: number | null;
    predicted_position: number;
    final_position: number;
};

export type TeamSurperformanceInput = {
    team_id: string;
    name: string;
    predicted_position: number;
    final_position: number;
};

/**
 * Calculate surperformance for all drivers.
 * Returns sorted by absolute delta descending (most significant first).
 */
export function calculateAllDriverSurperformances(
    inputs: DriverSurperformanceInput[],
): DriverSurperformance[] {
    return inputs
        .map((input) => {
            const delta = calculateDelta(input.predicted_position, input.final_position);
            return {
                ...input,
                delta,
                effect: getSurperformanceEffect(delta),
                potential_change: getDriverPotentialChange(delta, input.age),
            };
        })
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/**
 * Calculate surperformance for all teams.
 * Returns sorted by absolute delta descending (most significant first).
 */
export function calculateAllTeamSurperformances(
    inputs: TeamSurperformanceInput[],
): TeamSurperformance[] {
    return inputs
        .map((input) => {
            const delta = calculateDelta(input.predicted_position, input.final_position);
            return {
                ...input,
                delta,
                effect: getSurperformanceEffect(delta),
                budget_change: getTeamBudgetChange(delta),
            };
        })
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

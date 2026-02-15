/**
 * Builds a Map<position, points> from points_system rows.
 */
export function buildPointsMap(
    rows: { position: number; points: number }[],
): Map<number, number> {
    const map = new Map<number, number>();
    for (const row of rows) {
        map.set(row.position, row.points);
    }
    return map;
}

/**
 * Calculates driver points for a single race result.
 * - DNF (finish_position is null) → 0 pts
 * - Otherwise lookup points by position
 * - +1 bonus for fastest lap if finished in top 10
 */
export function calculateDriverPoints({
    finishPosition,
    isFastestLap,
    pointsMap,
}: {
    finishPosition: number | null;
    isFastestLap: boolean;
    pointsMap: Map<number, number>;
}): number {
    if (finishPosition == null) return 0;

    const base = pointsMap.get(finishPosition) ?? 0;
    const bonus = isFastestLap && finishPosition <= 10 ? 1 : 0;

    return base + bonus;
}

export const RAIN_SCALE = [0, 10, 25, 50] as const;
export type RainProbability = (typeof RAIN_SCALE)[number];

export function snapToRainScale(value: number): RainProbability {
    let closest: RainProbability = RAIN_SCALE[0];
    let minDiff = Math.abs(value - closest);
    for (const v of RAIN_SCALE) {
        const diff = Math.abs(value - v);
        if (diff < minDiff) {
            minDiff = diff;
            closest = v;
        }
    }
    return closest;
}

export function rainLabel(value: number | null): string {
    const v = value ?? 0;
    if (v <= 0) return "Sec";
    return `${v}%`;
}

export function calculateRainProbability(baseRainProbability: number | null): RainProbability {
    const base = baseRainProbability ?? 0;
    const idx = RAIN_SCALE.indexOf(base as RainProbability);

    // If base is not in the scale, snap to nearest
    if (idx === -1) {
        return snapToRainScale(base);
    }

    // 70% same value, 15% one step up, 15% one step down
    const roll = Math.random();
    if (roll < 0.7) return RAIN_SCALE[idx];
    if (roll < 0.85) return RAIN_SCALE[Math.min(idx + 1, RAIN_SCALE.length - 1)];
    return RAIN_SCALE[Math.max(idx - 1, 0)];
}

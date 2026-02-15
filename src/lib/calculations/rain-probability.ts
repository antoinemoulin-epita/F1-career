export function calculateRainProbability(baseRainProbability: number | null): number {
    const base = baseRainProbability ?? 0;
    const variation = Math.floor(Math.random() * 21) - 10; // -10 to +10
    return Math.max(0, Math.min(100, base + variation));
}

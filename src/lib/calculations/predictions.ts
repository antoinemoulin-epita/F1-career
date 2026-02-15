// ─── Types ──────────────────────────────────────────────────────────────────

type DriverInput = {
    id: string | null;
    team_id: string | null;
    full_name: string | null;
    effective_note: number | null;
};

type CarInput = {
    team_id: string | null;
    total: number | null;
};

export type DriverPrediction = {
    driver_id: string;
    full_name: string | null;
    score: number;
    predicted_position: number;
};

export type ConstructorPrediction = {
    team_id: string;
    score: number;
    car_total: number;
    avg_driver_note: number;
    predicted_position: number;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildCarTotalMap(cars: CarInput[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const car of cars) {
        if (car.team_id != null) {
            map.set(car.team_id, car.total ?? 0);
        }
    }
    return map;
}

// ─── Driver predictions ─────────────────────────────────────────────────────

export function computeDriverPredictions(
    drivers: DriverInput[],
    cars: CarInput[],
): DriverPrediction[] {
    const carTotalMap = buildCarTotalMap(cars);

    const scored = drivers
        .filter((d): d is DriverInput & { id: string; team_id: string; effective_note: number } =>
            d.id != null && d.team_id != null && d.effective_note != null,
        )
        .map((d) => {
            const carTotal = carTotalMap.get(d.team_id) ?? 0;
            return {
                driver_id: d.id,
                full_name: d.full_name,
                score: d.effective_note + carTotal,
                predicted_position: 0,
            };
        })
        .sort((a, b) => b.score - a.score);

    return scored.map((entry, index) => ({
        ...entry,
        predicted_position: index + 1,
    }));
}

// ─── Constructor predictions ────────────────────────────────────────────────

export function computeConstructorPredictions(
    drivers: DriverInput[],
    cars: CarInput[],
): ConstructorPrediction[] {
    const carTotalMap = buildCarTotalMap(cars);

    // Group drivers by team_id and compute average effective_note
    const teamDriverNotes = new Map<string, number[]>();
    for (const d of drivers) {
        if (d.team_id == null || d.effective_note == null) continue;
        const notes = teamDriverNotes.get(d.team_id) ?? [];
        notes.push(d.effective_note);
        teamDriverNotes.set(d.team_id, notes);
    }

    const scored: ConstructorPrediction[] = [];
    for (const [teamId, notes] of teamDriverNotes) {
        const avgDriverNote = notes.reduce((sum, n) => sum + n, 0) / notes.length;
        const carTotal = carTotalMap.get(teamId) ?? 0;
        scored.push({
            team_id: teamId,
            score: carTotal + avgDriverNote,
            car_total: carTotal,
            avg_driver_note: avgDriverNote,
            predicted_position: 0,
        });
    }

    scored.sort((a, b) => b.score - a.score);

    return scored.map((entry, index) => ({
        ...entry,
        predicted_position: index + 1,
    }));
}

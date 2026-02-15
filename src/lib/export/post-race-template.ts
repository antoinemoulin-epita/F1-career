import type { StandingRow, PredictionRow } from "./pre-race-template";

// ─── Types ──────────────────────────────────────────────────────────────────

export type PostRaceExportSections = {
    conditions: boolean;
    qualifying: boolean;
    results: boolean;
    dnfs: boolean;
    fastestLap: boolean;
    notableEvents: boolean;
    standings: boolean;
    predictions: boolean;
};

export type QualifyingRow = {
    position: number;
    name: string;
    team: string;
};

export type RaceResultRow = {
    finish_position: number;
    name: string;
    team: string;
    grid_position: number;
    gain: number; // grid - finish (positive = gained positions)
    points: number;
};

export type DnfRow = {
    name: string;
    team: string;
    status: string;
    reason: string | null;
};

export type FastestLapData = {
    name: string;
    team: string;
} | null;

export type PostRaceExportData = {
    round_number: number;
    year: number;
    circuit_name: string;
    circuit_country: string;
    circuit_flag: string;
    weather: string;
    notable_events: string | null;
    qualifying: QualifyingRow[];
    results: RaceResultRow[];
    dnfs: DnfRow[];
    fastestLap: FastestLapData;
    driverStandings: StandingRow[];
    constructorStandings: StandingRow[];
    driverPredictions: PredictionRow[];
    constructorPredictions: PredictionRow[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatGain(gain: number): string {
    if (gain > 0) return `+${gain}`;
    if (gain < 0) return String(gain);
    return "=";
}

function formatGap(gap: number, isLeader: boolean): string {
    if (isLeader) return "—";
    return gap <= 0 ? String(gap) : `−${gap}`;
}

function formatDelta(delta: number | null): string {
    if (delta == null) return "—";
    if (delta > 0) return `+${delta} ↑`;
    if (delta < 0) return `${delta} ↓`;
    return "0 =";
}

function formatPosition(pos: number | null): string {
    if (pos == null) return "—";
    return `P${pos}`;
}

const DNF_STATUS_LABELS: Record<string, string> = {
    dnf_mechanical: "Mecanique",
    dnf_crash: "Crash",
    dnf_other: "Autre",
};

// ─── Generator ──────────────────────────────────────────────────────────────

export function generatePostRaceMarkdown(
    data: PostRaceExportData,
    sections: PostRaceExportSections,
): string {
    const lines: string[] = [];

    // Title — always present
    lines.push(
        `# RESULTATS GP ${data.round_number} — ${data.circuit_name} ${data.circuit_flag} ${data.circuit_country} (${data.year})`,
    );

    // Conditions
    if (sections.conditions) {
        lines.push("");
        lines.push("## Conditions");
        lines.push(`- Meteo : ${data.weather}`);
    }

    // Qualifying
    if (sections.qualifying && data.qualifying.length > 0) {
        lines.push("");
        lines.push("## Qualifications");
        lines.push("| Pos | Pilote | Equipe |");
        lines.push("|-----|--------|--------|");
        for (const row of data.qualifying) {
            lines.push(`| P${row.position} | ${row.name} | ${row.team} |`);
        }
    }

    // Race results
    if (sections.results && data.results.length > 0) {
        lines.push("");
        lines.push("## Classement course");
        lines.push("| Pos | Pilote | Equipe | Grille | +/- | Pts |");
        lines.push("|-----|--------|--------|--------|-----|-----|");
        for (const row of data.results) {
            lines.push(
                `| P${row.finish_position} | ${row.name} | ${row.team} | P${row.grid_position} | ${formatGain(row.gain)} | ${row.points} |`,
            );
        }
    }

    // DNFs
    if (sections.dnfs && data.dnfs.length > 0) {
        lines.push("");
        lines.push("## Abandons");
        for (const dnf of data.dnfs) {
            const label = DNF_STATUS_LABELS[dnf.status] ?? dnf.status;
            const detail = dnf.reason ? ` — ${dnf.reason}` : "";
            lines.push(`- **${dnf.name}** (${dnf.team}) : ${label}${detail}`);
        }
    }

    // Fastest lap
    if (sections.fastestLap && data.fastestLap) {
        lines.push("");
        lines.push("## Meilleur tour");
        lines.push(`- ${data.fastestLap.name} (${data.fastestLap.team})`);
    }

    // Notable events
    if (sections.notableEvents && data.notable_events) {
        lines.push("");
        lines.push("## Evenements marquants");
        lines.push(data.notable_events);
    }

    // Standings
    if (sections.standings) {
        lines.push("");
        lines.push("## Classement pilotes (apres GP)");
        lines.push("| Pos | Pilote | Equipe | Pts | V | Pdm | PP | Ecart |");
        lines.push("|-----|--------|--------|-----|---|-----|----|-------|");
        for (const row of data.driverStandings) {
            lines.push(
                `| ${row.position} | ${row.name} | ${row.team ?? "—"} | ${row.points} | ${row.wins} | ${row.podiums} | ${row.poles} | ${formatGap(row.gap, row.position === 1)} |`,
            );
        }

        lines.push("");
        lines.push("## Classement constructeurs (apres GP)");
        lines.push("| Pos | Equipe | Pts | V | Pdm | PP | Ecart |");
        lines.push("|-----|--------|-----|---|-----|----|-------|");
        for (const row of data.constructorStandings) {
            lines.push(
                `| ${row.position} | ${row.name} | ${row.points} | ${row.wins} | ${row.podiums} | ${row.poles} | ${formatGap(row.gap, row.position === 1)} |`,
            );
        }
    }

    // Predictions comparison
    if (sections.predictions) {
        lines.push("");
        lines.push("## Comparaison predictions — Pilotes");
        lines.push("| Pilote | Predit | Actuel | Ecart |");
        lines.push("|--------|--------|--------|-------|");
        for (const row of data.driverPredictions) {
            lines.push(
                `| ${row.name} | P${row.predicted_position} | ${formatPosition(row.actual_position)} | ${formatDelta(row.delta)} |`,
            );
        }

        lines.push("");
        lines.push("## Comparaison predictions — Constructeurs");
        lines.push("| Equipe | Predit | Actuel | Ecart |");
        lines.push("|--------|--------|--------|-------|");
        for (const row of data.constructorPredictions) {
            lines.push(
                `| ${row.name} | P${row.predicted_position} | ${formatPosition(row.actual_position)} | ${formatDelta(row.delta)} |`,
            );
        }
    }

    lines.push("");
    return lines.join("\n");
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type ExportSections = {
    circuitInfo: boolean;
    standings: boolean;
    predictions: boolean;
    narrativeArcs: boolean;
    recentForm: boolean;
};

export type CircuitData = {
    name: string;
    country: string;
    flag_emoji: string;
    circuit_type: string;
    key_attribute: string;
    region_climate: string;
    prestige: number;
    rain_probability: number;
};

export type StandingRow = {
    position: number;
    name: string;
    team?: string;
    points: number;
    wins: number;
    podiums: number;
    poles: number;
    gap: number;
};

export type PredictionRow = {
    predicted_position: number;
    name: string;
    score: number;
    actual_position: number | null;
    delta: number | null;
};

export type NarrativeArcData = {
    name: string;
    arc_type: string;
    status: string;
    importance: number;
    description: string | null;
};

export type RecentRaceData = {
    round_number: number;
    circuit_name: string;
    flag_emoji: string;
    weather: string;
    podium: { position: number; driver_name: string; team_name: string }[];
    notable_events: string | null;
};

export type PreRaceExportData = {
    round_number: number;
    year: number;
    circuit: CircuitData;
    driverStandings: StandingRow[];
    constructorStandings: StandingRow[];
    driverPredictions: PredictionRow[];
    constructorPredictions: PredictionRow[];
    narrativeArcs: NarrativeArcData[];
    recentForm: RecentRaceData[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Generator ──────────────────────────────────────────────────────────────

export function generatePreRaceMarkdown(
    data: PreRaceExportData,
    sections: ExportSections,
): string {
    const lines: string[] = [];
    const { circuit } = data;

    // Title — always present
    lines.push(
        `# CONTEXTE GP ${data.round_number} — ${circuit.name} ${circuit.flag_emoji} ${circuit.country} (${data.year})`,
    );

    // Circuit info
    if (sections.circuitInfo) {
        lines.push("");
        lines.push("## Infos circuit");
        lines.push(`- Type : ${circuit.circuit_type}`);
        lines.push(`- Caractéristique clé : ${circuit.key_attribute}`);
        lines.push(`- Climat : ${circuit.region_climate}`);
        lines.push(`- Prestige : ${"★".repeat(circuit.prestige)}`);
        lines.push(`- Probabilité de pluie : ${circuit.rain_probability}%`);
    }

    // Driver standings
    if (sections.standings) {
        lines.push("");
        lines.push("## Classement pilotes");
        lines.push("| Pos | Pilote | Equipe | Pts | V | Pdm | PP | Ecart |");
        lines.push("|-----|--------|--------|-----|---|-----|----|-------|");
        for (const row of data.driverStandings) {
            lines.push(
                `| ${row.position} | ${row.name} | ${row.team ?? "—"} | ${row.points} | ${row.wins} | ${row.podiums} | ${row.poles} | ${formatGap(row.gap, row.position === 1)} |`,
            );
        }

        lines.push("");
        lines.push("## Classement constructeurs");
        lines.push("| Pos | Equipe | Pts | V | Pdm | PP | Ecart |");
        lines.push("|-----|--------|-----|---|-----|----|-------|");
        for (const row of data.constructorStandings) {
            lines.push(
                `| ${row.position} | ${row.name} | ${row.points} | ${row.wins} | ${row.podiums} | ${row.poles} | ${formatGap(row.gap, row.position === 1)} |`,
            );
        }
    }

    // Predictions
    if (sections.predictions) {
        lines.push("");
        lines.push("## Prédictions vs Actuel — Pilotes");
        lines.push("| Prédit | Pilote | Score | Actuel | Delta |");
        lines.push("|--------|--------|-------|--------|-------|");
        for (const row of data.driverPredictions) {
            lines.push(
                `| P${row.predicted_position} | ${row.name} | ${row.score} | ${formatPosition(row.actual_position)} | ${formatDelta(row.delta)} |`,
            );
        }

        lines.push("");
        lines.push("## Prédictions vs Actuel — Constructeurs");
        lines.push("| Prédit | Equipe | Score | Actuel | Delta |");
        lines.push("|--------|--------|-------|--------|-------|");
        for (const row of data.constructorPredictions) {
            lines.push(
                `| P${row.predicted_position} | ${row.name} | ${row.score} | ${formatPosition(row.actual_position)} | ${formatDelta(row.delta)} |`,
            );
        }
    }

    // Narrative arcs
    if (sections.narrativeArcs && data.narrativeArcs.length > 0) {
        lines.push("");
        lines.push("## Arcs narratifs actifs");
        for (const arc of data.narrativeArcs) {
            lines.push(
                `- **${arc.name}** [${arc.arc_type}] — ${arc.status} (importance ${arc.importance}/3)`,
            );
            if (arc.description) {
                lines.push(`  ${arc.description}`);
            }
        }
    }

    // Recent form
    if (sections.recentForm && data.recentForm.length > 0) {
        lines.push("");
        lines.push(`## Forme récente (${data.recentForm.length} derniers GP)`);
        for (const race of data.recentForm) {
            lines.push("");
            lines.push(
                `### GP${race.round_number} — ${race.circuit_name} ${race.flag_emoji} (${race.weather})`,
            );
            for (const p of race.podium) {
                lines.push(`- P${p.position} : ${p.driver_name} (${p.team_name})`);
            }
            if (race.notable_events) {
                lines.push(`> ${race.notable_events}`);
            }
        }
    }

    lines.push("");
    return lines.join("\n");
}

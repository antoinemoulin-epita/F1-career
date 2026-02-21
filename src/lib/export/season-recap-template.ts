import type { StandingRow } from "./pre-race-template";
import type {
    QualifyingRow,
    RaceResultRow,
    DnfRow,
    FastestLapData,
} from "./post-race-template";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SeasonRecapExportSections = {
    standings: boolean;
    raceByRace: boolean;
};

export type RaceRecap = {
    round_number: number;
    circuit_name: string;
    circuit_flag: string;
    circuit_country: string;
    weather: string;
    notable_events: string | null;
    qualifying: QualifyingRow[];
    results: RaceResultRow[];
    dnfs: DnfRow[];
    fastestLap: FastestLapData;
};

export type SeasonRecapExportData = {
    year: number;
    gpCount: number;
    driverStandings: StandingRow[];
    constructorStandings: StandingRow[];
    races: RaceRecap[];
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

const DNF_STATUS_LABELS: Record<string, string> = {
    dnf_mechanical: "Mecanique",
    dnf_crash: "Crash",
    dnf_other: "Autre",
};

// ─── Generator ──────────────────────────────────────────────────────────────

export function generateSeasonRecapMarkdown(
    data: SeasonRecapExportData,
    sections: SeasonRecapExportSections,
): string {
    const lines: string[] = [];

    // Title — always present
    lines.push(`# RECAP SAISON ${data.year}`);
    lines.push("");
    lines.push(`> ${data.gpCount} Grand${data.gpCount !== 1 ? "s" : ""} Prix`);

    // Standings
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

    // Race by race
    if (sections.raceByRace) {
        for (const race of data.races) {
            lines.push("");
            lines.push(
                `## GP ${race.round_number} — ${race.circuit_flag} ${race.circuit_name} (${race.circuit_country})`,
            );
            lines.push(`- Meteo : ${race.weather}`);

            // Notable events
            if (race.notable_events) {
                lines.push("");
                lines.push(`> ${race.notable_events}`);
            }

            // Qualifying
            if (race.qualifying.length > 0) {
                lines.push("");
                lines.push("### Qualifications");
                lines.push("| Pos | Pilote | Equipe |");
                lines.push("|-----|--------|--------|");
                for (const row of race.qualifying) {
                    lines.push(`| P${row.position} | ${row.name} | ${row.team} |`);
                }
            }

            // Race results
            if (race.results.length > 0) {
                lines.push("");
                lines.push("### Classement course");
                lines.push("| Pos | Pilote | Equipe | Grille | +/- | Pts |");
                lines.push("|-----|--------|--------|--------|-----|-----|");
                for (const row of race.results) {
                    lines.push(
                        `| P${row.finish_position} | ${row.name} | ${row.team} | P${row.grid_position} | ${formatGain(row.gain)} | ${row.points} |`,
                    );
                }
            }

            // DNFs
            if (race.dnfs.length > 0) {
                lines.push("");
                lines.push("### Abandons");
                for (const dnf of race.dnfs) {
                    const label = DNF_STATUS_LABELS[dnf.status] ?? dnf.status;
                    const detail = dnf.reason ? ` — ${dnf.reason}` : "";
                    lines.push(`- **${dnf.name}** (${dnf.team}) : ${label}${detail}`);
                }
            }

            // Fastest lap
            if (race.fastestLap) {
                lines.push("");
                lines.push(
                    `**Meilleur tour** : ${race.fastestLap.name} (${race.fastestLap.team})`,
                );
            }
        }
    }

    lines.push("");
    return lines.join("\n");
}

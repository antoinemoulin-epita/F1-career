import type { StandingRow } from "./pre-race-template";
import type { DriverSurperformance, TeamSurperformance } from "@/lib/calculations/surperformance";
import type { DriverEvolution, TeamBudgetChange } from "@/hooks/use-end-season";

// ─── Types ──────────────────────────────────────────────────────────────────

export type EndSeasonExportSections = {
    champions: boolean;
    standings: boolean;
    stats: boolean;
    surperformances: boolean;
    evolutions: boolean;
    retirees: boolean;
    arcs: boolean;
};

export type ChampionData = {
    driverName: string | null;
    driverTeam: string | null;
    driverPoints: number | null;
    teamName: string | null;
    teamPoints: number | null;
};

export type SeasonStatsData = {
    uniqueWinners: number;
    uniquePodiums: number;
    uniquePoleSitters: number;
    totalDrivers: number;
    totalRaces: number;
};

export type DriverEvolutionDisplay = {
    name: string;
    parts: string[];
    totalNoteChange: number;
};

export type RetireeData = {
    name: string;
    team: string;
    age: number | null;
};

export type ArcData = {
    name: string;
    arc_type: string;
    status: string;
    description: string | null;
};

export type EndSeasonExportData = {
    year: number;
    champion: ChampionData;
    driverStandings: StandingRow[];
    constructorStandings: StandingRow[];
    stats: SeasonStatsData;
    driverSurperformances: DriverSurperformance[];
    teamSurperformances: TeamSurperformance[];
    driverEvolutions: DriverEvolutionDisplay[];
    rookieReveals: { name: string; potential: number }[];
    teamBudgetChanges: { name: string; delta: number }[];
    retirees: RetireeData[];
    arcs: ArcData[];
    seasonSummary: string | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatGap(gap: number, isLeader: boolean): string {
    if (isLeader) return "—";
    return gap <= 0 ? String(gap) : `−${gap}`;
}

function formatDelta(delta: number): string {
    if (delta > 0) return `+${delta}`;
    return String(delta);
}

// ─── Generator ──────────────────────────────────────────────────────────────

export function generateEndSeasonMarkdown(
    data: EndSeasonExportData,
    sections: EndSeasonExportSections,
): string {
    const lines: string[] = [];

    // Title — always present
    lines.push(`# FIN DE SAISON ${data.year}`);

    if (data.seasonSummary) {
        lines.push("");
        lines.push(`> ${data.seasonSummary}`);
    }

    // Champions
    if (sections.champions) {
        lines.push("");
        lines.push("## Champions");
        lines.push(
            `- Pilotes : ${data.champion.driverName ?? "—"} (${data.champion.driverTeam ?? "—"}) — ${data.champion.driverPoints ?? 0} pts`,
        );
        lines.push(
            `- Constructeurs : ${data.champion.teamName ?? "—"} — ${data.champion.teamPoints ?? 0} pts`,
        );
    }

    // Final standings
    if (sections.standings) {
        lines.push("");
        lines.push("## Classement final pilotes");
        lines.push("| Pos | Pilote | Equipe | Pts | V | Pdm | PP | Ecart |");
        lines.push("|-----|--------|--------|-----|---|-----|----|-------|");
        for (const row of data.driverStandings) {
            lines.push(
                `| ${row.position} | ${row.name} | ${row.team ?? "—"} | ${row.points} | ${row.wins} | ${row.podiums} | ${row.poles} | ${formatGap(row.gap, row.position === 1)} |`,
            );
        }

        lines.push("");
        lines.push("## Classement final constructeurs");
        lines.push("| Pos | Equipe | Pts | V | Pdm | PP | Ecart |");
        lines.push("|-----|--------|-----|---|-----|----|-------|");
        for (const row of data.constructorStandings) {
            lines.push(
                `| ${row.position} | ${row.name} | ${row.points} | ${row.wins} | ${row.podiums} | ${row.poles} | ${formatGap(row.gap, row.position === 1)} |`,
            );
        }
    }

    // Season stats
    if (sections.stats) {
        lines.push("");
        lines.push("## Statistiques saison");
        lines.push(`- Courses disputees : ${data.stats.totalRaces}`);
        lines.push(`- Pilotes au depart : ${data.stats.totalDrivers}`);
        lines.push(`- Vainqueurs differents : ${data.stats.uniqueWinners}`);
        lines.push(`- Podiums differents : ${data.stats.uniquePodiums}`);
        lines.push(`- Pole sitters differents : ${data.stats.uniquePoleSitters}`);
    }

    // Surperformances
    if (sections.surperformances) {
        lines.push("");
        lines.push("## Surperformances pilotes");
        lines.push("| Pilote | Equipe | Predit | Final | Delta | Effet |");
        lines.push("|--------|--------|--------|-------|-------|-------|");
        for (const d of data.driverSurperformances) {
            const effect =
                d.effect === "positive"
                    ? `+${d.potential_change} potentiel`
                    : d.effect === "negative"
                      ? `${d.potential_change} potentiel`
                      : "neutre";
            lines.push(
                `| ${d.name} | ${d.team} | P${d.predicted_position} | P${d.final_position} | ${formatDelta(d.delta)} | ${effect} |`,
            );
        }

        lines.push("");
        lines.push("## Surperformances constructeurs");
        lines.push("| Equipe | Predit | Final | Delta | Effet budget |");
        lines.push("|--------|--------|-------|-------|--------------|");
        for (const t of data.teamSurperformances) {
            const effect =
                t.budget_change !== 0
                    ? `${formatDelta(t.budget_change)} budget`
                    : "neutre";
            lines.push(
                `| ${t.name} | P${t.predicted_position} | P${t.final_position} | ${formatDelta(t.delta)} | ${effect} |`,
            );
        }
    }

    // Evolutions
    if (sections.evolutions) {
        // Driver note changes
        if (data.driverEvolutions.length > 0) {
            lines.push("");
            lines.push("## Evolutions pilotes");
            for (const evo of data.driverEvolutions) {
                const sign = evo.totalNoteChange > 0 ? "+" : "";
                lines.push(
                    `- **${evo.name}** : ${sign}${evo.totalNoteChange} note (${evo.parts.join(", ")})`,
                );
            }
        }

        // Rookie reveals
        if (data.rookieReveals.length > 0) {
            lines.push("");
            lines.push("## Rookies reveles");
            for (const r of data.rookieReveals) {
                lines.push(`- **${r.name}** : potentiel final = ${r.potential}`);
            }
        }

        // Budget changes
        if (data.teamBudgetChanges.length > 0) {
            lines.push("");
            lines.push("## Ajustements budgets");
            for (const t of data.teamBudgetChanges) {
                lines.push(`- **${t.name}** : ${formatDelta(t.delta)} bonus surperformance`);
            }
        }
    }

    // Retirees
    if (sections.retirees && data.retirees.length > 0) {
        lines.push("");
        lines.push("## Retraites");
        for (const r of data.retirees) {
            lines.push(`- **${r.name}** (${r.team}${r.age != null ? `, ${r.age} ans` : ""})`);
        }
    }

    // Narrative arcs
    if (sections.arcs && data.arcs.length > 0) {
        lines.push("");
        lines.push("## Arcs narratifs");
        for (const arc of data.arcs) {
            lines.push(`- **${arc.name}** [${arc.arc_type}] — ${arc.status}`);
            if (arc.description) {
                lines.push(`  ${arc.description}`);
            }
        }
    }

    lines.push("");
    return lines.join("\n");
}

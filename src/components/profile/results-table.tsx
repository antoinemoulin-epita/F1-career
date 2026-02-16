"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/base/badges/badges";
import { Select } from "@/components/base/select/select";
import { Table, TableCard } from "@/components/application/table/table";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RaceResultRow {
    year: number;
    round_number: number;
    circuit_name: string;
    flag_emoji?: string | null;
    weather?: string | null;
    quali_position?: number | null;
    grid_position?: number | null;
    finish_position?: number | null;
    points?: number | null;
    fastest_lap?: boolean | null;
    result_status?: string | null;
    team_name?: string | null;
    team_color?: string | null;
}

interface ResultsTableProps {
    title?: string;
    results: RaceResultRow[];
    showTeam?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function positionColor(pos: number | null | undefined): "warning" | "brand" | "gray" | "error" {
    if (!pos) return "gray";
    if (pos === 1) return "warning";
    if (pos <= 3) return "brand";
    return "gray";
}

function statusLabel(status: string | null | undefined): string {
    if (!status) return "";
    switch (status) {
        case "finished": return "";
        case "dnf_mechanical": return "DNF Meca";
        case "dnf_crash": return "DNF Crash";
        case "dnf_other": return "DNF";
        default: return status;
    }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ResultsTable({ title, results, showTeam = false }: ResultsTableProps) {
    const years = useMemo(
        () => [...new Set(results.map((r) => r.year))].sort((a, b) => b - a),
        [results],
    );

    const [selectedYear, setSelectedYear] = useState<string>("");

    const filtered = useMemo(
        () => selectedYear
            ? results.filter((r) => r.year === Number(selectedYear))
            : results,
        [results, selectedYear],
    );

    const yearItems = useMemo(
        () => [
            { id: "", label: "Toutes les saisons" },
            ...years.map((y) => ({ id: String(y), label: String(y) })),
        ],
        [years],
    );

    if (results.length === 0) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-tertiary">Aucun resultat disponible.</p>
            </div>
        );
    }

    return (
        <div>
            {(title || years.length > 1) && (
                <div className="mb-3 flex items-center justify-between">
                    {title && (
                        <h2 className="text-sm font-semibold text-secondary">{title}</h2>
                    )}
                    {years.length > 1 && (
                        <div className="w-48">
                            <Select
                                placeholder="Filtrer par annee"
                                selectedKey={selectedYear}
                                onSelectionChange={(key) => setSelectedYear(key ? String(key) : "")}
                                items={yearItems}
                                size="sm"
                            >
                                {(item) => (
                                    <Select.Item id={item.id}>{item.label}</Select.Item>
                                )}
                            </Select>
                        </div>
                    )}
                </div>
            )}

            <div className="overflow-auto rounded-xl border border-secondary">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                            {years.length > 1 && <th className="px-4 py-3">Annee</th>}
                            <th className="px-4 py-3">Rd</th>
                            <th className="px-4 py-3">Circuit</th>
                            {showTeam && <th className="px-4 py-3">Equipe</th>}
                            <th className="px-4 py-3">Qual</th>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">Pts</th>
                            <th className="px-4 py-3">FL</th>
                            <th className="px-4 py-3">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                        {filtered.map((r) => (
                            <tr key={`${r.year}-${r.round_number}`}>
                                {years.length > 1 && (
                                    <td className="px-4 py-3 font-medium text-primary">
                                        {r.year}
                                    </td>
                                )}
                                <td className="px-4 py-3 text-tertiary">{r.round_number}</td>
                                <td className="px-4 py-3">
                                    <span className="text-primary">
                                        {r.flag_emoji && `${r.flag_emoji} `}{r.circuit_name}
                                    </span>
                                </td>
                                {showTeam && (
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {r.team_color && (
                                                <span
                                                    className="size-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: r.team_color }}
                                                />
                                            )}
                                            <span className="text-tertiary">{r.team_name ?? "—"}</span>
                                        </div>
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    {r.quali_position ? (
                                        <Badge size="sm" color={positionColor(r.quali_position)} type="pill-color">
                                            P{r.quali_position}
                                        </Badge>
                                    ) : (
                                        <span className="text-tertiary">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {r.finish_position ? (
                                        <Badge size="sm" color={positionColor(r.finish_position)} type="pill-color">
                                            P{r.finish_position}
                                        </Badge>
                                    ) : (
                                        <span className="text-tertiary">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-primary tabular-nums">
                                    {r.points ?? 0}
                                </td>
                                <td className="px-4 py-3">
                                    {r.fastest_lap && (
                                        <Badge size="sm" color="purple" type="pill-color">FL</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {r.result_status && r.result_status !== "finished" && (
                                        <Badge size="sm" color="error" type="pill-color">
                                            {statusLabel(r.result_status)}
                                        </Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

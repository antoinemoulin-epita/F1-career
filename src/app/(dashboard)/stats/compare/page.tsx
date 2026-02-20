"use client";

import { Suspense, useMemo, useState } from "react";
import {
    Plus,
    XClose,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { StatsLineChart, CHART_COLORS } from "@/components/charts/line-chart";
import { useAllTimeStats, type AllTimeDriverStat } from "@/hooks/use-history";
import { useUniverseId } from "@/hooks/use-universe-id";

const MAX_DRIVERS = 4;

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ComparePage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <CompareContent />
        </Suspense>
    );
}

function CompareContent() {
    const { universeId, isLoading: universeLoading } = useUniverseId();

    const { data: stats, isLoading, error } = useAllTimeStats(universeId);

    const [selectedNames, setSelectedNames] = useState<string[]>([]);

    // All driver names sorted
    const allDriverNames = useMemo(() => {
        if (!stats) return [];
        return [...stats.drivers].sort((a, b) => a.name.localeCompare(b.name)).map((d) => d.name);
    }, [stats]);

    // Selected driver objects
    const selectedDrivers: AllTimeDriverStat[] = useMemo(() => {
        if (!stats) return [];
        return selectedNames
            .map((name) => stats.drivers.find((d) => d.name === name))
            .filter(Boolean) as AllTimeDriverStat[];
    }, [stats, selectedNames]);

    // All years across selected drivers
    const allYears = useMemo(() => {
        const yearSet = new Set<number>();
        for (const d of selectedDrivers) {
            for (const ps of d.perSeason) yearSet.add(ps.year);
        }
        return [...yearSet].sort((a, b) => a - b);
    }, [selectedDrivers]);

    // Points chart data
    const pointsChartData = useMemo(() => {
        return allYears.map((year) => {
            const row: Record<string, string | number> = { year: String(year) };
            for (const d of selectedDrivers) {
                const ps = d.perSeason.find((p) => p.year === year);
                row[d.name] = ps?.points ?? 0;
            }
            return row;
        });
    }, [allYears, selectedDrivers]);

    // Cumulative wins chart data
    const winsChartData = useMemo(() => {
        const cumulMap = new Map<string, number>();
        for (const d of selectedDrivers) cumulMap.set(d.name, 0);

        return allYears.map((year) => {
            const row: Record<string, string | number> = { year: String(year) };
            for (const d of selectedDrivers) {
                const ps = d.perSeason.find((p) => p.year === year);
                const prev = cumulMap.get(d.name) ?? 0;
                const next = prev + (ps?.wins ?? 0);
                cumulMap.set(d.name, next);
                row[d.name] = next;
            }
            return row;
        });
    }, [allYears, selectedDrivers]);

    const pointsLines = selectedDrivers.map((d, i) => ({
        dataKey: d.name,
        label: d.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const winsLines = selectedDrivers.map((d, i) => ({
        dataKey: d.name,
        label: d.name,
        color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    // Handlers
    const handleSelect = (index: number, key: React.Key | null) => {
        if (!key) return;
        const name = String(key);
        setSelectedNames((prev) => {
            const next = [...prev];
            next[index] = name;
            return next;
        });
    };

    const handleAdd = () => {
        if (selectedNames.length < MAX_DRIVERS) {
            setSelectedNames((prev) => [...prev, ""]);
        }
    };

    const handleRemove = (index: number) => {
        setSelectedNames((prev) => prev.filter((_, i) => i !== index));
    };

    // ─── Loading / error ─────────────────────────────────────────────

    if (universeLoading || isLoading) {
        return <PageLoading label="Chargement des statistiques..." />;
    }

    if (!universeId) {
        return (
            <PageError
                title="Univers manquant"
                backHref="/stats"
                backLabel="Retour"
            />
        );
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les statistiques."
                backHref="/stats"
                backLabel="Retour"
            />
        );
    }

    // Available drivers for each selector (exclude already selected)
    const getAvailableItems = (currentIndex: number) => {
        const otherSelected = selectedNames.filter((_, i) => i !== currentIndex);
        return allDriverNames
            .filter((name) => !otherSelected.includes(name))
            .map((name) => ({ id: name, label: name }));
    };

    const activeDrivers = selectedDrivers.filter((d) => d.name);

    // Stat rows for comparison table
    const statRows = [
        { label: "Victoires", getValue: (d: AllTimeDriverStat) => d.totalWins },
        { label: "Podiums", getValue: (d: AllTimeDriverStat) => d.totalPodiums },
        { label: "Poles", getValue: (d: AllTimeDriverStat) => d.totalPoles },
        { label: "Points", getValue: (d: AllTimeDriverStat) => d.totalPoints },
        { label: "Saisons", getValue: (d: AllTimeDriverStat) => d.seasonsCount },
        { label: "Meilleure pos.", getValue: (d: AllTimeDriverStat) => d.bestFinish },
    ];

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Statistiques", href: "/stats" },
                    { label: "Comparaison" },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Comparaison de pilotes
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    Comparez jusqu&apos;a {MAX_DRIVERS} pilotes cote a cote
                </p>
            </div>

            {/* Driver selectors */}
            <div className="mb-8 flex flex-wrap items-end gap-3">
                {selectedNames.map((name, i) => (
                    <div key={i} className="flex items-end gap-1">
                        <div className="w-48">
                            <Select.ComboBox
                                label={`Pilote ${i + 1}`}
                                placeholder="Rechercher..."
                                selectedKey={name || null}
                                onSelectionChange={(key) => handleSelect(i, key)}
                                items={getAvailableItems(i)}
                            >
                                {(item) => (
                                    <Select.Item id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select.ComboBox>
                        </div>
                        {selectedNames.length > 2 && (
                            <Button
                                size="sm"
                                color="tertiary"
                                iconLeading={XClose}
                                onClick={() => handleRemove(i)}
                            />
                        )}
                    </div>
                ))}
                {selectedNames.length < MAX_DRIVERS && (
                    <Button
                        size="sm"
                        color="secondary"
                        iconLeading={Plus}
                        onClick={handleAdd}
                    >
                        Ajouter
                    </Button>
                )}
                {selectedNames.length === 0 && (
                    <Button
                        size="sm"
                        color="primary"
                        onClick={() => setSelectedNames(["", ""])}
                    >
                        Commencer la comparaison
                    </Button>
                )}
            </div>

            {/* Content */}
            {activeDrivers.length < 2 ? (
                <div className="flex min-h-40 items-center justify-center">
                    <p className="text-sm text-tertiary">
                        Selectionnez au moins 2 pilotes pour comparer.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Stats table */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">Stats cote a cote</h2>
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3" />
                                        {activeDrivers.map((d, i) => (
                                            <th key={d.name} className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="inline-block size-2.5 rounded-full"
                                                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                                    />
                                                    {d.name}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {statRows.map((row) => {
                                        const values = activeDrivers.map((d) => row.getValue(d));
                                        const max = Math.max(...values);
                                        return (
                                            <tr key={row.label}>
                                                <td className="px-4 py-3 font-medium text-primary">
                                                    {row.label}
                                                </td>
                                                {activeDrivers.map((d, i) => {
                                                    const val = row.getValue(d);
                                                    const isBest = val === max && val > 0;
                                                    return (
                                                        <td key={d.name} className="px-4 py-3">
                                                            <span className={isBest ? "font-semibold text-brand-secondary" : "text-tertiary"}>
                                                                {val}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Points evolution chart */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">Evolution des points par saison</h2>
                        <div className="rounded-xl border border-secondary bg-primary p-4">
                            <StatsLineChart
                                data={pointsChartData}
                                lines={pointsLines}
                                xAxisKey="year"
                            />
                        </div>
                    </div>

                    {/* Cumulative wins chart */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">Evolution des victoires (cumul)</h2>
                        <div className="rounded-xl border border-secondary bg-primary p-4">
                            <StatsLineChart
                                data={winsChartData}
                                lines={winsLines}
                                xAxisKey="year"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

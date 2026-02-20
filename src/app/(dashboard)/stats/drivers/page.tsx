"use client";

import { Suspense, useMemo, useState } from "react";
import {
    Trophy01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { StatsLineChart, CHART_COLORS } from "@/components/charts/line-chart";
import { useAllTimeStats, type AllTimeDriverStat } from "@/hooks/use-history";
import { useUniverseId } from "@/hooks/use-universe-id";

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-secondary bg-primary p-4">
            <p className="text-xs text-tertiary">{label}</p>
            <p className="mt-1 text-xl font-semibold text-primary">{value}</p>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DriversStatsPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <DriversStatsContent />
        </Suspense>
    );
}

function DriversStatsContent() {
    const { universeId, isLoading: universeLoading } = useUniverseId();

    const { data: stats, isLoading, error } = useAllTimeStats(universeId);

    const [selectedDriverName, setSelectedDriverName] = useState<string>("");

    // Driver list for the ComboBox
    const driverItems = useMemo(() => {
        if (!stats) return [];
        return [...stats.drivers]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((d) => ({ id: d.name, label: d.name }));
    }, [stats]);

    // Selected driver data
    const driver: AllTimeDriverStat | null = useMemo(() => {
        if (!stats || !selectedDriverName) return null;
        return stats.drivers.find((d) => d.name === selectedDriverName) ?? null;
    }, [stats, selectedDriverName]);

    // Chart data
    const chartData = useMemo(() => {
        if (!driver) return [];
        return [...driver.perSeason]
            .sort((a, b) => a.year - b.year)
            .map((ps) => ({ year: String(ps.year), points: ps.points }));
    }, [driver]);

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

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Statistiques", href: "/stats" },
                    { label: "Pilotes" },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Profil Pilote
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    Statistiques de carriere detaillees
                </p>
            </div>

            {/* Driver selector */}
            <div className="mb-8 max-w-sm">
                <Select.ComboBox
                    label="Pilote"
                    placeholder="Rechercher un pilote..."
                    selectedKey={selectedDriverName || null}
                    onSelectionChange={(key) => setSelectedDriverName(key ? String(key) : "")}
                    items={driverItems}
                >
                    {(item) => (
                        <Select.Item id={item.id}>
                            {item.label}
                        </Select.Item>
                    )}
                </Select.ComboBox>
            </div>

            {/* Driver profile */}
            {!driver ? (
                <div className="flex min-h-40 items-center justify-center">
                    <p className="text-sm text-tertiary">
                        Selectionnez un pilote pour voir son profil.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Metrics */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">Resume</h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            <MetricCard label="Victoires" value={driver.totalWins} />
                            <MetricCard label="Podiums" value={driver.totalPodiums} />
                            <MetricCard label="Poles" value={driver.totalPoles} />
                            <MetricCard label="Points" value={driver.totalPoints} />
                            <MetricCard label="Saisons" value={driver.seasonsCount} />
                            <MetricCard label="Equipes" value={driver.teams.join(", ")} />
                        </div>
                    </div>

                    {/* Chart */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">Evolution des points</h2>
                        <div className="rounded-xl border border-secondary bg-primary p-4">
                            <StatsLineChart
                                data={chartData}
                                lines={[{ dataKey: "points", label: "Points", color: CHART_COLORS[0] }]}
                                xAxisKey="year"
                            />
                        </div>
                    </div>

                    {/* Seasons table */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">Saisons</h2>
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3">Annee</th>
                                        <th className="px-4 py-3">Pos</th>
                                        <th className="px-4 py-3">Pts</th>
                                        <th className="px-4 py-3">V</th>
                                        <th className="px-4 py-3">Pdm</th>
                                        <th className="px-4 py-3">PP</th>
                                        <th className="px-4 py-3">Equipe</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {[...driver.perSeason]
                                        .sort((a, b) => b.year - a.year)
                                        .map((ps) => (
                                            <tr key={ps.year}>
                                                <td className="px-4 py-3 font-medium text-primary">
                                                    {ps.year}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        size="sm"
                                                        color={ps.position === 1 ? "warning" : ps.position <= 3 ? "brand" : "gray"}
                                                        type="pill-color"
                                                    >
                                                        P{ps.position}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-primary">
                                                    {ps.points}
                                                </td>
                                                <td className="px-4 py-3 text-tertiary">{ps.wins}</td>
                                                <td className="px-4 py-3 text-tertiary">{ps.podiums}</td>
                                                <td className="px-4 py-3 text-tertiary">{ps.poles}</td>
                                                <td className="px-4 py-3 text-tertiary">{ps.teamName}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

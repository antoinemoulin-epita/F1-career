"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Tabs } from "@/components/application/tabs/tabs";
import { Table, TableCard } from "@/components/application/table/table";
import { useAllTimeStats, type AllTimeDriverStat, type AllTimeTeamStat } from "@/hooks/use-history";

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = "drivers" | "constructors";
type FilterId = "all" | "active" | "retired";

const TABS = [
    { id: "drivers" as const, label: "Pilotes" },
    { id: "constructors" as const, label: "Constructeurs" },
];

const FILTER_OPTIONS = [
    { id: "all", label: "Tous" },
    { id: "active", label: "Actifs" },
    { id: "retired", label: "Retraites" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function WinsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-80 items-center justify-center"><LoadingIndicator size="md" label="Chargement..." /></div>}>
            <WinsPageContent />
        </Suspense>
    );
}

function WinsPageContent() {
    const searchParams = useSearchParams();
    const universeId = searchParams.get("u") ?? "";

    const { data: stats, isLoading, error } = useAllTimeStats(universeId);

    const [activeTab, setActiveTab] = useState<TabId>("drivers");
    const [filter, setFilter] = useState<FilterId>("all");

    // ─── Determine active/retired drivers ────────────────────────────

    const { activeNames, sortedDrivers, sortedTeams } = useMemo(() => {
        if (!stats) return { activeNames: new Set<string>(), sortedDrivers: [], sortedTeams: [] };

        // Find the latest season year
        const latestYear = Math.max(...stats.seasons.map((s) => s.year), 0);

        // Drivers present in the latest season are "active"
        const activeSet = new Set<string>();
        for (const d of stats.drivers) {
            const inLastSeason = d.perSeason.some((ps) => ps.year === latestYear);
            if (inLastSeason) activeSet.add(d.name);
        }

        const drivers = [...stats.drivers].sort((a, b) => {
            if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
            if (b.totalPodiums !== a.totalPodiums) return b.totalPodiums - a.totalPodiums;
            return b.totalPoints - a.totalPoints;
        });

        const teams = [...stats.teams].sort((a, b) => {
            if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
            if (b.totalPodiums !== a.totalPodiums) return b.totalPodiums - a.totalPodiums;
            return b.totalPoints - a.totalPoints;
        });

        return { activeNames: activeSet, sortedDrivers: drivers, sortedTeams: teams };
    }, [stats]);

    // ─── Filtered drivers ────────────────────────────────────────────

    const filteredDrivers = useMemo(() => {
        if (filter === "all") return sortedDrivers;
        if (filter === "active") return sortedDrivers.filter((d) => activeNames.has(d.name));
        return sortedDrivers.filter((d) => !activeNames.has(d.name));
    }, [sortedDrivers, filter, activeNames]);

    // ─── Loading / error ─────────────────────────────────────────────

    if (!universeId) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon icon={AlertCircle} color="error" theme="light" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Univers manquant</EmptyState.Title>
                        <EmptyState.Description>
                            Aucun univers selectionne.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href="/history" size="md" color="secondary" iconLeading={ArrowLeft}>
                            Retour
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement des statistiques..." />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon icon={AlertCircle} color="error" theme="light" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Erreur de chargement</EmptyState.Title>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href="/history" size="md" color="secondary" iconLeading={ArrowLeft}>
                            Retour
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    const seasonCount = stats.seasons.length;

    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button
                    color="link-gray"
                    size="sm"
                    iconLeading={ArrowLeft}
                    href={`/history?u=${universeId}`}
                >
                    Palmares
                </Button>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Classement all-time
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    Statistiques agregees sur {seasonCount} saison{seasonCount !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Tabs */}
            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as TabId)}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs.List
                        type="underline"
                        size="sm"
                        items={TABS.map((t) => ({ id: t.id, label: t.label }))}
                    />

                    {/* Filter (drivers tab only) */}
                    {activeTab === "drivers" && (
                        <div className="w-40">
                            <Select
                                placeholder="Filtre"
                                selectedKey={filter}
                                onSelectionChange={(key) => setFilter(key as FilterId)}
                                items={FILTER_OPTIONS}
                                size="sm"
                            >
                                {(item) => (
                                    <Select.Item id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select>
                        </div>
                    )}
                </div>

                {/* Drivers tab */}
                <Tabs.Panel id="drivers" className="mt-6">
                    {filteredDrivers.length === 0 ? (
                        <p className="py-8 text-center text-sm text-tertiary">
                            Aucun pilote trouve.
                        </p>
                    ) : (
                        <TableCard.Root>
                            <TableCard.Header title="Pilotes" badge={String(filteredDrivers.length)} />
                            <Table>
                                <Table.Header>
                                    <Table.Head label="#" isRowHeader />
                                    <Table.Head label="Pilote" />
                                    <Table.Head label="V" />
                                    <Table.Head label="Pdm" />
                                    <Table.Head label="PP" />
                                    <Table.Head label="Pts" />
                                    <Table.Head label="Saisons" />
                                    <Table.Head label="Meilleur" />
                                </Table.Header>
                                <Table.Body items={filteredDrivers.map((d, i) => ({ ...d, _pos: i + 1 }))}>
                                    {(row) => {
                                        const badgeColor =
                                            row._pos === 1 ? "warning" : row._pos <= 3 ? "brand" : "gray";
                                        return (
                                            <Table.Row id={row.name}>
                                                <Table.Cell>
                                                    <Badge size="sm" color={badgeColor} type="pill-color">
                                                        {row._pos}
                                                    </Badge>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-primary">
                                                            {row.name}
                                                        </span>
                                                        {row.bestFinish === 1 && (
                                                            <Badge size="sm" color="success" type="pill-color">
                                                                Champion
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm font-semibold text-primary">
                                                        {row.totalWins}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.totalPodiums}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.totalPoles}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.totalPoints}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.seasonsCount}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Badge
                                                        size="sm"
                                                        color={row.bestFinish === 1 ? "warning" : row.bestFinish <= 3 ? "brand" : "gray"}
                                                        type="pill-color"
                                                    >
                                                        P{row.bestFinish}
                                                    </Badge>
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    }}
                                </Table.Body>
                            </Table>
                        </TableCard.Root>
                    )}
                </Tabs.Panel>

                {/* Constructors tab */}
                <Tabs.Panel id="constructors" className="mt-6">
                    {sortedTeams.length === 0 ? (
                        <p className="py-8 text-center text-sm text-tertiary">
                            Aucun constructeur trouve.
                        </p>
                    ) : (
                        <TableCard.Root>
                            <TableCard.Header title="Constructeurs" badge={String(sortedTeams.length)} />
                            <Table>
                                <Table.Header>
                                    <Table.Head label="#" isRowHeader />
                                    <Table.Head label="Equipe" />
                                    <Table.Head label="V" />
                                    <Table.Head label="Pdm" />
                                    <Table.Head label="PP" />
                                    <Table.Head label="Pts" />
                                    <Table.Head label="Saisons" />
                                    <Table.Head label="Meilleur" />
                                </Table.Header>
                                <Table.Body items={sortedTeams.map((t, i) => ({ ...t, _pos: i + 1 }))}>
                                    {(row) => {
                                        const badgeColor =
                                            row._pos === 1 ? "warning" : row._pos <= 3 ? "brand" : "gray";
                                        return (
                                            <Table.Row id={row.name}>
                                                <Table.Cell>
                                                    <Badge size="sm" color={badgeColor} type="pill-color">
                                                        {row._pos}
                                                    </Badge>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-primary">
                                                            {row.name}
                                                        </span>
                                                        {row.bestFinish === 1 && (
                                                            <Badge size="sm" color="success" type="pill-color">
                                                                Champion
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm font-semibold text-primary">
                                                        {row.totalWins}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.totalPodiums}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.totalPoles}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.totalPoints}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-sm text-tertiary">
                                                        {row.seasonsCount}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Badge
                                                        size="sm"
                                                        color={row.bestFinish === 1 ? "warning" : row.bestFinish <= 3 ? "brand" : "gray"}
                                                        type="pill-color"
                                                    >
                                                        P{row.bestFinish}
                                                    </Badge>
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    }}
                                </Table.Body>
                            </Table>
                        </TableCard.Root>
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

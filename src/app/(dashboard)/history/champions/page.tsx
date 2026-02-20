"use client";

import { Suspense, useMemo, useState } from "react";
import type { Selection } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { Tabs } from "@/components/application/tabs/tabs";
import { Table, TableCard } from "@/components/application/table/table";
import { TableSelectionBar } from "@/components/application/table/table-selection-bar";
import { useChampions } from "@/hooks/use-history";
import { useUniverseId } from "@/hooks/use-universe-id";
import { getSelectedCount } from "@/utils/selection";
import { useTableSort } from "@/hooks/use-table-sort";

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = "drivers" | "constructors";

type DriverTitleSummary = {
    name: string;
    titles: number;
    years: number[];
};

type ConstructorTitleSummary = {
    name: string;
    titles: number;
    years: number[];
};

type ChampionRow = {
    id: string;
    year: number;
    champion_driver_name: string | null;
    champion_driver_team: string | null;
    champion_driver_points: number | null;
    champion_team_name: string | null;
    champion_team_points: number | null;
};

const TABS = [
    { id: "drivers" as const, label: "Pilotes" },
    { id: "constructors" as const, label: "Constructeurs" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const driverTitleColumns = {
    pilote: (r: DriverTitleSummary) => r.name,
    titres: (r: DriverTitleSummary) => r.titles,
};

function DriverTitlesTable({ titles }: { titles: DriverTitleSummary[] }) {
    const { sortDescriptor, onSortChange, sortedItems } =
        useTableSort(titles, driverTitleColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const selectedCount = getSelectedCount(selectedKeys, titles.length);

    return (
        <TableCard.Root>
            {selectedCount > 0 ? (
                <TableSelectionBar
                    count={selectedCount}
                    onClearSelection={() => setSelectedKeys(new Set())}
                />
            ) : (
                <TableCard.Header title="Palmares" badge={String(titles.length)} />
            )}
            <Table
                sortDescriptor={sortDescriptor}
                onSortChange={onSortChange}
                selectionMode="multiple"
                selectionBehavior="toggle"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            >
                <Table.Header>
                    <Table.Head id="pilote" label="Pilote" isRowHeader allowsSorting />
                    <Table.Head id="titres" label="Titres" allowsSorting />
                    <Table.Head label="Saisons" />
                </Table.Header>
                <Table.Body items={sortedItems}>
                    {(row) => (
                        <Table.Row id={row.name}>
                            <Table.Cell>
                                <span className="text-sm font-medium text-primary">
                                    {row.name}
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge size="sm" color="success" type="pill-color">
                                    {row.titles}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="text-sm text-tertiary">
                                    {row.years.sort((a, b) => a - b).join(", ")}
                                </span>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );
}

const driverHistoryColumns = {
    saison: (r: ChampionRow) => r.year,
    champion: (r: ChampionRow) => r.champion_driver_name,
    equipe: (r: ChampionRow) => r.champion_driver_team,
    points: (r: ChampionRow) => r.champion_driver_points,
};

function DriverHistoryTable({ champions }: { champions: ChampionRow[] }) {
    const { sortDescriptor, onSortChange, sortedItems } =
        useTableSort(champions, driverHistoryColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const selectedCount = getSelectedCount(selectedKeys, champions.length);

    return (
        <TableCard.Root>
            {selectedCount > 0 ? (
                <TableSelectionBar
                    count={selectedCount}
                    onClearSelection={() => setSelectedKeys(new Set())}
                />
            ) : (
                <TableCard.Header title="Historique" badge={String(champions.length)} />
            )}
            <Table
                sortDescriptor={sortDescriptor}
                onSortChange={onSortChange}
                selectionMode="multiple"
                selectionBehavior="toggle"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            >
                <Table.Header>
                    <Table.Head id="saison" label="Saison" isRowHeader allowsSorting />
                    <Table.Head id="champion" label="Champion" allowsSorting />
                    <Table.Head id="equipe" label="Equipe" allowsSorting />
                    <Table.Head id="points" label="Points" allowsSorting />
                </Table.Header>
                <Table.Body items={sortedItems}>
                    {(row) => (
                        <Table.Row id={row.id}>
                            <Table.Cell>
                                <Badge size="sm" color="brand" type="pill-color">
                                    {row.year}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="text-sm font-medium text-primary">
                                    {row.champion_driver_name ?? "—"}
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="text-sm text-tertiary">
                                    {row.champion_driver_team ?? "—"}
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="text-sm font-semibold text-primary">
                                    {row.champion_driver_points ?? "—"}
                                </span>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );
}

const ctorTitleColumns = {
    constructeur: (r: ConstructorTitleSummary) => r.name,
    titres: (r: ConstructorTitleSummary) => r.titles,
};

function ConstructorTitlesTable({ titles }: { titles: ConstructorTitleSummary[] }) {
    const { sortDescriptor, onSortChange, sortedItems } =
        useTableSort(titles, ctorTitleColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const selectedCount = getSelectedCount(selectedKeys, titles.length);

    return (
        <TableCard.Root>
            {selectedCount > 0 ? (
                <TableSelectionBar
                    count={selectedCount}
                    onClearSelection={() => setSelectedKeys(new Set())}
                />
            ) : (
                <TableCard.Header title="Palmares" badge={String(titles.length)} />
            )}
            <Table
                sortDescriptor={sortDescriptor}
                onSortChange={onSortChange}
                selectionMode="multiple"
                selectionBehavior="toggle"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            >
                <Table.Header>
                    <Table.Head id="constructeur" label="Constructeur" isRowHeader allowsSorting />
                    <Table.Head id="titres" label="Titres" allowsSorting />
                    <Table.Head label="Saisons" />
                </Table.Header>
                <Table.Body items={sortedItems}>
                    {(row) => (
                        <Table.Row id={row.name}>
                            <Table.Cell>
                                <span className="text-sm font-medium text-primary">
                                    {row.name}
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge size="sm" color="success" type="pill-color">
                                    {row.titles}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="text-sm text-tertiary">
                                    {row.years.sort((a, b) => a - b).join(", ")}
                                </span>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );
}

const ctorHistoryColumns = {
    saison: (r: ChampionRow) => r.year,
    champion: (r: ChampionRow) => r.champion_team_name,
    points: (r: ChampionRow) => r.champion_team_points,
};

function ConstructorHistoryTable({ champions }: { champions: ChampionRow[] }) {
    const { sortDescriptor, onSortChange, sortedItems } =
        useTableSort(champions, ctorHistoryColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const selectedCount = getSelectedCount(selectedKeys, champions.length);

    return (
        <TableCard.Root>
            {selectedCount > 0 ? (
                <TableSelectionBar
                    count={selectedCount}
                    onClearSelection={() => setSelectedKeys(new Set())}
                />
            ) : (
                <TableCard.Header title="Historique" badge={String(champions.length)} />
            )}
            <Table
                sortDescriptor={sortDescriptor}
                onSortChange={onSortChange}
                selectionMode="multiple"
                selectionBehavior="toggle"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            >
                <Table.Header>
                    <Table.Head id="saison" label="Saison" isRowHeader allowsSorting />
                    <Table.Head id="champion" label="Champion" allowsSorting />
                    <Table.Head id="points" label="Points" allowsSorting />
                </Table.Header>
                <Table.Body items={sortedItems}>
                    {(row) => (
                        <Table.Row id={`ctor-${row.id}`}>
                            <Table.Cell>
                                <Badge size="sm" color="brand" type="pill-color">
                                    {row.year}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="text-sm font-medium text-primary">
                                    {row.champion_team_name ?? "—"}
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                <span className="text-sm font-semibold text-primary">
                                    {row.champion_team_points ?? "—"}
                                </span>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ChampionsPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <ChampionsPageContent />
        </Suspense>
    );
}

function ChampionsPageContent() {
    const { universeId, isLoading: universeLoading } = useUniverseId();

    const { data: champions, isLoading, error } = useChampions(universeId);

    const [activeTab, setActiveTab] = useState<TabId>("drivers");

    // ─── Driver title summary ────────────────────────────────────────

    const driverTitles = useMemo<DriverTitleSummary[]>(() => {
        if (!champions) return [];
        const map = new Map<string, DriverTitleSummary>();
        for (const c of champions) {
            const name = c.champion_driver_name;
            if (!name) continue;
            const existing = map.get(name) ?? { name, titles: 0, years: [] as number[] };
            existing.titles += 1;
            if (c.year != null) existing.years.push(c.year);
            map.set(name, existing);
        }
        return [...map.values()]
            .sort((a, b) => b.titles - a.titles || a.name.localeCompare(b.name));
    }, [champions]);

    // ─── Constructor title summary ───────────────────────────────────

    const constructorTitles = useMemo<ConstructorTitleSummary[]>(() => {
        if (!champions) return [];
        const map = new Map<string, ConstructorTitleSummary>();
        for (const c of champions) {
            const name = c.champion_team_name;
            if (!name) continue;
            const existing = map.get(name) ?? { name, titles: 0, years: [] as number[] };
            existing.titles += 1;
            if (c.year != null) existing.years.push(c.year);
            map.set(name, existing);
        }
        return [...map.values()]
            .sort((a, b) => b.titles - a.titles || a.name.localeCompare(b.name));
    }, [champions]);

    // ─── Loading ─────────────────────────────────────────────────────

    if (universeLoading || isLoading) {
        return <PageLoading label="Chargement des champions..." />;
    }

    if (!universeId) {
        return (
            <PageError
                title="Univers manquant"
                description="Aucun univers selectionne."
                backHref="/history"
                backLabel="Retour"
            />
        );
    }

    if (error || !champions) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les champions."
                backHref="/history"
                backLabel="Retour"
            />
        );
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Palmares", href: "/history" },
                    { label: "Champions" },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Champions
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    {champions.length} saison{champions.length !== 1 ? "s" : ""} archivee{champions.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Tabs */}
            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as TabId)}
            >
                <Tabs.List
                    type="underline"
                    size="sm"
                    items={TABS.map((t) => ({ id: t.id, label: t.label }))}
                />

                {/* Drivers tab */}
                <Tabs.Panel id="drivers" className="mt-6">
                    <div className="space-y-6">
                        {driverTitles.length > 0 && (
                            <DriverTitlesTable titles={driverTitles} />
                        )}
                        <DriverHistoryTable champions={champions as ChampionRow[]} />
                    </div>
                </Tabs.Panel>

                {/* Constructors tab */}
                <Tabs.Panel id="constructors" className="mt-6">
                    <div className="space-y-6">
                        {constructorTitles.length > 0 && (
                            <ConstructorTitlesTable titles={constructorTitles} />
                        )}
                        <ConstructorHistoryTable champions={champions as ChampionRow[]} />
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

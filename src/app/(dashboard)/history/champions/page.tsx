"use client";

import { Suspense, useMemo, useState } from "react";
import type { Selection } from "react-aria-components";
import { useSearchParams } from "next/navigation";
import { Upload01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { Tabs } from "@/components/application/tabs/tabs";
import { Table, TableCard } from "@/components/application/table/table";
import { TableSelectionBar } from "@/components/application/table/table-selection-bar";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { useChampions } from "@/hooks/use-history";
import { useImportHistoryChampions } from "@/hooks/use-import-history-champions";
import { historyChampionImportSchema } from "@/lib/validators/history-champion-import";
import type { HistoryChampionImportValues } from "@/lib/validators/history-champion-import";
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

// ─── Import config ──────────────────────────────────────────────────────────

const IMPORT_EXAMPLE = JSON.stringify(
    [
        {
            year: 2023,
            driver_name: "Max Verstappen",
            driver_team: "Red Bull",
            driver_points: 575,
            team_name: "Red Bull",
            team_points: 860,
            summary: "Domination totale de Verstappen",
        },
    ],
    null,
    2,
);

const IMPORT_FIELDS = [
    { name: "year", required: true, description: "Annee de la saison (1950-2100)" },
    { name: "driver_name", required: true, description: "Nom du champion pilote" },
    { name: "driver_team", required: false, description: "Ecurie du champion pilote" },
    { name: "driver_points", required: false, description: "Points du champion pilote" },
    { name: "team_name", required: false, description: "Nom du champion constructeur" },
    { name: "team_points", required: false, description: "Points du champion constructeur" },
    { name: "summary", required: false, description: "Resume de la saison" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ChampionsPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <ChampionsPageContent />
        </Suspense>
    );
}

function ChampionsPageContent() {
    const searchParams = useSearchParams();
    const universeId = searchParams.get("u") ?? "";

    const { data: champions, isLoading, error } = useChampions(universeId);
    const importChampions = useImportHistoryChampions();

    const [activeTab, setActiveTab] = useState<TabId>("drivers");

    // ─── Driver title summary ────────────────────────────────────────

    const driverTitles = useMemo<DriverTitleSummary[]>(() => {
        if (!champions) return [];
        const map = new Map<string, DriverTitleSummary>();
        for (const c of champions) {
            const name = c.champion_driver_name;
            if (!name) continue;
            const existing = map.get(name) ?? { name, titles: 0, years: [] };
            existing.titles += 1;
            existing.years.push(c.year);
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
            const existing = map.get(name) ?? { name, titles: 0, years: [] };
            existing.titles += 1;
            existing.years.push(c.year);
            map.set(name, existing);
        }
        return [...map.values()]
            .sort((a, b) => b.titles - a.titles || a.name.localeCompare(b.name));
    }, [champions]);

    // ─── Loading ─────────────────────────────────────────────────────

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

    if (isLoading) {
        return <PageLoading label="Chargement des champions..." />;
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
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Champions
                    </h1>
                    <p className="mt-1 text-sm text-tertiary">
                        {champions.length} saison{champions.length !== 1 ? "s" : ""} archivee{champions.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {universeId && (
                    <ImportJsonDialog<HistoryChampionImportValues>
                        title="Importer le palmares"
                        description="Importez l'historique des champions depuis un fichier JSON."
                        exampleData={IMPORT_EXAMPLE}
                        fields={IMPORT_FIELDS}
                        schema={historyChampionImportSchema}
                        onImport={(items) =>
                            importChampions.mutate({ universeId, rows: items })
                        }
                        isPending={importChampions.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                )}
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

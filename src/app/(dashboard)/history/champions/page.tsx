"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    Trophy01,
    Users01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { Tabs } from "@/components/application/tabs/tabs";
import { Table, TableCard } from "@/components/application/table/table";
import { useChampions } from "@/hooks/use-history";

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

const TABS = [
    { id: "drivers" as const, label: "Pilotes" },
    { id: "constructors" as const, label: "Constructeurs" },
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
                        {/* Titles summary */}
                        {driverTitles.length > 0 && (
                            <TableCard.Root>
                                <TableCard.Header title="Palmares" badge={String(driverTitles.length)} />
                                <Table>
                                    <Table.Header>
                                        <Table.Head label="Pilote" isRowHeader />
                                        <Table.Head label="Titres" />
                                        <Table.Head label="Saisons" />
                                    </Table.Header>
                                    <Table.Body items={driverTitles}>
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
                        )}

                        {/* Season history */}
                        <TableCard.Root>
                            <TableCard.Header title="Historique" badge={String(champions.length)} />
                            <Table>
                                <Table.Header>
                                    <Table.Head label="Saison" isRowHeader />
                                    <Table.Head label="Champion" />
                                    <Table.Head label="Equipe" />
                                    <Table.Head label="Points" />
                                </Table.Header>
                                <Table.Body items={champions}>
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
                    </div>
                </Tabs.Panel>

                {/* Constructors tab */}
                <Tabs.Panel id="constructors" className="mt-6">
                    <div className="space-y-6">
                        {/* Titles summary */}
                        {constructorTitles.length > 0 && (
                            <TableCard.Root>
                                <TableCard.Header title="Palmares" badge={String(constructorTitles.length)} />
                                <Table>
                                    <Table.Header>
                                        <Table.Head label="Constructeur" isRowHeader />
                                        <Table.Head label="Titres" />
                                        <Table.Head label="Saisons" />
                                    </Table.Header>
                                    <Table.Body items={constructorTitles}>
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
                        )}

                        {/* Season history */}
                        <TableCard.Root>
                            <TableCard.Header title="Historique" badge={String(champions.length)} />
                            <Table>
                                <Table.Header>
                                    <Table.Head label="Saison" isRowHeader />
                                    <Table.Head label="Champion" />
                                    <Table.Head label="Points" />
                                </Table.Header>
                                <Table.Body items={champions}>
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
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

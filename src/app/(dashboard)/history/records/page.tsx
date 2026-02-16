"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { Tabs } from "@/components/application/tabs/tabs";
import {
    useAllTimeStats,
    useRaceWinDetails,
    computeStreaks,
    computePodiumStreaks,
    type AllTimeDriverStat,
    type StreakRecord,
} from "@/hooks/use-history";

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = "season" | "career" | "circuit" | "consecutive";

const TABS = [
    { id: "season" as const, label: "Saison" },
    { id: "career" as const, label: "Carriere" },
    { id: "circuit" as const, label: "Circuit" },
    { id: "consecutive" as const, label: "Consecutifs" },
];

type SeasonRecord = {
    label: string;
    driverName: string;
    value: number;
    year: number;
};

type CareerRecord = {
    label: string;
    driverName: string;
    value: number;
    seasonsCount: number;
};

type CircuitWinRecord = {
    circuitName: string;
    flagEmoji: string;
    driverName: string;
    wins: number;
};

// ─── Record table component ─────────────────────────────────────────────────

function RecordTable({
    headers,
    children,
}: {
    headers: string[];
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-auto rounded-xl border border-secondary">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                        {headers.map((h) => (
                            <th key={h} className="px-4 py-3">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                    {children}
                </tbody>
            </table>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RecordsPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <RecordsPageContent />
        </Suspense>
    );
}

function RecordsPageContent() {
    const searchParams = useSearchParams();
    const universeId = searchParams.get("u") ?? "";

    const { data: stats, isLoading: statsLoading, error: statsError } = useAllTimeStats(universeId);
    const { data: raceData, isLoading: raceLoading, error: raceError } = useRaceWinDetails(universeId);

    const [activeTab, setActiveTab] = useState<TabId>("season");

    const isLoading = statsLoading || raceLoading;

    // ─── Season records ──────────────────────────────────────────────

    const seasonRecords = useMemo<SeasonRecord[]>(() => {
        if (!stats) return [];

        const records: SeasonRecord[] = [];

        // Helper: find the best single-season value for a stat
        const findBest = (
            label: string,
            getter: (ps: AllTimeDriverStat["perSeason"][0]) => number,
        ) => {
            let best: SeasonRecord | null = null;
            for (const d of stats.drivers) {
                for (const ps of d.perSeason) {
                    const val = getter(ps);
                    if (!best || val > best.value) {
                        best = { label, driverName: d.name, value: val, year: ps.year };
                    }
                }
            }
            if (best && best.value > 0) records.push(best);
        };

        findBest("Plus de victoires", (ps) => ps.wins);
        findBest("Plus de poles", (ps) => ps.poles);
        findBest("Plus de podiums", (ps) => ps.podiums);
        findBest("Plus de points", (ps) => ps.points);

        return records;
    }, [stats]);

    // ─── Career records ──────────────────────────────────────────────

    const careerRecords = useMemo<CareerRecord[]>(() => {
        if (!stats || stats.drivers.length === 0) return [];

        const records: CareerRecord[] = [];

        const findBest = (label: string, getter: (d: AllTimeDriverStat) => number) => {
            const sorted = [...stats.drivers].sort((a, b) => getter(b) - getter(a));
            const top = sorted[0];
            if (top && getter(top) > 0) {
                records.push({
                    label,
                    driverName: top.name,
                    value: getter(top),
                    seasonsCount: top.seasonsCount,
                });
            }
        };

        findBest("Plus de victoires", (d) => d.totalWins);
        findBest("Plus de podiums", (d) => d.totalPodiums);
        findBest("Plus de poles", (d) => d.totalPoles);
        findBest("Plus de points", (d) => d.totalPoints);

        return records;
    }, [stats]);

    // ─── Circuit records ─────────────────────────────────────────────

    const circuitRecords = useMemo<CircuitWinRecord[]>(() => {
        if (!raceData) return [];

        // Group by (driverName, circuitName)
        const map = new Map<string, { driverName: string; circuitName: string; flagEmoji: string; wins: number }>();
        for (const w of raceData.wins) {
            const key = `${w.driverName}|${w.circuitName}`;
            const existing = map.get(key);
            if (existing) {
                existing.wins += 1;
            } else {
                map.set(key, {
                    driverName: w.driverName,
                    circuitName: w.circuitName,
                    flagEmoji: w.flagEmoji,
                    wins: 1,
                });
            }
        }

        // For each circuit, keep the driver with the most wins
        const circuitBest = new Map<string, CircuitWinRecord>();
        for (const entry of map.values()) {
            const existing = circuitBest.get(entry.circuitName);
            if (!existing || entry.wins > existing.wins) {
                circuitBest.set(entry.circuitName, {
                    circuitName: entry.circuitName,
                    flagEmoji: entry.flagEmoji,
                    driverName: entry.driverName,
                    wins: entry.wins,
                });
            }
        }

        return [...circuitBest.values()].sort((a, b) => b.wins - a.wins);
    }, [raceData]);

    // ─── Consecutive records ─────────────────────────────────────────

    const { winStreaks, podiumStreaks } = useMemo(() => {
        if (!raceData) return { winStreaks: [] as StreakRecord[], podiumStreaks: [] as StreakRecord[] };

        const winStreaks = computeStreaks(raceData.allRaces, raceData.wins);
        const podiumStreaks = computePodiumStreaks(raceData.allRaces, raceData.podiums);

        return { winStreaks: winStreaks.slice(0, 10), podiumStreaks: podiumStreaks.slice(0, 10) };
    }, [raceData]);

    // ─── Loading / error ─────────────────────────────────────────────

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
        return <PageLoading label="Chargement des records..." />;
    }

    if (statsError || raceError) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les records."
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
                    { label: "Records" },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Records
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    Records de l&apos;univers
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

                {/* Season records */}
                <Tabs.Panel id="season" className="mt-6">
                    {seasonRecords.length === 0 ? (
                        <p className="py-8 text-center text-sm text-tertiary">
                            Aucun record de saison disponible.
                        </p>
                    ) : (
                        <RecordTable headers={["Record", "Pilote", "Valeur", "Saison"]}>
                            {seasonRecords.map((r) => (
                                <tr key={r.label}>
                                    <td className="px-4 py-3 font-medium text-primary">
                                        {r.label}
                                    </td>
                                    <td className="px-4 py-3 text-primary">
                                        {r.driverName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge size="sm" color="brand" type="pill-color">
                                            {r.value}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-tertiary">
                                        {r.year}
                                    </td>
                                </tr>
                            ))}
                        </RecordTable>
                    )}
                </Tabs.Panel>

                {/* Career records */}
                <Tabs.Panel id="career" className="mt-6">
                    {careerRecords.length === 0 ? (
                        <p className="py-8 text-center text-sm text-tertiary">
                            Aucun record de carriere disponible.
                        </p>
                    ) : (
                        <RecordTable headers={["Record", "Pilote", "Valeur", "Saisons"]}>
                            {careerRecords.map((r) => (
                                <tr key={r.label}>
                                    <td className="px-4 py-3 font-medium text-primary">
                                        {r.label}
                                    </td>
                                    <td className="px-4 py-3 text-primary">
                                        {r.driverName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge size="sm" color="brand" type="pill-color">
                                            {r.value}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-tertiary">
                                        {r.seasonsCount}
                                    </td>
                                </tr>
                            ))}
                        </RecordTable>
                    )}
                </Tabs.Panel>

                {/* Circuit records */}
                <Tabs.Panel id="circuit" className="mt-6">
                    {circuitRecords.length === 0 ? (
                        <p className="py-8 text-center text-sm text-tertiary">
                            Aucun record par circuit disponible.
                        </p>
                    ) : (
                        <RecordTable headers={["Circuit", "Pilote", "Victoires"]}>
                            {circuitRecords.map((r) => (
                                <tr key={r.circuitName}>
                                    <td className="px-4 py-3 font-medium text-primary">
                                        {r.flagEmoji} {r.circuitName}
                                    </td>
                                    <td className="px-4 py-3 text-primary">
                                        {r.driverName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge size="sm" color="brand" type="pill-color">
                                            {r.wins}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </RecordTable>
                    )}
                </Tabs.Panel>

                {/* Consecutive records */}
                <Tabs.Panel id="consecutive" className="mt-6">
                    <div className="space-y-6">
                        {/* Win streaks */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-primary">
                                Victoires consecutives
                            </h3>
                            {winStreaks.length === 0 ? (
                                <p className="py-4 text-sm text-tertiary">
                                    Aucune serie de victoires.
                                </p>
                            ) : (
                                <RecordTable headers={["Pilote", "Serie", "Periode"]}>
                                    {winStreaks.map((s, i) => (
                                        <tr key={`win-${s.driverName}-${i}`}>
                                            <td className="px-4 py-3 font-medium text-primary">
                                                {s.driverName}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge size="sm" color="brand" type="pill-color">
                                                    {s.streak}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {s.fromYear === s.toYear
                                                    ? `${s.fromYear} GP${s.fromRound} → GP${s.toRound}`
                                                    : `${s.fromYear} GP${s.fromRound} → ${s.toYear} GP${s.toRound}`}
                                            </td>
                                        </tr>
                                    ))}
                                </RecordTable>
                            )}
                        </div>

                        {/* Podium streaks */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-primary">
                                Podiums consecutifs
                            </h3>
                            {podiumStreaks.length === 0 ? (
                                <p className="py-4 text-sm text-tertiary">
                                    Aucune serie de podiums.
                                </p>
                            ) : (
                                <RecordTable headers={["Pilote", "Serie", "Periode"]}>
                                    {podiumStreaks.map((s, i) => (
                                        <tr key={`pod-${s.driverName}-${i}`}>
                                            <td className="px-4 py-3 font-medium text-primary">
                                                {s.driverName}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge size="sm" color="success" type="pill-color">
                                                    {s.streak}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {s.fromYear === s.toYear
                                                    ? `${s.fromYear} GP${s.fromRound} → GP${s.toRound}`
                                                    : `${s.fromYear} GP${s.fromRound} → ${s.toYear} GP${s.toRound}`}
                                            </td>
                                        </tr>
                                    ))}
                                </RecordTable>
                            )}
                        </div>
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

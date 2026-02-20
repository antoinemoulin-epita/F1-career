"use client";

import { Suspense, useMemo, useState } from "react";
import {
    AlertCircle,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import {
    useCompletedSeasons,
    useTeamsBySeason,
    useTeammateH2H,
    type H2HResult,
} from "@/hooks/use-stats";
import { useUniverseId } from "@/hooks/use-universe-id";

// ─── BattleBar ──────────────────────────────────────────────────────────────

function BattleBar({
    label,
    d1Value,
    d2Value,
    d1Name,
    d2Name,
}: {
    label: string;
    d1Value: number;
    d2Value: number;
    d1Name: string;
    d2Name: string;
}) {
    const total = d1Value + d2Value;
    const d1Pct = total > 0 ? (d1Value / total) * 100 : 50;
    const d2Pct = total > 0 ? (d2Value / total) * 100 : 50;

    return (
        <div>
            <p className="mb-2 text-xs font-medium text-secondary">{label}</p>
            <div className="flex items-center gap-2">
                <span className="w-8 text-right text-sm font-semibold text-primary">{d1Value}</span>
                <div className="flex h-6 flex-1 overflow-hidden rounded-full">
                    <div
                        className="flex items-center justify-end bg-brand-solid px-2 transition-all duration-300"
                        style={{ width: `${d1Pct}%` }}
                    >
                        {d1Pct > 20 && (
                            <span className="text-xs font-medium text-white">{d1Name.split(" ").pop()}</span>
                        )}
                    </div>
                    <div
                        className="flex items-center px-2 bg-tertiary transition-all duration-300"
                        style={{ width: `${d2Pct}%` }}
                    >
                        {d2Pct > 20 && (
                            <span className="text-xs font-medium text-primary">{d2Name.split(" ").pop()}</span>
                        )}
                    </div>
                </div>
                <span className="w-8 text-sm font-semibold text-primary">{d2Value}</span>
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HeadToHeadPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <HeadToHeadContent />
        </Suspense>
    );
}

function HeadToHeadContent() {
    const { universeId, isLoading: universeLoading } = useUniverseId();

    const { data: seasons, isLoading: seasonsLoading } = useCompletedSeasons(universeId);

    const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
    const [selectedTeamId, setSelectedTeamId] = useState<string>("");

    const { data: teams, isLoading: teamsLoading } = useTeamsBySeason(selectedSeasonId);

    // Find selected team and its drivers
    const selectedTeam = useMemo(() => {
        if (!teams || !selectedTeamId) return null;
        return teams.find((t) => t.id === selectedTeamId) ?? null;
    }, [teams, selectedTeamId]);

    const driverIds: [string, string] | null = useMemo(() => {
        if (!selectedTeam || selectedTeam.drivers.length < 2) return null;
        return [selectedTeam.drivers[0].id, selectedTeam.drivers[1].id];
    }, [selectedTeam]);

    const { data: h2h, isLoading: h2hLoading } = useTeammateH2H(
        selectedSeasonId,
        driverIds ?? ["", ""],
    );

    // Season items
    const seasonItems = useMemo(() => {
        if (!seasons) return [];
        return seasons.map((s) => ({ id: s.id, label: String(s.year) }));
    }, [seasons]);

    // Team items
    const teamItems = useMemo(() => {
        if (!teams) return [];
        return teams.map((t) => ({ id: t.id, label: t.name }));
    }, [teams]);

    // Handlers
    const handleSeasonChange = (key: React.Key | null) => {
        setSelectedSeasonId(key ? String(key) : "");
        setSelectedTeamId(""); // Reset team when season changes
    };

    // ─── Loading / error ─────────────────────────────────────────────

    if (universeLoading || seasonsLoading) {
        return <PageLoading label="Chargement des saisons..." />;
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

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Statistiques", href: "/stats" },
                    { label: "Duel Coequipiers" },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Duel Coequipiers
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    Comparaison detaillee entre coequipiers
                </p>
            </div>

            {/* Selectors */}
            <div className="mb-8 flex flex-wrap items-end gap-4">
                <div className="w-48">
                    <Select
                        label="Saison"
                        placeholder="Selectionner..."
                        selectedKey={selectedSeasonId || null}
                        onSelectionChange={handleSeasonChange}
                        items={seasonItems}
                    >
                        {(item) => (
                            <Select.Item id={item.id}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>
                </div>
                <div className="w-56">
                    <Select
                        label="Equipe"
                        placeholder="Selectionner..."
                        selectedKey={selectedTeamId || null}
                        onSelectionChange={(key) => setSelectedTeamId(key ? String(key) : "")}
                        items={teamItems}
                        isDisabled={!selectedSeasonId || teamsLoading}
                    >
                        {(item) => (
                            <Select.Item id={item.id}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>
                </div>
            </div>

            {/* Content */}
            {!selectedSeasonId || !selectedTeamId ? (
                <div className="flex min-h-40 items-center justify-center">
                    <p className="text-sm text-tertiary">
                        Selectionnez une saison et une equipe pour voir le duel.
                    </p>
                </div>
            ) : selectedTeam && selectedTeam.drivers.length < 2 ? (
                <div className="flex min-h-40 items-center justify-center">
                    <EmptyState size="lg">
                        <EmptyState.Header>
                            <EmptyState.FeaturedIcon icon={AlertCircle} color="warning" theme="light" />
                        </EmptyState.Header>
                        <EmptyState.Content>
                            <EmptyState.Title>Pas assez de pilotes</EmptyState.Title>
                            <EmptyState.Description>
                                Cette equipe n&apos;a pas 2 pilotes pour cette saison.
                            </EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                </div>
            ) : h2hLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                    <LoadingIndicator size="md" label="Chargement du duel..." />
                </div>
            ) : !h2h ? (
                <div className="flex min-h-40 items-center justify-center">
                    <p className="text-sm text-tertiary">
                        Aucune donnee de course disponible.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-primary">
                            {h2h.driver1.name} <span className="text-tertiary">vs</span> {h2h.driver2.name}
                        </h2>
                    </div>

                    {/* Battle bars */}
                    <div className="mx-auto max-w-lg space-y-4">
                        <BattleBar
                            label="Qualifications"
                            d1Value={h2h.qualiBattles.d1Wins}
                            d2Value={h2h.qualiBattles.d2Wins}
                            d1Name={h2h.driver1.name}
                            d2Name={h2h.driver2.name}
                        />
                        <BattleBar
                            label="Courses"
                            d1Value={h2h.raceBattles.d1Wins}
                            d2Value={h2h.raceBattles.d2Wins}
                            d1Name={h2h.driver1.name}
                            d2Name={h2h.driver2.name}
                        />
                        <div className="flex items-center justify-between rounded-xl border border-secondary bg-primary p-4">
                            <div className="text-center">
                                <p className="text-xl font-semibold text-primary">{h2h.points.d1}</p>
                                <p className="text-xs text-tertiary">points</p>
                            </div>
                            <p className="text-sm font-medium text-tertiary">Points</p>
                            <div className="text-center">
                                <p className="text-xl font-semibold text-primary">{h2h.points.d2}</p>
                                <p className="text-xs text-tertiary">points</p>
                            </div>
                        </div>
                    </div>

                    {/* Detail table */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">Detail par Grand Prix</h2>
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3">GP</th>
                                        <th className="px-4 py-3">Quali {h2h.driver1.name.split(" ").pop()}</th>
                                        <th className="px-4 py-3">Quali {h2h.driver2.name.split(" ").pop()}</th>
                                        <th className="px-4 py-3">Course {h2h.driver1.name.split(" ").pop()}</th>
                                        <th className="px-4 py-3">Course {h2h.driver2.name.split(" ").pop()}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {h2h.perRace.map((race) => {
                                        const qualiBetter = race.qualiD1 !== null && race.qualiD2 !== null
                                            ? race.qualiD1 < race.qualiD2 ? "d1" : race.qualiD2 < race.qualiD1 ? "d2" : null
                                            : null;
                                        const raceBetter = race.raceD1 !== null && race.raceD2 !== null
                                            ? race.raceD1 < race.raceD2 ? "d1" : race.raceD2 < race.raceD1 ? "d2" : null
                                            : null;

                                        return (
                                            <tr key={race.round}>
                                                <td className="px-4 py-3 font-medium text-primary">
                                                    {race.flagEmoji} {race.raceName}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={qualiBetter === "d1" ? "font-semibold text-brand-secondary" : "text-tertiary"}>
                                                        {race.qualiD1 !== null ? `P${race.qualiD1}` : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={qualiBetter === "d2" ? "font-semibold text-brand-secondary" : "text-tertiary"}>
                                                        {race.qualiD2 !== null ? `P${race.qualiD2}` : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={raceBetter === "d1" ? "font-semibold text-brand-secondary" : "text-tertiary"}>
                                                        {race.raceD1 !== null ? `P${race.raceD1}` : "DNF"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={raceBetter === "d2" ? "font-semibold text-brand-secondary" : "text-tertiary"}>
                                                        {race.raceD2 !== null ? `P${race.raceD2}` : "DNF"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

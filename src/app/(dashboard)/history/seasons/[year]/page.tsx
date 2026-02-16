"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
    ChevronDown,
    ChevronRight,
    Flag06,
    Trophy01,
    Users01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { Tabs } from "@/components/application/tabs/tabs";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useArchivedSeason, useChampions } from "@/hooks/use-history";
import { useCalendar } from "@/hooks/use-calendar";
import { useDriverStandings, useConstructorStandings } from "@/hooks/use-standings";
import { useRaceResults } from "@/hooks/use-race-results";
import { useQualifying } from "@/hooks/use-qualifying";

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = "calendar" | "drivers" | "constructors";

const TABS = [
    { id: "calendar" as const, label: "Calendrier" },
    { id: "drivers" as const, label: "Classement Pilotes" },
    { id: "constructors" as const, label: "Classement Constructeurs" },
];

// ─── Weather badge ──────────────────────────────────────────────────────────

function WeatherBadge({ weather }: { weather: string }) {
    const config: Record<string, { label: string; color: "gray" | "blue" | "warning" }> = {
        dry: { label: "Sec", color: "gray" },
        wet: { label: "Pluie", color: "blue" },
        mixed: { label: "Mixte", color: "warning" },
    };
    const { label, color } = config[weather] ?? config.dry;
    return (
        <Badge size="sm" color={color} type="pill-color">
            {label}
        </Badge>
    );
}

// ─── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    if (status === "finished") return null;
    const labels: Record<string, string> = {
        dnf_mechanical: "Abandon meca.",
        dnf_crash: "Accident",
        dnf_other: "Abandon",
        dsq: "Disqualifie",
    };
    return (
        <Badge size="sm" color="error" type="pill-color">
            {labels[status] ?? status}
        </Badge>
    );
}

// ─── Expanded race detail ───────────────────────────────────────────────────

function RaceDetail({ raceId }: { raceId: string }) {
    const { data: results, isLoading: resultsLoading } = useRaceResults(raceId);
    const { data: qualifying, isLoading: qualiLoading } = useQualifying(raceId);

    if (resultsLoading || qualiLoading) {
        return (
            <div className="flex items-center justify-center py-4">
                <LoadingIndicator size="sm" label="Chargement..." />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Qualifying */}
            {qualifying && qualifying.length > 0 && (
                <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase text-tertiary">
                        Grille de depart
                    </h4>
                    <div className="overflow-auto rounded-lg border border-secondary">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                    <th className="px-3 py-2">Pos</th>
                                    <th className="px-3 py-2">Pilote</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary">
                                {qualifying.map((q) => {
                                    const driver = q.driver as {
                                        first_name?: string | null;
                                        last_name?: string | null;
                                        full_name?: string | null;
                                    } | null;
                                    const name = driver?.full_name ?? `${driver?.first_name ?? ""} ${driver?.last_name ?? ""}`.trim();
                                    return (
                                        <tr key={q.id}>
                                            <td className="px-3 py-2 font-medium text-primary">
                                                P{q.position}
                                            </td>
                                            <td className="px-3 py-2 text-primary">
                                                {name || "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Race results */}
            {results && results.length > 0 && (
                <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase text-tertiary">
                        Resultats course
                    </h4>
                    <div className="overflow-auto rounded-lg border border-secondary">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                    <th className="px-3 py-2">Pos</th>
                                    <th className="px-3 py-2">Pilote</th>
                                    <th className="px-3 py-2">Grille</th>
                                    <th className="px-3 py-2">Statut</th>
                                    <th className="px-3 py-2">Pts</th>
                                    <th className="px-3 py-2">FL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary">
                                {results.map((r) => {
                                    const driver = r.driver as {
                                        first_name?: string | null;
                                        last_name?: string | null;
                                        full_name?: string | null;
                                    } | null;
                                    const name = driver?.full_name ?? `${driver?.first_name ?? ""} ${driver?.last_name ?? ""}`.trim();
                                    return (
                                        <tr key={r.id}>
                                            <td className="px-3 py-2 font-medium text-primary">
                                                {r.finish_position != null ? `P${r.finish_position}` : "—"}
                                            </td>
                                            <td className="px-3 py-2 text-primary">
                                                {name || "—"}
                                            </td>
                                            <td className="px-3 py-2 text-tertiary">
                                                P{r.grid_position}
                                            </td>
                                            <td className="px-3 py-2">
                                                <StatusBadge status={r.status ?? "finished"} />
                                            </td>
                                            <td className="px-3 py-2 font-semibold text-primary">
                                                {(r.points ?? 0) > 0 ? r.points : ""}
                                            </td>
                                            <td className="px-3 py-2">
                                                {r.fastest_lap && (
                                                    <Badge size="sm" color="purple" type="pill-color">
                                                        FL
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SeasonDetailPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <SeasonDetailContent />
        </Suspense>
    );
}

function SeasonDetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const universeId = searchParams.get("u") ?? "";
    const year = Number(params.year);

    const [activeTab, setActiveTab] = useState<TabId>("calendar");
    const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);

    // ─── Data hooks ───────────────────────────────────────────────────

    const { data: season, isLoading: seasonLoading } = useArchivedSeason(universeId, year);
    const { data: champions } = useChampions(universeId);

    const seasonId = season?.id ?? "";

    const { data: calendar, isLoading: calendarLoading } = useCalendar(seasonId);
    const { data: driverStandings, isLoading: driversLoading } = useDriverStandings(seasonId);
    const { data: constructorStandings, isLoading: constructorsLoading } = useConstructorStandings(seasonId);

    // ─── Derived data ─────────────────────────────────────────────────

    const championData = useMemo(() => {
        if (!champions) return null;
        return champions.find((c) => c.year === year) ?? null;
    }, [champions, year]);

    // Build winner map from race results for the calendar
    // We'll use the calendar + a separate approach
    const completedRaces = useMemo(() => {
        if (!calendar) return [];
        return calendar.filter((r) => r.status === "completed");
    }, [calendar]);

    const gpCount = calendar?.length ?? season?.gp_count ?? 0;

    // ─── Loading / error states ───────────────────────────────────────

    if (!universeId || !year) {
        return (
            <PageError
                title="Parametres manquants"
                backHref="/history"
                backLabel="Retour"
            />
        );
    }

    if (seasonLoading) {
        return <PageLoading label="Chargement de la saison..." />;
    }

    if (!season) {
        return (
            <PageError
                title="Saison introuvable"
                description={`Aucune saison archivee pour l'annee ${year}.`}
                backHref={`/history/seasons?u=${universeId}`}
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
                    { label: "Saisons", href: `/history/seasons?u=${universeId}` },
                    { label: String(year) },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Saison {year}
                </h1>
            </div>

            {/* Summary cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Champion pilote */}
                <div className="flex items-center gap-3 rounded-xl border border-secondary bg-primary p-4">
                    <FeaturedIcon icon={Trophy01} color="warning" theme="light" size="sm" />
                    <div className="min-w-0">
                        <p className="text-xs text-tertiary">Champion</p>
                        <p className="truncate text-sm font-semibold text-primary">
                            {championData?.champion_driver_name ?? "—"}
                        </p>
                    </div>
                </div>

                {/* Champion constructeur */}
                <div className="flex items-center gap-3 rounded-xl border border-secondary bg-primary p-4">
                    <FeaturedIcon icon={Users01} color="brand" theme="light" size="sm" />
                    <div className="min-w-0">
                        <p className="text-xs text-tertiary">Constructeur</p>
                        <p className="truncate text-sm font-semibold text-primary">
                            {championData?.champion_team_name ?? "—"}
                        </p>
                    </div>
                </div>

                {/* GP count */}
                <div className="flex items-center gap-3 rounded-xl border border-secondary bg-primary p-4">
                    <FeaturedIcon icon={Flag06} color="gray" theme="light" size="sm" />
                    <div className="min-w-0">
                        <p className="text-xs text-tertiary">Grands Prix</p>
                        <p className="text-sm font-semibold text-primary">{gpCount}</p>
                    </div>
                </div>

                {/* Points champion */}
                <div className="flex items-center gap-3 rounded-xl border border-secondary bg-primary p-4">
                    <FeaturedIcon icon={Trophy01} color="success" theme="light" size="sm" />
                    <div className="min-w-0">
                        <p className="text-xs text-tertiary">Points champion</p>
                        <p className="text-sm font-semibold text-primary">
                            {championData?.champion_driver_points ?? "—"} pts
                        </p>
                    </div>
                </div>
            </div>

            {/* Season summary */}
            {championData?.season_summary && (
                <div className="mb-6 rounded-xl border border-secondary bg-secondary p-4">
                    <p className="text-sm text-secondary">
                        {championData.season_summary}
                    </p>
                </div>
            )}

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

                {/* Calendar tab */}
                <Tabs.Panel id="calendar" className="mt-6">
                    {calendarLoading ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <LoadingIndicator size="sm" label="Chargement du calendrier..." />
                        </div>
                    ) : !calendar || calendar.length === 0 ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <p className="text-sm text-tertiary">Aucune course enregistree.</p>
                        </div>
                    ) : (
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Grand Prix</th>
                                        <th className="px-4 py-3">Meteo</th>
                                        <th className="px-4 py-3 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {calendar.map((race) => {
                                        const circuit = race.circuit as {
                                            name?: string | null;
                                            flag_emoji?: string | null;
                                            country?: string | null;
                                        } | null;
                                        const isExpanded = expandedRaceId === race.id;
                                        const isCompleted = race.status === "completed";

                                        return (
                                            <tr
                                                key={race.id}
                                                className="group"
                                            >
                                                <td colSpan={4} className="p-0">
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center transition duration-100 ease-linear hover:bg-primary_hover"
                                                        onClick={() =>
                                                            isCompleted
                                                                ? setExpandedRaceId(isExpanded ? null : race.id)
                                                                : undefined
                                                        }
                                                        disabled={!isCompleted}
                                                    >
                                                        <span className="px-4 py-3 text-left font-medium text-primary">
                                                            {race.round_number}
                                                        </span>
                                                        <span className="flex-1 px-4 py-3 text-left text-primary">
                                                            {circuit?.flag_emoji} {circuit?.name ?? "Circuit inconnu"}
                                                        </span>
                                                        <span className="px-4 py-3">
                                                            {isCompleted && race.weather && (
                                                                <WeatherBadge weather={race.weather} />
                                                            )}
                                                        </span>
                                                        <span className="px-4 py-3">
                                                            {isCompleted && (
                                                                isExpanded
                                                                    ? <ChevronDown className="size-4 text-fg-quaternary" />
                                                                    : <ChevronRight className="size-4 text-fg-quaternary" />
                                                            )}
                                                        </span>
                                                    </button>
                                                    {isExpanded && isCompleted && (
                                                        <div className="border-t border-secondary bg-secondary px-4 py-4">
                                                            {race.notable_events && (
                                                                <div className="mb-4 rounded-lg border border-secondary bg-primary p-3">
                                                                    <p className="text-xs font-semibold uppercase text-tertiary">
                                                                        Evenements notables
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-secondary">
                                                                        {race.notable_events}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <RaceDetail raceId={race.id} />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Tabs.Panel>

                {/* Driver standings tab */}
                <Tabs.Panel id="drivers" className="mt-6">
                    {driversLoading ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <LoadingIndicator size="sm" label="Chargement du classement..." />
                        </div>
                    ) : !driverStandings || driverStandings.length === 0 ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <p className="text-sm text-tertiary">Aucun classement disponible.</p>
                        </div>
                    ) : (
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3">Pos</th>
                                        <th className="px-4 py-3">Pilote</th>
                                        <th className="px-4 py-3">Equipe</th>
                                        <th className="px-4 py-3">Pts</th>
                                        <th className="px-4 py-3">V</th>
                                        <th className="px-4 py-3">Pdm</th>
                                        <th className="px-4 py-3">PP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {driverStandings.map((d) => {
                                        const pos = d.position ?? 0;
                                        return (
                                        <tr key={d.id}>
                                            <td className="px-4 py-3">
                                                {pos === 1 ? (
                                                    <Badge size="sm" color="warning" type="pill-color">
                                                        P{pos}
                                                    </Badge>
                                                ) : pos <= 3 ? (
                                                    <Badge size="sm" color="brand" type="pill-color">
                                                        P{pos}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-tertiary">P{pos}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-primary">
                                                {d.first_name} {d.last_name}
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {d.team_name ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-primary">
                                                {d.points}
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {d.wins}
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {d.podiums}
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {d.poles}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Tabs.Panel>

                {/* Constructor standings tab */}
                <Tabs.Panel id="constructors" className="mt-6">
                    {constructorsLoading ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <LoadingIndicator size="sm" label="Chargement du classement..." />
                        </div>
                    ) : !constructorStandings || constructorStandings.length === 0 ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <p className="text-sm text-tertiary">Aucun classement disponible.</p>
                        </div>
                    ) : (
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3">Pos</th>
                                        <th className="px-4 py-3">Equipe</th>
                                        <th className="px-4 py-3">Pts</th>
                                        <th className="px-4 py-3">V</th>
                                        <th className="px-4 py-3">Pdm</th>
                                        <th className="px-4 py-3">PP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {constructorStandings.map((c) => {
                                        const pos = c.position ?? 0;
                                        return (
                                        <tr key={c.id}>
                                            <td className="px-4 py-3">
                                                {pos === 1 ? (
                                                    <Badge size="sm" color="warning" type="pill-color">
                                                        P{pos}
                                                    </Badge>
                                                ) : pos <= 3 ? (
                                                    <Badge size="sm" color="brand" type="pill-color">
                                                        P{pos}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-tertiary">P{pos}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-primary">
                                                {c.team_name ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-primary">
                                                {c.points}
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {c.wins}
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {c.podiums}
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                {c.poles}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

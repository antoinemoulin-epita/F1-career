"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Car01,
    ChevronRight,
    CloudRaining01,
    File06,
    Flag06,
    Target04,
    Trophy01,
    User01,
    Users01,
} from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Table, TableCard } from "@/components/application/table/table";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useSeason } from "@/hooks/use-seasons";
import { useCalendar } from "@/hooks/use-calendar";
import { useDrivers } from "@/hooks/use-drivers";
import { useTeams } from "@/hooks/use-teams";
import { useCars } from "@/hooks/use-cars";
import { useDriverPredictions } from "@/hooks/use-predictions";
import {
    useDriverStandings,
    useConstructorStandings,
} from "@/hooks/use-standings";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useNews } from "@/hooks/use-news";
import {
    arcTypeLabels,
    arcTypeBadgeColor,
    arcStatusLabels,
    arcStatusColor,
} from "@/lib/constants/arc-labels";
import type { SeasonStatus, ArcType, ArcStatus } from "@/types";
import type { FC } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type CalendarEntryWithCircuit = {
    id: string;
    season_id: string;
    circuit_id: string;
    round_number: number;
    rain_probability: number | null;
    status: string | null;
    weather: string | null;
    circuit: {
        id: string;
        name: string | null;
        country: string | null;
        flag_emoji: string | null;
        circuit_type: string | null;
        key_attribute: string | null;
        region_climate: string | null;
        base_rain_probability: number | null;
        [key: string]: unknown;
    } | null;
    [key: string]: unknown;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const statusColor: Record<SeasonStatus, "gray" | "brand" | "success"> = {
    preparation: "gray",
    active: "brand",
    completed: "success",
};

const statusLabel: Record<SeasonStatus, string> = {
    preparation: "Preparation",
    active: "Active",
    completed: "Terminee",
};


// ─── RainBadge ──────────────────────────────────────────────────────────────

function RainBadge({ probability }: { probability: number | null }) {
    const value = probability ?? 0;
    let color: "gray" | "blue" | "brand" | "warning" | "error" = "gray";
    if (value >= 60) color = "error";
    else if (value >= 40) color = "warning";
    else if (value >= 20) color = "blue";

    return (
        <Badge size="sm" color={color} type="pill-color">
            <CloudRaining01 className="size-3" aria-hidden="true" />
            {value}%
        </Badge>
    );
}

// ─── NavCard ────────────────────────────────────────────────────────────────

function NavCard({
    href,
    icon: Icon,
    label,
    count,
}: {
    href: string;
    icon: FC<{ className?: string }>;
    label: string;
    count: number;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:bg-primary_hover"
        >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="size-5 text-fg-quaternary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">{count}</p>
                <p className="text-sm text-tertiary">{label}</p>
            </div>
            <ChevronRight className="size-5 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-secondary" />
        </Link>
    );
}

// ─── NextGPCard ─────────────────────────────────────────────────────────────

function NextGPCard({
    entry,
    seasonId,
}: {
    entry: CalendarEntryWithCircuit;
    seasonId: string;
}) {
    const circuit = entry.circuit;
    const status = entry.status;

    let ctaLabel: string;
    let ctaHref: string;

    if (status === "qualifying_done") {
        ctaLabel = "Course";
        ctaHref = `/season/${seasonId}/race/${entry.id}/results`;
    } else {
        ctaLabel = "Qualifications";
        ctaHref = `/season/${seasonId}/race/${entry.id}/qualifying`;
    }

    return (
        <div className="rounded-xl border border-secondary bg-primary p-5">
            <div className="mb-3 flex items-center gap-2">
                <FeaturedIcon icon={Flag06} color="brand" theme="light" size="sm" />
                <h2 className="text-sm font-semibold text-primary">
                    Prochain Grand Prix
                </h2>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-primary">
                        {circuit?.flag_emoji ?? ""}{" "}
                        {circuit?.name ?? "Circuit inconnu"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                        <Badge size="sm" color="gray" type="modern">
                            GP {entry.round_number}
                        </Badge>
                        <RainBadge probability={entry.rain_probability} />
                    </div>
                </div>
                <Button
                    href={ctaHref}
                    size="md"
                    color="primary"
                    iconTrailing={ChevronRight}
                >
                    {ctaLabel}
                </Button>
            </div>
        </div>
    );
}

// ─── SeasonCompletedCard ────────────────────────────────────────────────────

function SeasonCompletedCard() {
    return (
        <div className="rounded-xl border border-secondary bg-primary p-5">
            <div className="flex items-center gap-3">
                <FeaturedIcon icon={Trophy01} color="success" theme="light" size="sm" />
                <div>
                    <h2 className="text-sm font-semibold text-primary">
                        Saison terminee
                    </h2>
                    <p className="text-sm text-tertiary">
                        Tous les Grands Prix ont ete completes.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── StandingsTable ─────────────────────────────────────────────────────────

function DriverStandingsSection({
    standings,
    leaderPoints,
}: {
    standings: {
        driver_id: string | null;
        position: number | null;
        points: number | null;
        wins: number | null;
        podiums: number | null;
        poles: number | null;
        first_name: string | null;
        last_name: string | null;
        team_name: string | null;
        team_color: string | null;
    }[];
    leaderPoints: number;
}) {
    const top10 = standings.slice(0, 10);
    const hasMore = standings.length > 10;

    return (
        <TableCard.Root>
            <TableCard.Header
                title="Classement pilotes"
                badge={String(standings.length)}
            />
            <Table>
                <Table.Header>
                    <Table.Head label="#" isRowHeader />
                    <Table.Head label="Pilote" />
                    <Table.Head label="Pts" />
                    <Table.Head label="V" />
                    <Table.Head label="P" />
                    <Table.Head label="PP" />
                    <Table.Head label="Ecart" />
                </Table.Header>
                <Table.Body items={top10}>
                    {(row) => {
                        const pos = row.position ?? 0;
                        const pts = row.points ?? 0;
                        const gap = pos === 1 ? "—" : `−${leaderPoints - pts}`;
                        const badgeColor =
                            pos === 1
                                ? "warning"
                                : pos <= 3
                                  ? "brand"
                                  : "gray";

                        return (
                            <Table.Row id={row.driver_id ?? pos}>
                                <Table.Cell>
                                    <Badge
                                        size="sm"
                                        color={badgeColor}
                                        type="pill-color"
                                    >
                                        P{pos}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="flex items-center gap-2">
                                        {row.team_color && (
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        row.team_color,
                                                }}
                                            />
                                        )}
                                        <span className="text-sm font-medium text-primary">
                                            {row.first_name} {row.last_name}
                                        </span>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-semibold text-primary">
                                        {pts}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {row.wins ?? 0}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {row.podiums ?? 0}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {row.poles ?? 0}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {gap}
                                    </span>
                                </Table.Cell>
                            </Table.Row>
                        );
                    }}
                </Table.Body>
            </Table>
            {hasMore && (
                <div className="border-t border-secondary px-4 py-3 text-center">
                    <span className="text-sm text-tertiary">
                        Voir les {standings.length} pilotes
                    </span>
                </div>
            )}
        </TableCard.Root>
    );
}

function ConstructorStandingsSection({
    standings,
    leaderPoints,
}: {
    standings: {
        team_id: string | null;
        position: number | null;
        points: number | null;
        wins: number | null;
        podiums: number | null;
        poles: number | null;
        team_name: string | null;
        team_color: string | null;
    }[];
    leaderPoints: number;
}) {
    return (
        <TableCard.Root>
            <TableCard.Header
                title="Classement constructeurs"
                badge={String(standings.length)}
            />
            <Table>
                <Table.Header>
                    <Table.Head label="#" isRowHeader />
                    <Table.Head label="Equipe" />
                    <Table.Head label="Pts" />
                    <Table.Head label="V" />
                    <Table.Head label="P" />
                    <Table.Head label="PP" />
                    <Table.Head label="Ecart" />
                </Table.Header>
                <Table.Body items={standings}>
                    {(row) => {
                        const pos = row.position ?? 0;
                        const pts = row.points ?? 0;
                        const gap = pos === 1 ? "—" : `−${leaderPoints - pts}`;
                        const badgeColor =
                            pos === 1
                                ? "warning"
                                : pos <= 3
                                  ? "brand"
                                  : "gray";

                        return (
                            <Table.Row id={row.team_id ?? pos}>
                                <Table.Cell>
                                    <Badge
                                        size="sm"
                                        color={badgeColor}
                                        type="pill-color"
                                    >
                                        P{pos}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="flex items-center gap-2">
                                        {row.team_color && (
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        row.team_color,
                                                }}
                                            />
                                        )}
                                        <span className="text-sm font-medium text-primary">
                                            {row.team_name}
                                        </span>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-semibold text-primary">
                                        {pts}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {row.wins ?? 0}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {row.podiums ?? 0}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {row.poles ?? 0}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {gap}
                                    </span>
                                </Table.Cell>
                            </Table.Row>
                        );
                    }}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );
}

// ─── NarrativeArcsSection ───────────────────────────────────────────────────

function NarrativeArcsSection({
    arcs,
}: {
    arcs: {
        id: string;
        name: string | null;
        description: string | null;
        arc_type: ArcType | null;
        status: ArcStatus | null;
        importance: number | null;
    }[];
}) {
    if (arcs.length === 0) return null;

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-primary">
                    Arcs narratifs
                </h2>
                <Badge size="sm" color="gray" type="modern">
                    {arcs.length} actif{arcs.length !== 1 ? "s" : ""}
                </Badge>
            </div>
            <div className="flex flex-col gap-3">
                {arcs.map((arc) => {
                    const typeKey = arc.arc_type ?? "other";
                    const statusKey = arc.status ?? "signal";
                    const importance = arc.importance ?? 0;

                    return (
                        <div
                            key={arc.id}
                            className="rounded-xl border border-secondary bg-primary p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-primary">
                                        {arc.name}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                        <Badge
                                            size="sm"
                                            color={
                                                arcTypeBadgeColor[typeKey] ??
                                                "gray"
                                            }
                                            type="pill-color"
                                        >
                                            {arcTypeLabels[typeKey] ?? typeKey}
                                        </Badge>
                                        <Badge
                                            size="sm"
                                            color={
                                                arcStatusColor[statusKey] ??
                                                "gray"
                                            }
                                            type="pill-color"
                                        >
                                            {arcStatusLabels[statusKey] ??
                                                statusKey}
                                        </Badge>
                                    </div>
                                    {arc.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-tertiary">
                                            {arc.description}
                                        </p>
                                    )}
                                </div>
                                <div
                                    className="shrink-0 text-sm text-tertiary"
                                    title={`Importance : ${importance}/5`}
                                >
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span
                                            key={i}
                                            className={
                                                i < importance
                                                    ? "text-warning-primary"
                                                    : "text-quaternary"
                                            }
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SeasonDashboardPage() {
    const seasonId = useParams<{ id: string }>().id;

    const { data: season, isLoading: seasonLoading, error: seasonError } = useSeason(seasonId);
    const { data: calendarRaw, isLoading: calendarLoading } = useCalendar(seasonId);
    const { data: drivers } = useDrivers(seasonId);
    const { data: teams } = useTeams(seasonId);
    const { data: cars } = useCars(seasonId);
    const { data: driverStandings } = useDriverStandings(seasonId);
    const { data: constructorStandings } = useConstructorStandings(seasonId);
    const { data: driverPredictions } = useDriverPredictions(seasonId);
    const { data: narrativeArcs } = useNarrativeArcs(season?.universe_id ?? "");
    const { data: newsData } = useNews(seasonId);

    // ─── Derived state ──────────────────────────────────────────────────────

    const calendar = calendarRaw as CalendarEntryWithCircuit[] | undefined;

    const { completedCount, totalCount, nextGP, allCompleted } = useMemo(() => {
        const entries = calendar ?? [];
        const completed = entries.filter((e) => e.status === "completed").length;
        const total = entries.length;
        const next = entries.find((e) => e.status !== "completed") ?? null;
        const done = total > 0 && completed === total;
        return { completedCount: completed, totalCount: total, nextGP: next, allCompleted: done };
    }, [calendar]);

    const leaderDriverPts = driverStandings?.[0]?.points ?? 0;
    const leaderTeamPts = constructorStandings?.[0]?.points ?? 0;

    // ─── Loading ────────────────────────────────────────────────────────────

    if (seasonLoading || calendarLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement de la saison..." />
            </div>
        );
    }

    // ─── Error ──────────────────────────────────────────────────────────────

    if (seasonError || !season) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon
                            icon={AlertCircle}
                            color="error"
                            theme="light"
                        />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Erreur de chargement</EmptyState.Title>
                        <EmptyState.Description>
                            Impossible de charger cette saison.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button
                            href="/universe"
                            size="md"
                            color="secondary"
                            iconLeading={ArrowLeft}
                        >
                            Retour aux univers
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    const seasonStatus = (season.status ?? "preparation") as SeasonStatus;

    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button
                    color="link-gray"
                    size="sm"
                    iconLeading={ArrowLeft}
                    href={`/universe/${season.universe_id}`}
                >
                    Retour a l&apos;univers
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Saison {season.year}
                    </h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {completedCount}/{totalCount} Grand
                        {totalCount !== 1 ? "s" : ""} Prix
                    </p>
                </div>
                <BadgeWithDot
                    size="md"
                    color={statusColor[seasonStatus]}
                    type="pill-color"
                >
                    {statusLabel[seasonStatus]}
                </BadgeWithDot>
            </div>

            {/* Nav cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
                <NavCard
                    href={`/season/${seasonId}/calendar`}
                    icon={Calendar}
                    label="Grand Prix"
                    count={totalCount}
                />
                <NavCard
                    href={`/season/${seasonId}/drivers`}
                    icon={User01}
                    label={`Pilote${(drivers?.length ?? 0) !== 1 ? "s" : ""}`}
                    count={drivers?.length ?? 0}
                />
                <NavCard
                    href={`/season/${seasonId}/teams`}
                    icon={Users01}
                    label={`Equipe${(teams?.length ?? 0) !== 1 ? "s" : ""}`}
                    count={teams?.length ?? 0}
                />
                <NavCard
                    href={`/season/${seasonId}/cars`}
                    icon={Car01}
                    label={`Voiture${(cars?.length ?? 0) !== 1 ? "s" : ""}`}
                    count={cars?.length ?? 0}
                />
                <NavCard
                    href={`/season/${seasonId}/predictions`}
                    icon={Target04}
                    label="Predictions"
                    count={driverPredictions?.length ?? 0}
                />
                <NavCard
                    href={`/season/${seasonId}/news`}
                    icon={File06}
                    label="News"
                    count={newsData?.length ?? 0}
                />
            </div>

            {/* Next GP or Season completed */}
            <div className="mt-6">
                {allCompleted ? (
                    <SeasonCompletedCard />
                ) : nextGP ? (
                    <NextGPCard entry={nextGP} seasonId={seasonId} />
                ) : null}
            </div>

            {/* Standings */}
            {driverStandings && driverStandings.length > 0 && (
                <div className="mt-6">
                    <DriverStandingsSection
                        standings={driverStandings}
                        leaderPoints={leaderDriverPts}
                    />
                </div>
            )}

            {constructorStandings && constructorStandings.length > 0 && (
                <div className="mt-6">
                    <ConstructorStandingsSection
                        standings={constructorStandings}
                        leaderPoints={leaderTeamPts}
                    />
                </div>
            )}

            {/* Narrative arcs */}
            {narrativeArcs && narrativeArcs.length > 0 && (
                <div className="mt-6">
                    <NarrativeArcsSection arcs={narrativeArcs} />
                </div>
            )}
        </div>
    );
}

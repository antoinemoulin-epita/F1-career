"use client";

import { useMemo, useState } from "react";
import type { Selection } from "react-aria-components";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Calendar,
    Car01,
    CheckCircle,
    ChevronRight,
    Tool01,
    CloudRaining01,
    File06,
    Flag06,
    Target04,
    Trophy01,
    User01,
    Users01,
    RefreshCcw01,
    AlertTriangle,
} from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { Table, TableCard } from "@/components/application/table/table";
import { TableSelectionBar } from "@/components/application/table/table-selection-bar";
import { getSelectedCount } from "@/utils/selection";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { NewsForm } from "@/components/forms/news-form";
import { useSeason, useResetSeason } from "@/hooks/use-seasons";
import { useTableSort } from "@/hooks/use-table-sort";
import { useCalendar } from "@/hooks/use-calendar";
import { useDrivers } from "@/hooks/use-drivers";
import { useTeams } from "@/hooks/use-teams";
import { useCars } from "@/hooks/use-cars";
import { useEngineSuppliers } from "@/hooks/use-engine-suppliers";
import { useDriverPredictions } from "@/hooks/use-predictions";
import {
    useDriverStandings,
    useConstructorStandings,
} from "@/hooks/use-standings";
import { useArcRelatedEntities } from "@/hooks/use-arc-related-entities";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useNews } from "@/hooks/use-news";
import {
    arcTypeLabels,
    arcTypeBadgeColor,
    arcStatusLabels,
    arcStatusColor,
} from "@/lib/constants/arc-labels";
import { PointsSystemModal } from "@/components/forms/points-system-modal";
import { DriverLink, TeamLink } from "@/components/profile/entity-link";
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
    count?: number;
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
                {count != null && <p className="text-sm font-semibold text-primary">{count}</p>}
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

type DriverStandingRow = {
    driver_id: string | null;
    position: number | null;
    points: number | null;
    wins: number | null;
    podiums: number | null;
    poles: number | null;
    first_name: string | null;
    last_name: string | null;
    person_id: string | null;
    team_name: string | null;
    team_color: string | null;
    team_identity_id: string | null;
};

const driverStandingColumns = {
    pos: (r: DriverStandingRow) => r.position,
    pilote: (r: DriverStandingRow) => `${r.first_name ?? ""} ${r.last_name ?? ""}`,
    pts: (r: DriverStandingRow) => r.points,
    v: (r: DriverStandingRow) => r.wins,
    p: (r: DriverStandingRow) => r.podiums,
    pp: (r: DriverStandingRow) => r.poles,
};

function DriverStandingsSection({
    standings,
    leaderPoints,
}: {
    standings: DriverStandingRow[];
    leaderPoints: number;
}) {
    const top10 = standings.slice(0, 10);
    const hasMore = standings.length > 10;

    const { sortDescriptor, onSortChange, sortedItems } =
        useTableSort(top10, driverStandingColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const selectedCount = getSelectedCount(selectedKeys, top10.length);

    return (
        <TableCard.Root>
            {selectedCount > 0 ? (
                <TableSelectionBar
                    count={selectedCount}
                    onClearSelection={() => setSelectedKeys(new Set())}
                />
            ) : (
                <TableCard.Header
                    title="Classement pilotes"
                    badge={String(standings.length)}
                />
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
                    <Table.Head id="pos" label="#" isRowHeader allowsSorting />
                    <Table.Head id="pilote" label="Pilote" allowsSorting />
                    <Table.Head id="pts" label="Pts" allowsSorting />
                    <Table.Head id="v" label="V" allowsSorting />
                    <Table.Head id="p" label="P" allowsSorting />
                    <Table.Head id="pp" label="PP" allowsSorting />
                    <Table.Head label="Ecart" />
                </Table.Header>
                <Table.Body items={sortedItems}>
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
                                        {row.person_id ? (
                                            <DriverLink personId={row.person_id}>
                                                {row.first_name} {row.last_name}
                                            </DriverLink>
                                        ) : (
                                            <span className="text-sm font-medium text-primary">
                                                {row.first_name} {row.last_name}
                                            </span>
                                        )}
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

type ConstructorStandingRow = {
    team_id: string | null;
    position: number | null;
    points: number | null;
    wins: number | null;
    podiums: number | null;
    poles: number | null;
    team_name: string | null;
    team_color: string | null;
    team_identity_id: string | null;
};

const constructorStandingColumns = {
    pos: (r: ConstructorStandingRow) => r.position,
    equipe: (r: ConstructorStandingRow) => r.team_name,
    pts: (r: ConstructorStandingRow) => r.points,
    v: (r: ConstructorStandingRow) => r.wins,
    p: (r: ConstructorStandingRow) => r.podiums,
    pp: (r: ConstructorStandingRow) => r.poles,
};

function ConstructorStandingsSection({
    standings,
    leaderPoints,
}: {
    standings: ConstructorStandingRow[];
    leaderPoints: number;
}) {
    const { sortDescriptor, onSortChange, sortedItems } =
        useTableSort(standings, constructorStandingColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const selectedCount = getSelectedCount(selectedKeys, standings.length);

    return (
        <TableCard.Root>
            {selectedCount > 0 ? (
                <TableSelectionBar
                    count={selectedCount}
                    onClearSelection={() => setSelectedKeys(new Set())}
                />
            ) : (
                <TableCard.Header
                    title="Classement constructeurs"
                    badge={String(standings.length)}
                />
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
                    <Table.Head id="pos" label="#" isRowHeader allowsSorting />
                    <Table.Head id="equipe" label="Equipe" allowsSorting />
                    <Table.Head id="pts" label="Pts" allowsSorting />
                    <Table.Head id="v" label="V" allowsSorting />
                    <Table.Head id="p" label="P" allowsSorting />
                    <Table.Head id="pp" label="PP" allowsSorting />
                    <Table.Head label="Ecart" />
                </Table.Header>
                <Table.Body items={sortedItems}>
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
                                    {row.team_identity_id ? (
                                        <TeamLink teamIdentityId={row.team_identity_id} color={row.team_color}>
                                            {row.team_name}
                                        </TeamLink>
                                    ) : (
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
                                    )}
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
        related_driver_ids: string[] | null;
        related_team_ids: string[] | null;
    }[];
}) {
    // Collect all unique driver/team IDs across all arcs
    const { allDriverIds, allTeamIds } = useMemo(() => {
        const driverSet = new Set<string>();
        const teamSet = new Set<string>();
        for (const arc of arcs) {
            for (const id of arc.related_driver_ids ?? []) driverSet.add(id);
            for (const id of arc.related_team_ids ?? []) teamSet.add(id);
        }
        return {
            allDriverIds: [...driverSet],
            allTeamIds: [...teamSet],
        };
    }, [arcs]);

    const { data: entities } = useArcRelatedEntities(allDriverIds, allTeamIds);

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
                    const drivers = (arc.related_driver_ids ?? [])
                        .map((id) => entities?.drivers.get(id))
                        .filter((d): d is NonNullable<typeof d> => !!d);
                    const teams = (arc.related_team_ids ?? [])
                        .map((id) => entities?.teams.get(id))
                        .filter((t): t is NonNullable<typeof t> => !!t);

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

                            {/* Related entities */}
                            {(drivers.length > 0 || teams.length > 0) && (
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    {drivers.map((d) => (
                                        <DriverLink key={d.driverId} personId={d.personId} className="text-xs">
                                            {d.firstName} {d.lastName}
                                        </DriverLink>
                                    ))}
                                    {teams.map((t) => (
                                        <TeamLink key={t.teamId} teamIdentityId={t.teamIdentityId} color={t.colorPrimary} className="text-xs">
                                            {t.name}
                                        </TeamLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── PreSeasonChecklist ─────────────────────────────────────────────────────

function PreSeasonChecklist({
    seasonId,
    engineSuppliersCount,
    teamsCount,
    driversCount,
    carsCount,
    calendarCount,
    predictionsCount,
}: {
    seasonId: string;
    engineSuppliersCount: number;
    teamsCount: number;
    driversCount: number;
    carsCount: number;
    calendarCount: number;
    predictionsCount: number;
}) {
    const items = [
        { label: "Motoristes", count: engineSuppliersCount, required: 1, href: `/season/${seasonId}/engine-suppliers` },
        { label: "Equipes", count: teamsCount, required: 2, href: `/season/${seasonId}/teams` },
        { label: "Pilotes", count: driversCount, required: 2, href: `/season/${seasonId}/drivers` },
        { label: "Voitures", count: carsCount, required: 1, href: `/season/${seasonId}/cars` },
        { label: "Calendrier", count: calendarCount, required: 1, href: `/season/${seasonId}/calendar` },
        { label: "Predictions", count: predictionsCount, required: 1, href: `/season/${seasonId}/predictions` },
    ];

    const allReady = items.every((item) => item.count >= item.required);

    return (
        <div className="mt-6 rounded-xl border border-secondary p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-md font-semibold text-primary">Checklist pre-saison</h3>
                {allReady ? (
                    <Badge size="sm" color="success" type="pill-color">Pret</Badge>
                ) : (
                    <Badge size="sm" color="warning" type="pill-color">Incomplet</Badge>
                )}
            </div>
            <div className="flex flex-col gap-2">
                {items.map((item) => {
                    const done = item.count >= item.required;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition duration-100 ease-linear hover:bg-primary_hover"
                        >
                            {done ? (
                                <CheckCircle className="size-4 shrink-0 text-fg-success-primary" />
                            ) : (
                                <div className="size-4 shrink-0 rounded-full border-2 border-tertiary" />
                            )}
                            <span className={`text-sm ${done ? "text-tertiary" : "font-medium text-primary"}`}>
                                {item.label}
                            </span>
                            <span className="ml-auto text-xs text-tertiary">
                                {item.count}/{item.required}
                            </span>
                        </Link>
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
    const { data: engineSuppliers } = useEngineSuppliers(seasonId);
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

    // ─── News auto-modal ────────────────────────────────────────────────
    const lastCompletedRound = useMemo(() => {
        const entries = calendar ?? [];
        const completed = entries.filter((e) => e.status === "completed");
        if (completed.length === 0) return null;
        return Math.max(...completed.map((e) => e.round_number));
    }, [calendar]);

    const hasNewsForLastRound = useMemo(() => {
        if (lastCompletedRound == null || !newsData) return true;
        return newsData.some((n) => n.after_round === lastCompletedRound);
    }, [lastCompletedRound, newsData]);

    const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const resetSeason = useResetSeason();
    const [newsModalDismissed, setNewsModalDismissed] = useState<Set<number>>(new Set());
    const showNewsModal =
        lastCompletedRound != null &&
        !hasNewsForLastRound &&
        !newsModalDismissed.has(lastCompletedRound);

    if (seasonLoading || calendarLoading) return <PageLoading label="Chargement de la saison..." />;

    if (seasonError || !season) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger cette saison."
                backHref="/universe"
                backLabel="Retour aux univers"
            />
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    const seasonStatus = (season.status ?? "preparation") as SeasonStatus;

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Univers", href: `/universe/${season.universe_id}` },
                        { label: `Saison ${season.year}` },
                    ]}
                />
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
                <div className="flex items-center gap-3">
                    {completedCount > 0 && (
                        <Button
                            size="sm"
                            color="tertiary-destructive"
                            iconLeading={RefreshCcw01}
                            onClick={() => setIsResetModalOpen(true)}
                        >
                            Reinitialiser
                        </Button>
                    )}
                    <Button
                        size="sm"
                        color="secondary"
                        onClick={() => setIsPointsModalOpen(true)}
                    >
                        Bareme
                    </Button>
                    <BadgeWithDot
                        size="md"
                        color={statusColor[seasonStatus]}
                        type="pill-color"
                    >
                        {statusLabel[seasonStatus]}
                    </BadgeWithDot>
                </div>
            </div>

            {/* Nav cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <NavCard
                    href={`/season/${seasonId}/calendar`}
                    icon={Calendar}
                    label="Grand Prix"
                    count={totalCount}
                />
                <NavCard
                    href={`/season/${seasonId}/engine-suppliers`}
                    icon={Tool01}
                    label={`Motoriste${(engineSuppliers?.length ?? 0) !== 1 ? "s" : ""}`}
                    count={engineSuppliers?.length ?? 0}
                />
                <NavCard
                    href={`/season/${seasonId}/teams`}
                    icon={Users01}
                    label={`Equipe${(teams?.length ?? 0) !== 1 ? "s" : ""}`}
                    count={teams?.length ?? 0}
                />
                <NavCard
                    href={`/season/${seasonId}/drivers`}
                    icon={User01}
                    label={`Pilote${(drivers?.length ?? 0) !== 1 ? "s" : ""}`}
                    count={drivers?.length ?? 0}
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
                <NavCard
                    href={`/season/${seasonId}/staff`}
                    icon={Users01}
                    label="Staff"
                />
            </div>

            {/* Pre-season checklist (only in preparation) */}
            {seasonStatus === "preparation" && (
                <PreSeasonChecklist
                    seasonId={seasonId}
                    engineSuppliersCount={engineSuppliers?.length ?? 0}
                    teamsCount={teams?.length ?? 0}
                    driversCount={drivers?.length ?? 0}
                    carsCount={cars?.length ?? 0}
                    calendarCount={totalCount}
                    predictionsCount={driverPredictions?.length ?? 0}
                />
            )}

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

            {/* Reset season modal */}
            <DialogTrigger isOpen={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                <ModalOverlay>
                    <Modal className="max-w-md">
                        <Dialog>
                            <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                                <div className="mb-5 flex items-start gap-4">
                                    <FeaturedIcon
                                        icon={AlertTriangle}
                                        color="warning"
                                        theme="light"
                                        size="md"
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold text-primary">
                                            Reinitialiser la saison
                                        </h2>
                                        <p className="mt-1 text-sm text-tertiary">
                                            Tous les resultats de course, qualifications et classements
                                            seront supprimes. Le calendrier, les pilotes, les ecuries
                                            et les news seront conserves.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        onClick={() => setIsResetModalOpen(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        size="sm"
                                        color="primary-destructive"
                                        isLoading={resetSeason.isPending}
                                        onClick={() => {
                                            resetSeason.mutate(
                                                { seasonId },
                                                { onSuccess: () => setIsResetModalOpen(false) },
                                            );
                                        }}
                                    >
                                        Reinitialiser
                                    </Button>
                                </div>
                            </div>
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>

            {/* Points system modal */}
            <PointsSystemModal
                seasonId={seasonId}
                universeId={season.universe_id}
                isOpen={isPointsModalOpen}
                onOpenChange={setIsPointsModalOpen}
            />

            {/* News auto-modal */}
            {showNewsModal && lastCompletedRound != null && (
                <DialogTrigger
                    isOpen={showNewsModal}
                    onOpenChange={(open) => {
                        if (!open) {
                            setNewsModalDismissed((prev) => {
                                const next = new Set(prev);
                                next.add(lastCompletedRound);
                                return next;
                            });
                        }
                    }}
                >
                    <ModalOverlay>
                        <Modal className="max-w-2xl">
                            <Dialog>
                                <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                                    <div className="mb-5 flex items-start gap-4">
                                        <FeaturedIcon
                                            icon={File06}
                                            color="brand"
                                            theme="light"
                                            size="md"
                                        />
                                        <div>
                                            <h2 className="text-lg font-semibold text-primary">
                                                News apres le GP {lastCompletedRound}
                                            </h2>
                                            <p className="mt-1 text-sm text-tertiary">
                                                Aucune news pour ce round. Ajoutez-en une maintenant.
                                            </p>
                                        </div>
                                    </div>
                                    <NewsForm
                                        seasonId={seasonId}
                                        universeId={season.universe_id}
                                        defaultAfterRound={lastCompletedRound}
                                        onSuccess={() => {
                                            setNewsModalDismissed((prev) => {
                                                const next = new Set(prev);
                                                next.add(lastCompletedRound);
                                                return next;
                                            });
                                        }}
                                        onCancel={() => {
                                            setNewsModalDismissed((prev) => {
                                                const next = new Set(prev);
                                                next.add(lastCompletedRound);
                                                return next;
                                            });
                                        }}
                                    />
                                </div>
                            </Dialog>
                        </Modal>
                    </ModalOverlay>
                </DialogTrigger>
            )}
        </div>
    );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    GridList as AriaGridList,
    GridListItem as AriaGridListItem,
    useDragAndDrop,
} from "react-aria-components";
import {
    AlertCircle,
    CheckCircle,
    CloudRaining01,
    DotsGrid,
    RefreshCw05,
    Zap,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useRace, useQualifying } from "@/hooks/use-qualifying";
import { useDrivers } from "@/hooks/use-drivers";
import { useTeams } from "@/hooks/use-teams";
import { useSeason } from "@/hooks/use-seasons";
import {
    useRaceResults,
    usePointsSystemForSeason,
    useSaveRaceResults,
    type DnfInfo,
} from "@/hooks/use-race-results";
import { buildPointsMap, calculateDriverPoints } from "@/lib/calculations/points";
import { DriverLink } from "@/components/profile/entity-link";
import { cx } from "@/utils/cx";
import type { DriverWithEffective, TeamWithBudget, WeatherType, ResultStatus } from "@/types";

// ─── Constants ──────────────────────────────────────────────────────────────

const WEATHER_ITEMS = [
    { id: "dry", label: "Sec" },
    { id: "wet", label: "Pluie" },
    { id: "mixed", label: "Mixte" },
];

const DNF_STATUS_ITEMS = [
    { id: "dnf_mechanical", label: "Mecanique" },
    { id: "dnf_crash", label: "Crash" },
    { id: "dnf_other", label: "Autre" },
];

// ─── Rain badge ─────────────────────────────────────────────────────────────

function RainBadge({ probability }: { probability: number | null }) {
    const value = probability ?? 0;
    let color: "gray" | "blue" | "warning" | "error" = "gray";
    let label = "Sec";
    if (value >= 50) { color = "error"; label = "50%"; }
    else if (value >= 25) { color = "warning"; label = "25%"; }
    else if (value >= 10) { color = "blue"; label = "10%"; }

    return (
        <Badge size="sm" color={color} type="pill-color">
            <CloudRaining01 className="size-3" aria-hidden="true" />
            {label}
        </Badge>
    );
}

// ─── DNF row ────────────────────────────────────────────────────────────────

function DnfRow({
    driver,
    teamColor,
    info,
    onChangeStatus,
    onChangeReason,
    onRestore,
}: {
    driver: DriverWithEffective;
    teamColor: string | null;
    info: DnfInfo;
    onChangeStatus: (status: ResultStatus) => void;
    onChangeReason: (reason: string) => void;
    onRestore: () => void;
}) {
    return (
        <div className="flex w-full items-center gap-3 px-4 py-2.5">
            {/* Team color dot + name */}
            <div className="flex min-w-0 items-center gap-2">
                <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: teamColor ?? "#94a3b8" }}
                    aria-hidden="true"
                />
                {driver.person_id ? (
                    <DriverLink personId={driver.person_id} className="truncate">
                        {driver.full_name}
                    </DriverLink>
                ) : (
                    <span className="truncate text-sm font-medium text-primary">
                        {driver.full_name}
                    </span>
                )}
            </div>

            {/* DNF type select */}
            <div className="w-36 shrink-0">
                <Select
                    size="sm"
                    placeholder="Type"
                    items={DNF_STATUS_ITEMS}
                    selectedKey={info.status}
                    onSelectionChange={(key) => onChangeStatus(key as ResultStatus)}
                    aria-label={`Type d'abandon pour ${driver.full_name}`}
                >
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
            </div>

            {/* Reason input */}
            <div className="min-w-0 flex-1">
                <Input
                    size="sm"
                    placeholder="Raison..."
                    value={info.reason}
                    onChange={(v) => onChangeReason(v)}
                    aria-label={`Raison d'abandon pour ${driver.full_name}`}
                />
            </div>

            {/* Restore button */}
            <Button
                size="sm"
                color="secondary"
                iconLeading={RefreshCw05}
                onClick={onRestore}
                aria-label={`Remettre ${driver.full_name} dans le classement`}
            >
                Remettre
            </Button>
        </div>
    );
}

// ─── Types ──────────────────────────────────────────────────────────────────

type RaceWithCircuit = {
    id: string;
    season_id: string;
    circuit_id: string;
    round_number: number;
    rain_probability: number | null;
    status: string | null;
    weather: string | null;
    notable_events: string | null;
    circuit: {
        id: string;
        name: string | null;
        country: string | null;
        flag_emoji: string | null;
        circuit_type: string | null;
        [key: string]: unknown;
    } | null;
    [key: string]: unknown;
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RaceResultsPage() {
    const params = useParams<{ id: string; raceId: string }>();
    const router = useRouter();
    const seasonId = params.id;
    const raceId = params.raceId;

    // ─── Data fetching ──────────────────────────────────────────────────────

    const { data: raceRaw, isLoading: raceLoading, error: raceError } = useRace(raceId);
    const { data: qualifyingData, isLoading: qualifyingLoading } = useQualifying(raceId);
    const { data: existingResults, isLoading: resultsLoading } = useRaceResults(raceId);
    const { data: driversRaw, isLoading: driversLoading } = useDrivers(seasonId);
    const { data: teamsRaw } = useTeams(seasonId);
    const { data: season } = useSeason(seasonId);
    const { data: pointsData } = usePointsSystemForSeason(seasonId, season?.universe_id);
    const pointsSystemRows = pointsData?.rows;
    const saveRaceResults = useSaveRaceResults();

    const race = raceRaw as RaceWithCircuit | undefined;
    const drivers = driversRaw as DriverWithEffective[] | undefined;
    const teams = teamsRaw as TeamWithBudget[] | undefined;

    // ─── Local state ────────────────────────────────────────────────────────

    const [finishOrder, setFinishOrder] = useState<string[]>([]);
    const [dnfMap, setDnfMap] = useState<Map<string, DnfInfo>>(new Map());
    const [fastestLapDriverId, setFastestLapDriverId] = useState<string | null>(null);
    const [weather, setWeather] = useState<WeatherType>("dry");
    const [notableEvents, setNotableEvents] = useState("");
    const [initialized, setInitialized] = useState(false);

    // ─── Initialize ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (initialized) return;
        if (qualifyingLoading || resultsLoading) return;

        if (existingResults && existingResults.length > 0) {
            // Edit mode: restore from existing results
            const classified = existingResults
                .filter((r) => r.finish_position != null)
                .sort((a, b) => (a.finish_position ?? 0) - (b.finish_position ?? 0))
                .map((r) => r.driver_id);
            setFinishOrder(classified);

            const dnfs = new Map<string, DnfInfo>();
            for (const r of existingResults) {
                if (r.finish_position == null) {
                    dnfs.set(r.driver_id, {
                        status: (r.status as ResultStatus) ?? "dnf_mechanical",
                        reason: r.dnf_reason ?? "",
                    });
                }
            }
            setDnfMap(dnfs);

            const fastest = existingResults.find((r) => r.fastest_lap);
            setFastestLapDriverId(fastest?.driver_id ?? null);

            // Restore weather & events from race
            if (race?.weather) setWeather(race.weather as WeatherType);
            if (race?.notable_events) setNotableEvents(race.notable_events);
        } else if (qualifyingData && qualifyingData.length > 0) {
            // Fresh mode: initialize from qualifying grid
            const sorted = [...qualifyingData].sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0),
            );
            setFinishOrder(sorted.map((r) => r.driver_id));
        }
        setInitialized(true);
    }, [initialized, qualifyingLoading, resultsLoading, qualifyingData, existingResults, race]);

    // ─── Derived state ──────────────────────────────────────────────────────

    const teamColorMap = useMemo(() => {
        const map = new Map<string, string | null>();
        teams?.forEach((t) => {
            if (t.id) map.set(t.id, t.color_primary);
        });
        return map;
    }, [teams]);

    const driverMap = useMemo(() => {
        const map = new Map<string, DriverWithEffective>();
        drivers?.forEach((d) => {
            if (d.id) map.set(d.id, d);
        });
        return map;
    }, [drivers]);

    const driverTeamMap = useMemo(() => {
        const map = new Map<string, string>();
        drivers?.forEach((d) => {
            if (d.id && d.team_id) map.set(d.id, d.team_id);
        });
        return map;
    }, [drivers]);

    const gridPositionMap = useMemo(() => {
        const map = new Map<string, number>();
        if (qualifyingData) {
            const sorted = [...qualifyingData].sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0),
            );
            sorted.forEach((r, i) => map.set(r.driver_id, i + 1));
        }
        return map;
    }, [qualifyingData]);

    const pointsMap = useMemo(() => {
        if (!pointsSystemRows) return new Map<number, number>();
        return buildPointsMap(pointsSystemRows);
    }, [pointsSystemRows]);

    const finishDrivers = useMemo(
        () =>
            finishOrder
                .map((id) => driverMap.get(id))
                .filter((d): d is DriverWithEffective => d != null),
        [finishOrder, driverMap],
    );

    const dnfDrivers = useMemo(
        () =>
            [...dnfMap.keys()]
                .map((id) => ({ driver: driverMap.get(id), id }))
                .filter(
                    (d): d is { driver: DriverWithEffective; id: string } =>
                        d.driver != null,
                ),
        [dnfMap, driverMap],
    );

    // ─── Drag & drop ────────────────────────────────────────────────────────

    const { dragAndDropHooks } = useDragAndDrop({
        getItems: (keys) =>
            [...keys].map((key) => ({ "text/plain": String(key) })),
        onReorder(e) {
            setFinishOrder((prev) => {
                const items = [...prev];
                const movedKeys = [...e.keys] as string[];
                const movedItems = items.filter((id) => movedKeys.includes(id));
                const remaining = items.filter((id) => !movedKeys.includes(id));
                let targetIndex = remaining.findIndex((id) => id === e.target.key);
                if (e.target.dropPosition === "after") targetIndex += 1;
                remaining.splice(targetIndex, 0, ...movedItems);
                return remaining;
            });
        },
    });

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleDnf = (driverId: string) => {
        setFinishOrder((prev) => prev.filter((id) => id !== driverId));
        setDnfMap((prev) => {
            const next = new Map(prev);
            next.set(driverId, { status: "dnf_mechanical", reason: "" });
            return next;
        });
        if (fastestLapDriverId === driverId) setFastestLapDriverId(null);
    };

    const handleRestore = (driverId: string) => {
        setDnfMap((prev) => {
            const next = new Map(prev);
            next.delete(driverId);
            return next;
        });
        setFinishOrder((prev) => [...prev, driverId]);
    };

    const handleDnfStatusChange = (driverId: string, status: ResultStatus) => {
        setDnfMap((prev) => {
            const next = new Map(prev);
            const info = next.get(driverId);
            if (info) next.set(driverId, { ...info, status });
            return next;
        });
    };

    const handleDnfReasonChange = (driverId: string, reason: string) => {
        setDnfMap((prev) => {
            const next = new Map(prev);
            const info = next.get(driverId);
            if (info) next.set(driverId, { ...info, reason });
            return next;
        });
    };

    const handleToggleFastestLap = (driverId: string) => {
        setFastestLapDriverId((prev) => (prev === driverId ? null : driverId));
    };

    const canSave =
        initialized &&
        finishOrder.length + dnfMap.size > 0 &&
        !!pointsSystemRows?.length;

    const handleSave = () => {
        if (!canSave || !race || !pointsSystemRows) return;

        saveRaceResults.mutate(
            {
                raceId,
                seasonId,
                universeId: season?.universe_id ?? "",
                roundNumber: race.round_number,
                finishOrder,
                gridPositionMap,
                dnfMap,
                fastestLapDriverId,
                weather,
                notableEvents,
                pointsSystemRows,
                driverTeamMap,
            },
            { onSuccess: () => router.push(`/season/${seasonId}`) },
        );
    };

    if (raceLoading || driversLoading || qualifyingLoading || resultsLoading) return <PageLoading label="Chargement des resultats..." />;

    if (raceError || !race) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les donnees de cette course."
                backHref={`/season/${seasonId}/calendar`}
                backLabel="Retour au calendrier"
            />
        );
    }

    // ─── Qualifying guard (skip if editing existing results) ─────────────

    const isEditMode = existingResults && existingResults.length > 0;
    const hasQualifying = qualifyingData && qualifyingData.length > 0;

    if (!isEditMode && !hasQualifying) {
        return (
            <div>
                <div className="mb-6">
                    <Breadcrumbs
                        items={[
                            { label: "Saison", href: `/season/${seasonId}` },
                            { label: "Course" },
                            { label: "Resultats" },
                        ]}
                    />
                </div>
                <div className="flex min-h-60 flex-col items-center justify-center gap-4">
                    <FeaturedIcon icon={AlertCircle} color="warning" theme="light" size="lg" />
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-primary">
                            Qualifications requises
                        </h2>
                        <p className="mt-1 text-sm text-tertiary">
                            Vous devez d&apos;abord saisir les qualifications avant de rentrer les resultats.
                        </p>
                    </div>
                    <Button
                        href={`/season/${seasonId}/race/${raceId}/qualifying`}
                        size="md"
                        color="primary"
                    >
                        Aller aux qualifications
                    </Button>
                </div>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    const circuit = race.circuit;

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Saison", href: `/season/${seasonId}` },
                        { label: `GP ${race.round_number} — ${circuit?.flag_emoji ?? ""} ${circuit?.name ?? "Circuit"}`, href: `/season/${seasonId}/race/${raceId}/qualifying` },
                        { label: "Resultats" },
                    ]}
                />
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        {circuit?.flag_emoji ?? ""} {circuit?.name ?? "Circuit inconnu"}
                    </h1>
                    <div className="mt-1 flex items-center gap-2 text-sm text-tertiary">
                        <span>Manche {race.round_number}</span>
                        <span aria-hidden="true">&middot;</span>
                        <RainBadge probability={race.rain_probability} />
                    </div>
                </div>
                <Button
                    size="md"
                    color="primary"
                    iconLeading={CheckCircle}
                    isDisabled={!canSave}
                    isLoading={saveRaceResults.isPending}
                    onClick={handleSave}
                >
                    Valider les resultats
                </Button>
            </div>

            {/* Race conditions */}
            <div className="mt-6 rounded-xl border border-secondary p-4">
                <h2 className="mb-3 text-sm font-semibold text-secondary">
                    Conditions de course
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Select
                        label="Meteo"
                        size="sm"
                        items={WEATHER_ITEMS}
                        selectedKey={weather}
                        onSelectionChange={(key) => setWeather(key as WeatherType)}
                    >
                        {(item) => (
                            <Select.Item id={item.id}>{item.label}</Select.Item>
                        )}
                    </Select>
                    <TextArea
                        label="Evenements notables"
                        placeholder="Accidents, safety car, drapeaux rouges..."
                        value={notableEvents}
                        onChange={setNotableEvents}
                        rows={2}
                    />
                </div>
            </div>

            {/* Classification */}
            <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-secondary">
                    Classement ({finishOrder.length} classes
                    {dnfMap.size > 0 && ` / ${dnfMap.size} abandons`})
                </h2>

                {finishDrivers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-secondary p-6 text-center text-sm text-tertiary">
                        Aucun resultat de qualification disponible. Veuillez d'abord
                        saisir les qualifications.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-secondary">
                        <AriaGridList
                            aria-label="Classement de la course"
                            items={finishDrivers.map((d, i) => ({
                                id: d.id!,
                                driver: d,
                                position: i + 1,
                            }))}
                            dragAndDropHooks={dragAndDropHooks}
                            className="flex flex-col divide-y divide-secondary"
                        >
                            {(item) => {
                                const isFastest =
                                    fastestLapDriverId === item.id;
                                const pts = calculateDriverPoints({
                                    finishPosition: item.position,
                                    isFastestLap: isFastest,
                                    pointsMap,
                                });
                                const teamColor =
                                    teamColorMap.get(
                                        item.driver.team_id ?? "",
                                    ) ?? null;

                                return (
                                    <AriaGridListItem
                                        key={item.id}
                                        id={item.id}
                                        textValue={`P${item.position} ${item.driver.full_name}`}
                                        className="outline-hidden transition duration-100 ease-linear focus-visible:bg-secondary_hover data-[dragging]:opacity-50"
                                    >
                                        <div className="flex w-full items-center gap-3 px-4 py-2.5">
                                            {/* Drag handle */}
                                            <DotsGrid
                                                className="size-5 shrink-0 cursor-grab text-fg-quaternary"
                                                aria-hidden="true"
                                            />

                                            {/* Position badge */}
                                            <Badge
                                                size="sm"
                                                color={
                                                    item.position === 1
                                                        ? "warning"
                                                        : item.position <= 3
                                                          ? "brand"
                                                          : "gray"
                                                }
                                                type="pill-color"
                                            >
                                                P{item.position}
                                            </Badge>

                                            {/* Team color dot + driver name */}
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <span
                                                    className="size-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            teamColor ??
                                                            "#94a3b8",
                                                    }}
                                                    aria-hidden="true"
                                                />
                                                {item.driver.person_id ? (
                                                    <DriverLink personId={item.driver.person_id} className="truncate">
                                                        {item.driver.full_name}
                                                    </DriverLink>
                                                ) : (
                                                    <span className="truncate text-sm font-medium text-primary">
                                                        {item.driver.full_name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Points badge */}
                                            {pts > 0 && (
                                                <Badge
                                                    size="sm"
                                                    color="success"
                                                    type="pill-color"
                                                >
                                                    {pts} pts
                                                </Badge>
                                            )}

                                            {/* Fastest lap toggle */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleFastestLap(
                                                        item.id,
                                                    )
                                                }
                                                className={cx(
                                                    "flex size-8 items-center justify-center rounded-lg transition duration-100 ease-linear",
                                                    isFastest
                                                        ? "bg-brand-secondary text-fg-brand-primary"
                                                        : "text-fg-quaternary hover:bg-primary_hover hover:text-fg-secondary",
                                                )}
                                                aria-label={`Meilleur tour pour ${item.driver.full_name}`}
                                                aria-pressed={isFastest}
                                            >
                                                <Zap className="size-4" />
                                            </button>

                                            {/* DNF button */}
                                            <Button
                                                size="sm"
                                                color="tertiary"
                                                iconLeading={AlertCircle}
                                                onClick={() =>
                                                    handleDnf(item.id)
                                                }
                                                aria-label={`Abandon pour ${item.driver.full_name}`}
                                            >
                                                Abandon
                                            </Button>
                                        </div>
                                    </AriaGridListItem>
                                );
                            }}
                        </AriaGridList>
                    </div>
                )}
            </div>

            {/* DNF section */}
            {dnfDrivers.length > 0 && (
                <div className="mt-6">
                    <h2 className="mb-3 text-sm font-semibold text-secondary">
                        Abandons ({dnfDrivers.length})
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-secondary">
                        <div className="flex flex-col divide-y divide-secondary">
                            {dnfDrivers.map(({ driver, id }) => (
                                <DnfRow
                                    key={id}
                                    driver={driver}
                                    teamColor={
                                        teamColorMap.get(
                                            driver.team_id ?? "",
                                        ) ?? null
                                    }
                                    info={dnfMap.get(id)!}
                                    onChangeStatus={(status) =>
                                        handleDnfStatusChange(id, status)
                                    }
                                    onChangeReason={(reason) =>
                                        handleDnfReasonChange(id, reason)
                                    }
                                    onRestore={() => handleRestore(id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

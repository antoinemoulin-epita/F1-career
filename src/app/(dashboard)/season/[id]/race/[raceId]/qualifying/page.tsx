"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    GridList as AriaGridList,
    GridListItem as AriaGridListItem,
    useDragAndDrop,
} from "react-aria-components";
import {
    CheckCircle,
    CloudRaining01,
    DotsGrid,
    Plus,
    XClose,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useRace, useQualifying, useSaveQualifying } from "@/hooks/use-qualifying";
import { useDrivers } from "@/hooks/use-drivers";
import { useTeams } from "@/hooks/use-teams";
import { DriverLink } from "@/components/profile/entity-link";
import type { DriverWithEffective, TeamWithBudget } from "@/types";

// ─── Rain badge ──────────────────────────────────────────────────────────────

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

// ─── Driver chip (pool) ─────────────────────────────────────────────────────

function DriverChip({
    driver,
    teamColor,
    onClick,
}: {
    driver: DriverWithEffective;
    teamColor: string | null;
    onClick: () => void;
}) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-secondary bg-primary px-3 py-2 text-sm font-medium text-primary transition duration-100 ease-linear hover:bg-primary_hover">
            <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: teamColor ?? "#94a3b8" }}
                aria-hidden="true"
            />
            {driver.person_id ? (
                <DriverLink personId={driver.person_id} className="text-sm font-medium text-primary hover:text-brand-secondary_hover">
                    {driver.full_name}
                </DriverLink>
            ) : (
                <span>{driver.full_name}</span>
            )}
            <button
                type="button"
                onClick={onClick}
                className="ml-auto text-fg-quaternary transition duration-100 ease-linear hover:text-fg-secondary"
                aria-label={`Placer ${driver.full_name}`}
            >
                <Plus className="size-4" />
            </button>
        </div>
    );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type RaceWithCircuit = {
    id: string;
    season_id: string;
    circuit_id: string;
    round_number: number;
    rain_probability: number | null;
    status: string | null;
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function QualifyingPage() {
    const params = useParams<{ id: string; raceId: string }>();
    const router = useRouter();
    const seasonId = params.id;
    const raceId = params.raceId;

    const { data: raceRaw, isLoading: raceLoading, error: raceError } = useRace(raceId);
    const { data: qualifyingData, isLoading: qualifyingLoading } = useQualifying(raceId);
    const { data: driversRaw, isLoading: driversLoading } = useDrivers(seasonId);
    const { data: teamsRaw } = useTeams(seasonId);
    const saveQualifying = useSaveQualifying();

    const race = raceRaw as RaceWithCircuit | undefined;
    const drivers = driversRaw as DriverWithEffective[] | undefined;
    const teams = teamsRaw as TeamWithBudget[] | undefined;

    // Map team_id -> color_primary
    const teamColorMap = useMemo(() => {
        const map = new Map<string, string | null>();
        teams?.forEach((t) => {
            if (t.id) map.set(t.id, t.color_primary);
        });
        return map;
    }, [teams]);

    // ─── Local state ─────────────────────────────────────────────────────────

    const [placedDriverIds, setPlacedDriverIds] = useState<string[]>([]);
    const [initialized, setInitialized] = useState(false);

    // Initialize from existing qualifying data
    useEffect(() => {
        if (initialized) return;
        if (qualifyingLoading) return;

        if (qualifyingData && qualifyingData.length > 0) {
            const sorted = [...qualifyingData].sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0),
            );
            setPlacedDriverIds(sorted.map((r) => r.driver_id));
        }
        setInitialized(true);
    }, [initialized, qualifyingLoading, qualifyingData]);

    // ─── Derived state ───────────────────────────────────────────────────────

    const poolDrivers = useMemo(() => {
        if (!drivers) return [];
        const placedSet = new Set(placedDriverIds);
        return drivers.filter((d) => d.id && !placedSet.has(d.id));
    }, [drivers, placedDriverIds]);

    const allPlaced = drivers != null && drivers.length > 0 && placedDriverIds.length === drivers.length;

    // ─── Drag & drop ─────────────────────────────────────────────────────────

    const { dragAndDropHooks } = useDragAndDrop({
        getItems: (keys) =>
            [...keys].map((key) => ({ "text/plain": String(key) })),
        onReorder(e) {
            setPlacedDriverIds((prev) => {
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

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleAddDriver = (driverId: string) => {
        setPlacedDriverIds((prev) => [...prev, driverId]);
    };

    const handleRemoveDriver = (driverId: string) => {
        setPlacedDriverIds((prev) => prev.filter((id) => id !== driverId));
    };

    const handleSave = () => {
        saveQualifying.mutate(
            { raceId, seasonId, driverIds: placedDriverIds },
            { onSuccess: () => router.push(`/season/${seasonId}`) },
        );
    };

    if (raceLoading || driversLoading || qualifyingLoading) return <PageLoading label="Chargement des qualifications..." />;

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

    // ─── Resolve placed drivers for the grid ─────────────────────────────────

    const driverMap = new Map<string, DriverWithEffective>();
    drivers?.forEach((d) => {
        if (d.id) driverMap.set(d.id, d);
    });

    const placedDrivers = placedDriverIds
        .map((id) => driverMap.get(id))
        .filter((d): d is DriverWithEffective => d != null);

    // ─── Render ──────────────────────────────────────────────────────────────

    const circuit = race.circuit;

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Saison", href: `/season/${seasonId}` },
                        { label: `GP ${race.round_number} — ${circuit?.flag_emoji ?? ""} ${circuit?.name ?? "Circuit"}` },
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
                <div className="flex items-center gap-3">
                    <span className="text-sm text-tertiary">
                        {placedDriverIds.length}/{drivers?.length ?? 0} pilotes places
                    </span>
                    <Button
                        size="md"
                        color="primary"
                        iconLeading={CheckCircle}
                        isDisabled={!allPlaced}
                        isLoading={saveQualifying.isPending}
                        onClick={handleSave}
                    >
                        Valider
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Pool */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold text-secondary">
                        Pilotes disponibles ({poolDrivers.length})
                    </h2>
                    {poolDrivers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-secondary p-6 text-center text-sm text-tertiary">
                            Tous les pilotes ont ete places
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {poolDrivers.map((driver) => (
                                <DriverChip
                                    key={driver.id}
                                    driver={driver}
                                    teamColor={teamColorMap.get(driver.team_id ?? "") ?? null}
                                    onClick={() => handleAddDriver(driver.id!)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold text-secondary">
                        Grille de depart ({placedDriverIds.length})
                    </h2>
                    {placedDrivers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-secondary p-6 text-center text-sm text-tertiary">
                            Cliquez sur un pilote pour le placer sur la grille
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-secondary">
                            <AriaGridList
                                aria-label="Grille de depart"
                                items={placedDrivers.map((d, i) => ({
                                    id: d.id!,
                                    driver: d,
                                    position: i + 1,
                                }))}
                                dragAndDropHooks={dragAndDropHooks}
                                className="flex flex-col divide-y divide-secondary"
                            >
                                {(item) => (
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
                                            <Badge size="sm" color="gray" type="modern">
                                                P{item.position}
                                            </Badge>

                                            {/* Team color dot + driver name */}
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <span
                                                    className="size-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            teamColorMap.get(item.driver.team_id ?? "") ?? "#94a3b8",
                                                    }}
                                                    aria-hidden="true"
                                                />
                                                {item.driver.person_id ? (
                                                    <DriverLink personId={item.driver.person_id} className="truncate text-sm font-medium text-primary hover:text-brand-secondary_hover">
                                                        {item.driver.full_name}
                                                    </DriverLink>
                                                ) : (
                                                    <span className="truncate text-sm font-medium text-primary">
                                                        {item.driver.full_name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Remove button */}
                                            <Button
                                                size="sm"
                                                color="tertiary"
                                                iconLeading={XClose}
                                                onClick={() => handleRemoveDriver(item.driver.id!)}
                                                aria-label={`Retirer ${item.driver.full_name}`}
                                            />
                                        </div>
                                    </AriaGridListItem>
                                )}
                            </AriaGridList>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

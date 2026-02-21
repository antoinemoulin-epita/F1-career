"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    GridList as AriaGridList,
    GridListItem as AriaGridListItem,
    useDragAndDrop,
} from "react-aria-components";
import Link from "next/link";
import {
    CheckCircle,
    CloudRaining01,
    DotsGrid,
    Edit05,
    Flag01,
    Plus,
    Trash01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { CircuitSelector } from "@/components/race/circuit-selector";
import { useCalendar, useAddRace, useRemoveRace, useReorderRaces } from "@/hooks/use-calendar";
import { useCircuits } from "@/hooks/use-circuits";
import { useSeason } from "@/hooks/use-seasons";
import type { Circuit } from "@/types";

// ─── Labels ─────────────────────────────────────────────────────────────────

const circuitTypeLabels: Record<string, string> = {
    high_speed: "Grande vitesse",
    technical: "Technique",
    balanced: "Equilibre",
    street: "Urbain",
};

const circuitTypeBadgeColor: Record<string, "gray" | "brand" | "blue" | "purple"> = {
    high_speed: "blue",
    technical: "purple",
    balanced: "gray",
    street: "brand",
};

// ─── Rain probability display ───────────────────────────────────────────────

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

// ─── AddRaceDialog ──────────────────────────────────────────────────────────

function AddRaceDialog({
    seasonId,
    availableCircuits,
    currentCount,
    gpCount,
}: {
    seasonId: string;
    availableCircuits: Circuit[];
    currentCount: number;
    gpCount: number | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const addRace = useAddRace();

    const remaining = gpCount != null ? gpCount - currentCount : null;
    const isMaxReached = gpCount != null && currentCount >= gpCount;
    const isDisabled = isMaxReached || availableCircuits.length === 0;

    const handleSelect = (circuit: Circuit) => {
        addRace.mutate(
            { seasonId, circuit, currentCount },
            { onSuccess: () => setIsOpen(false) },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus} isDisabled={isDisabled}>
                Ajouter un GP
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Flag01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Ajouter un Grand Prix
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        {currentCount}/{gpCount ?? "∞"} —{" "}
                                        {remaining != null
                                            ? `${remaining} place${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`
                                            : "Pas de limite"}
                                    </p>
                                </div>
                            </div>
                            <CircuitSelector
                                circuits={availableCircuits}
                                onSelect={handleSelect}
                                onCancel={() => setIsOpen(false)}
                            />
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── CalendarItem ───────────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
    scheduled: "Planifie",
    qualifying_done: "Qualifie",
    completed: "Termine",
};

const statusBadgeColor: Record<string, "gray" | "brand" | "success"> = {
    scheduled: "gray",
    qualifying_done: "brand",
    completed: "success",
};

function CalendarItem({
    entry,
    seasonId,
    onRemove,
    isRemoving,
}: {
    entry: CalendarEntryWithCircuit;
    seasonId: string;
    onRemove: () => void;
    isRemoving: boolean;
}) {
    const circuit = entry.circuit;
    const status = entry.status ?? "scheduled";
    const isQualified = status === "qualifying_done" || status === "completed";
    const isCompleted = status === "completed";

    return (
        <div className="flex w-full items-center gap-4 px-4 py-3">
            {/* Drag handle */}
            <DotsGrid
                className="size-5 shrink-0 cursor-grab text-fg-quaternary"
                aria-hidden="true"
            />

            {/* Round number */}
            <div className="shrink-0">
                <Badge size="sm" color="gray" type="modern">
                    GP {entry.round_number}
                </Badge>
            </div>

            {/* Circuit info */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">
                    {circuit?.flag_emoji ?? ""} {circuit?.name ?? "Circuit inconnu"}
                </p>
                <p className="truncate text-sm text-tertiary">
                    {[
                        circuit?.country,
                        circuit?.region_climate,
                    ]
                        .filter(Boolean)
                        .join(" · ")}
                </p>
            </div>

            {/* Status badge */}
            <div className="hidden shrink-0 sm:block">
                <Badge
                    size="sm"
                    color={statusBadgeColor[status] ?? "gray"}
                    type="pill-color"
                >
                    {isCompleted && <CheckCircle className="size-3" aria-hidden="true" />}
                    {statusLabel[status] ?? status}
                </Badge>
            </div>

            {/* Circuit type badge */}
            <div className="hidden shrink-0 sm:block">
                {circuit?.circuit_type && (
                    <Badge
                        size="sm"
                        color={circuitTypeBadgeColor[circuit.circuit_type] ?? "gray"}
                        type="pill-color"
                    >
                        {circuitTypeLabels[circuit.circuit_type] ?? circuit.circuit_type}
                    </Badge>
                )}
            </div>

            {/* Rain probability */}
            <div className="shrink-0">
                <RainBadge probability={entry.rain_probability} />
            </div>

            {/* Action links for qualifying / results */}
            {isQualified && (
                <Link
                    href={`/season/${seasonId}/race/${entry.id}/qualifying`}
                    className="shrink-0"
                >
                    <Button size="sm" color="link-gray" aria-label="Modifier qualifications">
                        Qualifs
                    </Button>
                </Link>
            )}
            {isCompleted && (
                <Link
                    href={`/season/${seasonId}/race/${entry.id}/results`}
                    className="shrink-0"
                >
                    <Button size="sm" color="link-gray" iconLeading={Edit05} aria-label="Modifier resultats">
                        Course
                    </Button>
                </Link>
            )}

            {/* Delete button */}
            <Button
                size="sm"
                color="tertiary"
                iconLeading={Trash01}
                onClick={onRemove}
                isLoading={isRemoving}
                aria-label={`Supprimer GP ${entry.round_number}`}
            />
        </div>
    );
}

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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CalendarPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: calendarRaw, isLoading, error } = useCalendar(seasonId);
    const { data: circuits } = useCircuits();
    const { data: season } = useSeason(seasonId);

    const removeRace = useRemoveRace();
    const reorderRaces = useReorderRaces();

    // Cast calendar data with joined circuit
    const calendar = calendarRaw as CalendarEntryWithCircuit[] | undefined;

    // Available circuits = all circuits minus those already in the calendar
    const availableCircuits = useMemo(() => {
        const usedCircuitIds = new Set(calendar?.map((e) => e.circuit_id) ?? []);
        return (circuits ?? []).filter((c) => !usedCircuitIds.has(c.id));
    }, [circuits, calendar]);

    // Sorted entries for display and D&D
    const calendarItems = useMemo(() => {
        if (!calendar) return [];
        return [...calendar].sort((a, b) => a.round_number - b.round_number);
    }, [calendar]);

    // Drag and drop hooks
    const { dragAndDropHooks } = useDragAndDrop({
        getItems: (keys) =>
            [...keys].map((key) => ({ "text/plain": String(key) })),
        onReorder(e) {
            const entries = [...calendarItems];

            // Find the moved items
            const movedKeys = [...e.keys];
            const movedEntries = entries.filter((entry) => movedKeys.includes(entry.id));
            const remaining = entries.filter((entry) => !movedKeys.includes(entry.id));

            // Find target index
            const targetEntry = entries.find((entry) => entry.id === e.target.key);
            if (!targetEntry) return;

            let targetIndex = remaining.findIndex((entry) => entry.id === e.target.key);

            if (e.target.dropPosition === "after") {
                targetIndex += 1;
            }

            // Insert moved items at target position
            remaining.splice(targetIndex, 0, ...movedEntries);

            const orderedIds = remaining.map((entry) => entry.id);
            reorderRaces.mutate({ seasonId, orderedIds });
        },
    });

    const handleRemove = (entry: CalendarEntryWithCircuit) => {
        const remainingIds = calendarItems
            .filter((e) => e.id !== entry.id)
            .map((e) => e.id);
        removeRace.mutate({ id: entry.id, seasonId, remainingIds });
    };

    const gpCount = season?.gp_count ?? null;
    const currentCount = calendarItems.length;

    // ─── Loading ────────────────────────────────────────────────────────────

    if (isLoading) {
        return <PageLoading label="Chargement du calendrier..." />;
    }

    // ─── Error ──────────────────────────────────────────────────────────────

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger le calendrier de cette saison."
                backHref={`/season/${seasonId}`}
                backLabel="Retour a la saison"
            />
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Saison", href: `/season/${seasonId}` },
                    { label: "Calendrier" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Calendrier
                    </h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {currentCount}/{gpCount ?? "∞"} Grand{currentCount !== 1 ? "s" : ""} Prix
                    </p>
                </div>
                <AddRaceDialog
                    seasonId={seasonId}
                    availableCircuits={availableCircuits}
                    currentCount={currentCount}
                    gpCount={gpCount}
                />
            </div>

            {/* Content */}
            <div className="mt-6">
                {calendarItems.length === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Flag01}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Aucun Grand Prix</EmptyState.Title>
                                <EmptyState.Description>
                                    Ajoutez votre premier Grand Prix pour construire le calendrier.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <AddRaceDialog
                                    seasonId={seasonId}
                                    availableCircuits={availableCircuits}
                                    currentCount={currentCount}
                                    gpCount={gpCount}
                                />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-secondary">
                        <AriaGridList
                            aria-label="Calendrier de la saison"
                            items={calendarItems}
                            dragAndDropHooks={dragAndDropHooks}
                            className="flex flex-col divide-y divide-secondary"
                        >
                            {(entry) => (
                                <AriaGridListItem
                                    key={entry.id}
                                    id={entry.id}
                                    textValue={`GP ${entry.round_number} ${entry.circuit?.name ?? ""}`}
                                    className="outline-hidden transition duration-100 ease-linear focus-visible:bg-secondary_hover data-[dragging]:opacity-50"
                                >
                                    <CalendarItem
                                        entry={entry}
                                        seasonId={seasonId}
                                        onRemove={() => handleRemove(entry)}
                                        isRemoving={
                                            removeRace.isPending &&
                                            removeRace.variables?.id === entry.id
                                        }
                                    />
                                </AriaGridListItem>
                            )}
                        </AriaGridList>
                    </div>
                )}
            </div>
        </div>
    );
}

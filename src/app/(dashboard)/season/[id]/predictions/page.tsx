"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Lock01,
    RefreshCw01,
    Target04,
    Zap,
} from "@untitledui/icons";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useSeason } from "@/hooks/use-seasons";
import { useCars } from "@/hooks/use-cars";
import {
    useDriverPredictions,
    useConstructorPredictions,
    useGeneratePredictions,
    useLockPredictions,
} from "@/hooks/use-predictions";

// ─── LockConfirmDialog ──────────────────────────────────────────────────────

function LockConfirmDialog({
    seasonId,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const lockPredictions = useLockPredictions();

    const handleLock = () => {
        lockPredictions.mutate(
            { seasonId },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-md">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5">
                                <FeaturedIcon
                                    icon={Lock01}
                                    color="warning"
                                    theme="light"
                                    size="md"
                                />
                            </div>
                            <h2 className="text-lg font-semibold text-primary">
                                Verrouiller les predictions
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Une fois verrouillees, les predictions ne pourront
                                plus etre modifiees. Cette action est irreversible.
                            </p>
                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    size="md"
                                    color="secondary"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="md"
                                    color="primary"
                                    onClick={handleLock}
                                    isLoading={lockPredictions.isPending}
                                >
                                    Verrouiller
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── DriverPredictionsTable ─────────────────────────────────────────────────

function DriverPredictionsTable({
    predictions,
}: {
    predictions: {
        id: string;
        predicted_position: number;
        score: number | null;
        driver: {
            full_name: string | null;
            effective_note: number | null;
            team_id: string | null;
            color_primary?: string | null;
        } | null;
    }[];
}) {
    return (
        <TableCard.Root>
            <TableCard.Header
                title="Classement pilotes predit"
                badge={String(predictions.length)}
            />
            <Table>
                <Table.Header>
                    <Table.Head label="#" isRowHeader />
                    <Table.Head label="Pilote" />
                    <Table.Head label="Note" />
                    <Table.Head label="Voiture" />
                    <Table.Head label="Score" />
                </Table.Header>
                <Table.Body items={predictions}>
                    {(row) => {
                        const pos = row.predicted_position;
                        const score = Number(row.score ?? 0);
                        const effectiveNote = row.driver?.effective_note ?? 0;
                        const carContrib = score - effectiveNote;
                        const badgeColor =
                            pos === 1
                                ? "warning"
                                : pos <= 3
                                  ? "brand"
                                  : "gray";

                        return (
                            <Table.Row id={row.id}>
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
                                    <span className="text-sm font-medium text-primary">
                                        {row.driver?.full_name ?? "—"}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {effectiveNote}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {carContrib}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-semibold text-primary">
                                        {score}
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

// ─── ConstructorPredictionsTable ────────────────────────────────────────────

function ConstructorPredictionsTable({
    predictions,
    carTotalMap,
}: {
    predictions: {
        id: string;
        predicted_position: number;
        score: number | null;
        team: {
            id: string | null;
            name: string | null;
            color_primary: string | null;
        } | null;
    }[];
    carTotalMap: Map<string, number>;
}) {
    return (
        <TableCard.Root>
            <TableCard.Header
                title="Classement constructeurs predit"
                badge={String(predictions.length)}
            />
            <Table>
                <Table.Header>
                    <Table.Head label="#" isRowHeader />
                    <Table.Head label="Equipe" />
                    <Table.Head label="Total voiture" />
                    <Table.Head label="Moy. pilotes" />
                    <Table.Head label="Score" />
                </Table.Header>
                <Table.Body items={predictions}>
                    {(row) => {
                        const pos = row.predicted_position;
                        const score = Number(row.score ?? 0);
                        const teamId = row.team?.id ?? "";
                        const carTotal = carTotalMap.get(teamId) ?? 0;
                        const avgDriverNote = Math.round((score - carTotal) * 10) / 10;
                        const badgeColor =
                            pos === 1
                                ? "warning"
                                : pos <= 3
                                  ? "brand"
                                  : "gray";

                        return (
                            <Table.Row id={row.id}>
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
                                        {row.team?.color_primary && (
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        row.team.color_primary,
                                                }}
                                            />
                                        )}
                                        <span className="text-sm font-medium text-primary">
                                            {row.team?.name ?? "—"}
                                        </span>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {carTotal}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">
                                        {avgDriverNote}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-semibold text-primary">
                                        {Math.round(score * 10) / 10}
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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PredictionsPage() {
    const seasonId = useParams<{ id: string }>().id;

    const { data: season, isLoading: seasonLoading, error: seasonError } = useSeason(seasonId);
    const { data: driverPredictions, isLoading: driversLoading } = useDriverPredictions(seasonId);
    const { data: constructorPredictions } = useConstructorPredictions(seasonId);
    const { data: cars } = useCars(seasonId);
    const generatePredictions = useGeneratePredictions();

    const [lockDialogOpen, setLockDialogOpen] = useState(false);

    // ─── Derived state ──────────────────────────────────────────────────────

    const isLocked = season?.predictions_locked === true;
    const hasPredictions = (driverPredictions?.length ?? 0) > 0;

    const carTotalMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const car of cars ?? []) {
            if (car.team_id) {
                map.set(car.team_id, car.total ?? 0);
            }
        }
        return map;
    }, [cars]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleGenerate = () => {
        generatePredictions.mutate({ seasonId });
    };

    // ─── Loading ────────────────────────────────────────────────────────────

    if (seasonLoading || driversLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement des predictions..." />
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
                            Impossible de charger les predictions.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button
                            href={`/season/${seasonId}`}
                            size="md"
                            color="secondary"
                            iconLeading={ArrowLeft}
                        >
                            Retour a la saison
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button
                    color="link-gray"
                    size="sm"
                    iconLeading={ArrowLeft}
                    href={`/season/${seasonId}`}
                >
                    Retour a la saison
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Predictions
                    </h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        Classements pre-saison bases sur les notes pilotes et les
                        performances des voitures.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isLocked ? (
                        <BadgeWithIcon
                            iconLeading={Lock01}
                            size="lg"
                            color="success"
                            type="pill-color"
                        >
                            Verrouillees
                        </BadgeWithIcon>
                    ) : hasPredictions ? (
                        <>
                            <Button
                                size="md"
                                color="secondary"
                                iconLeading={RefreshCw01}
                                onClick={handleGenerate}
                                isLoading={generatePredictions.isPending}
                            >
                                Regenerer
                            </Button>
                            <Button
                                size="md"
                                color="primary"
                                iconLeading={Lock01}
                                onClick={() => setLockDialogOpen(true)}
                            >
                                Verrouiller
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="md"
                            color="primary"
                            iconLeading={Zap}
                            onClick={handleGenerate}
                            isLoading={generatePredictions.isPending}
                        >
                            Generer les predictions
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {!hasPredictions ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Target04}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>
                                    Aucune prediction
                                </EmptyState.Title>
                                <EmptyState.Description>
                                    Generez les predictions pre-saison basees sur les
                                    notes pilotes et les performances des voitures.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <Button
                                    size="md"
                                    color="primary"
                                    iconLeading={Zap}
                                    onClick={handleGenerate}
                                    isLoading={generatePredictions.isPending}
                                >
                                    Generer les predictions
                                </Button>
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <DriverPredictionsTable
                            predictions={driverPredictions ?? []}
                        />
                        <ConstructorPredictionsTable
                            predictions={constructorPredictions ?? []}
                            carTotalMap={carTotalMap}
                        />
                    </div>
                )}
            </div>

            {/* Lock confirmation dialog */}
            <LockConfirmDialog
                seasonId={seasonId}
                isOpen={lockDialogOpen}
                onOpenChange={setLockDialogOpen}
            />
        </div>
    );
}

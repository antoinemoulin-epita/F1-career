"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Edit01,
    Plus,
    Trash01,
    User01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
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
import { DriverForm } from "@/components/forms/driver-form";
import { useDrivers, useDeleteDriver } from "@/hooks/use-drivers";
import { useTeams } from "@/hooks/use-teams";
import type { Driver, DriverWithEffective, TeamWithBudget } from "@/types";

// ─── CreateDriverDialog ─────────────────────────────────────────────────────

function CreateDriverDialog({
    seasonId,
    teams,
}: {
    seasonId: string;
    teams: TeamWithBudget[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouveau pilote
            </Button>
            <ModalOverlay>
                <Modal className="max-w-2xl">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={User01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Nouveau pilote
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajouter un pilote a cette saison.
                                    </p>
                                </div>
                            </div>
                            <DriverForm
                                seasonId={seasonId}
                                teams={teams}
                                onSuccess={() => setIsOpen(false)}
                                onCancel={() => setIsOpen(false)}
                            />
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── EditDriverDialog ───────────────────────────────────────────────────────

function EditDriverDialog({
    seasonId,
    driver,
    teams,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    driver: Driver;
    teams: TeamWithBudget[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-2xl">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={User01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier le pilote
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier les informations de {driver.first_name} {driver.last_name}.
                                    </p>
                                </div>
                            </div>
                            <DriverForm
                                seasonId={seasonId}
                                driver={driver}
                                teams={teams}
                                onSuccess={() => onOpenChange(false)}
                                onCancel={() => onOpenChange(false)}
                            />
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── DeleteDriverDialog ─────────────────────────────────────────────────────

function DeleteDriverDialog({
    seasonId,
    driver,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    driver: DriverWithEffective;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteDriver = useDeleteDriver();

    const handleDelete = () => {
        deleteDriver.mutate(
            { id: driver.id!, seasonId },
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
                                    icon={AlertCircle}
                                    color="error"
                                    theme="light"
                                    size="md"
                                />
                            </div>
                            <h2 className="text-lg font-semibold text-primary">
                                Supprimer le pilote
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {driver.full_name}
                                </span>
                                ? Cette action est irreversible.
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
                                    color="primary-destructive"
                                    onClick={handleDelete}
                                    isLoading={deleteDriver.isPending}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── DriverRow ──────────────────────────────────────────────────────────────

function DriverRow({
    driver,
    teamName,
    teamColor,
    onEdit,
    onDelete,
}: {
    driver: DriverWithEffective;
    teamName: string | null;
    teamColor: string | null;
    onEdit: () => void;
    onDelete: () => void;
}) {
    // Potentiel display
    let potentialDisplay = "—";
    if (driver.potential_revealed && driver.potential_final != null) {
        potentialDisplay = String(driver.potential_final);
    } else if (driver.potential_min != null && driver.potential_max != null) {
        potentialDisplay = `${driver.potential_min}–${driver.potential_max}`;
    } else if (driver.potential_max != null) {
        potentialDisplay = `≤${driver.potential_max}`;
    }

    // Acclimatation display
    const accl = driver.acclimatation;
    const acclDisplay =
        accl != null ? (accl >= 0 ? `+${accl}` : String(accl)) : "—";

    return (
        <Table.Row id={driver.id!}>
            <Table.Cell>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary">
                        {driver.full_name}
                    </p>
                    {driver.is_rookie && (
                        <Badge size="sm" color="brand" type="pill-color">
                            Rookie
                        </Badge>
                    )}
                    {driver.is_retiring && (
                        <Badge size="sm" color="warning" type="pill-color">
                            Retraite
                        </Badge>
                    )}
                    {driver.is_first_driver && (
                        <Badge size="sm" color="gray" type="pill-color">
                            1er pilote
                        </Badge>
                    )}
                </div>
            </Table.Cell>
            <Table.Cell>
                <div className="flex items-center gap-2">
                    {teamColor && (
                        <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: teamColor }}
                        />
                    )}
                    <span className="text-sm text-tertiary">
                        {teamName ?? "—"}
                    </span>
                </div>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{driver.note}</span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {potentialDisplay}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{acclDisplay}</span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm font-medium text-primary">
                    {driver.effective_note ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <Dropdown.Root>
                    <Dropdown.DotsButton />
                    <Dropdown.Popover className="w-min">
                        <Dropdown.Menu
                            onAction={(key) => {
                                if (key === "edit") onEdit();
                                if (key === "delete") onDelete();
                            }}
                        >
                            <Dropdown.Item id="edit" icon={Edit01}>
                                <span className="pr-4">Modifier</span>
                            </Dropdown.Item>
                            <Dropdown.Item id="delete" icon={Trash01}>
                                <span className="pr-4">Supprimer</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown.Root>
            </Table.Cell>
        </Table.Row>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DriversPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: drivers, isLoading, error } = useDrivers(seasonId);
    const { data: teams } = useTeams(seasonId);

    const [editingDriver, setEditingDriver] = useState<DriverWithEffective | null>(null);
    const [deletingDriver, setDeletingDriver] = useState<DriverWithEffective | null>(null);

    const teamMap = useMemo(
        () => new Map(teams?.map((t) => [t.id, t]) ?? []),
        [teams],
    );

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement des pilotes..." />
            </div>
        );
    }

    if (error) {
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
                            Impossible de charger les pilotes de cette saison.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href={`/season/${seasonId}`} size="md" color="secondary" iconLeading={ArrowLeft}>
                            Retour a la saison
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button color="link-gray" size="sm" iconLeading={ArrowLeft} href={`/season/${seasonId}`}>
                    Retour a la saison
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Pilotes</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {drivers?.length ?? 0} pilote{(drivers?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <CreateDriverDialog seasonId={seasonId} teams={teams ?? []} />
            </div>

            {/* Content */}
            <div className="mt-6">
                {!drivers || drivers.length === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={User01}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Aucun pilote</EmptyState.Title>
                                <EmptyState.Description>
                                    Ajoutez votre premier pilote pour commencer a gerer cette saison.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateDriverDialog seasonId={seasonId} teams={teams ?? []} />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <TableCard.Root>
                        <TableCard.Header
                            title="Pilotes"
                            badge={String(drivers.length)}
                            contentTrailing={<CreateDriverDialog seasonId={seasonId} teams={teams ?? []} />}
                        />
                        <Table>
                            <Table.Header>
                                <Table.Head label="Pilote" isRowHeader />
                                <Table.Head label="Equipe" />
                                <Table.Head label="Note" />
                                <Table.Head label="Potentiel" />
                                <Table.Head label="Accl." />
                                <Table.Head label="Effective" />
                                <Table.Head label="" />
                            </Table.Header>
                            <Table.Body items={drivers}>
                                {(driver) => {
                                    const team = driver.team_id
                                        ? teamMap.get(driver.team_id)
                                        : undefined;
                                    return (
                                        <DriverRow
                                            key={driver.id}
                                            driver={driver}
                                            teamName={team?.name ?? null}
                                            teamColor={team?.color_primary ?? null}
                                            onEdit={() => setEditingDriver(driver)}
                                            onDelete={() => setDeletingDriver(driver)}
                                        />
                                    );
                                }}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                )}
            </div>

            {/* Edit modal */}
            {editingDriver && (
                <EditDriverDialog
                    seasonId={seasonId}
                    driver={editingDriver as Driver}
                    teams={teams ?? []}
                    isOpen={!!editingDriver}
                    onOpenChange={(open) => {
                        if (!open) setEditingDriver(null);
                    }}
                />
            )}

            {/* Delete modal */}
            {deletingDriver && (
                <DeleteDriverDialog
                    seasonId={seasonId}
                    driver={deletingDriver}
                    isOpen={!!deletingDriver}
                    onOpenChange={(open) => {
                        if (!open) setDeletingDriver(null);
                    }}
                />
            )}
        </div>
    );
}

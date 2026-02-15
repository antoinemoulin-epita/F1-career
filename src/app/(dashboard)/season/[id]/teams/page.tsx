"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Edit01,
    Plus,
    Trash01,
    Users01,
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
import { TeamForm } from "@/components/forms/team-form";
import { useEngineSuppliers } from "@/hooks/use-engine-suppliers";
import { useTeams, useDeleteTeam } from "@/hooks/use-teams";
import type { Team, TeamWithBudget } from "@/types";

// ─── CreateTeamDialog ───────────────────────────────────────────────────────

function CreateTeamDialog({ seasonId }: { seasonId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouvelle equipe
            </Button>
            <ModalOverlay>
                <Modal className="max-w-2xl">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Users01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Nouvelle equipe
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajouter une equipe a cette saison.
                                    </p>
                                </div>
                            </div>
                            <TeamForm
                                seasonId={seasonId}
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

// ─── EditTeamDialog ─────────────────────────────────────────────────────────

function EditTeamDialog({
    seasonId,
    team,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    team: Team;
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
                                    icon={Users01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier l&apos;equipe
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier les informations de {team.name}.
                                    </p>
                                </div>
                            </div>
                            <TeamForm
                                seasonId={seasonId}
                                team={team}
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

// ─── DeleteTeamDialog ───────────────────────────────────────────────────────

function DeleteTeamDialog({
    seasonId,
    team,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    team: Team;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteTeam = useDeleteTeam();

    const handleDelete = () => {
        deleteTeam.mutate(
            { id: team.id, seasonId },
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
                                Supprimer l&apos;equipe
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {team.name}
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
                                    isLoading={deleteTeam.isPending}
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

// ─── TeamRow ────────────────────────────────────────────────────────────────

function TeamRow({
    team,
    supplierName,
    onEdit,
    onDelete,
}: {
    team: TeamWithBudget;
    supplierName: string | null;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <Table.Row id={team.id!}>
            <Table.Cell>
                <div className="flex items-center gap-3">
                    {team.color_primary && (
                        <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: team.color_primary }}
                        />
                    )}
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">
                            {team.name}
                        </p>
                        {team.short_name && (
                            <p className="text-xs text-tertiary">{team.short_name}</p>
                        )}
                    </div>
                </div>
            </Table.Cell>
            <Table.Cell>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-tertiary">
                        {supplierName ?? "—"}
                    </span>
                    {team.is_factory_team && (
                        <Badge size="sm" color="brand" type="pill-color">
                            Factory
                        </Badge>
                    )}
                </div>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {team.budget_total ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {team.engineer_stars ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <Dropdown.Root>
                    <Dropdown.DotsButton />
                    <Dropdown.Popover className="w-min">
                        <Dropdown.Menu onAction={(key) => {
                            if (key === "edit") onEdit();
                            if (key === "delete") onDelete();
                        }}>
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

export default function TeamsPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: teams, isLoading, error } = useTeams(seasonId);
    const { data: suppliers } = useEngineSuppliers(seasonId);

    const [editingTeam, setEditingTeam] = useState<TeamWithBudget | null>(null);
    const [deletingTeam, setDeletingTeam] = useState<TeamWithBudget | null>(null);

    const supplierMap = useMemo(
        () => new Map(suppliers?.map((s) => [s.id, s]) ?? []),
        [suppliers],
    );

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement des equipes..." />
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
                            Impossible de charger les equipes de cette saison.
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
                    <h1 className="text-display-sm font-semibold text-primary">Equipes</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {teams?.length ?? 0} equipe{(teams?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <CreateTeamDialog seasonId={seasonId} />
            </div>

            {/* Content */}
            <div className="mt-6">
                {!teams || teams.length === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Users01}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Aucune equipe</EmptyState.Title>
                                <EmptyState.Description>
                                    Ajoutez votre premiere equipe pour commencer a gerer cette saison.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateTeamDialog seasonId={seasonId} />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <TableCard.Root>
                        <TableCard.Header
                            title="Equipes"
                            badge={String(teams.length)}
                            contentTrailing={<CreateTeamDialog seasonId={seasonId} />}
                        />
                        <Table>
                            <Table.Header>
                                <Table.Head label="Equipe" isRowHeader />
                                <Table.Head label="Moteur" />
                                <Table.Head label="Budget" />
                                <Table.Head label="Ingenieurs" />
                                <Table.Head label="" />
                            </Table.Header>
                            <Table.Body items={teams}>
                                {(team) => (
                                    <TeamRow
                                        key={team.id}
                                        team={team}
                                        supplierName={
                                            team.engine_supplier_id
                                                ? supplierMap.get(team.engine_supplier_id)?.name ?? null
                                                : null
                                        }
                                        onEdit={() => setEditingTeam(team)}
                                        onDelete={() => setDeletingTeam(team)}
                                    />
                                )}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                )}
            </div>

            {/* Edit modal */}
            {editingTeam && (
                <EditTeamDialog
                    seasonId={seasonId}
                    team={editingTeam as Team}
                    isOpen={!!editingTeam}
                    onOpenChange={(open) => { if (!open) setEditingTeam(null); }}
                />
            )}

            {/* Delete modal */}
            {deletingTeam && (
                <DeleteTeamDialog
                    seasonId={seasonId}
                    team={deletingTeam as Team}
                    isOpen={!!deletingTeam}
                    onOpenChange={(open) => { if (!open) setDeletingTeam(null); }}
                />
            )}
        </div>
    );
}

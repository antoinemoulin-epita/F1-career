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
    UserPlus01,
} from "@untitledui/icons";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Select } from "@/components/base/select/select";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { Tabs } from "@/components/application/tabs/tabs";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { RookiePoolForm } from "@/components/forms/rookie-pool-form";
import {
    useRookiePool,
    useDeleteRookie,
    useDraftRookie,
} from "@/hooks/use-rookie-pool";
import { useSeasons } from "@/hooks/use-seasons";
import { useTeams } from "@/hooks/use-teams";
import type { RookiePool } from "@/types";

// ─── CreateRookieDialog ─────────────────────────────────────────────────────

function CreateRookieDialog({ universeId }: { universeId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouveau rookie
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
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
                                        Nouveau rookie
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajouter un rookie au pool de l&apos;univers.
                                    </p>
                                </div>
                            </div>
                            <RookiePoolForm
                                universeId={universeId}
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

// ─── EditRookieDialog ───────────────────────────────────────────────────────

function EditRookieDialog({
    universeId,
    rookie,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    rookie: RookiePool;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-lg">
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
                                        Modifier le rookie
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier les informations de {rookie.first_name} {rookie.last_name}.
                                    </p>
                                </div>
                            </div>
                            <RookiePoolForm
                                universeId={universeId}
                                rookie={rookie}
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

// ─── DeleteRookieDialog ─────────────────────────────────────────────────────

function DeleteRookieDialog({
    universeId,
    rookie,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    rookie: RookiePool;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteRookie = useDeleteRookie();

    const handleDelete = () => {
        deleteRookie.mutate(
            { id: rookie.id, universeId },
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
                                Supprimer le rookie
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {rookie.first_name} {rookie.last_name}
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
                                    isLoading={deleteRookie.isPending}
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

// ─── DraftRookieDialog ──────────────────────────────────────────────────────

function DraftRookieDialog({
    universeId,
    rookie,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    rookie: RookiePool;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data: seasons } = useSeasons(universeId);
    const draftRookie = useDraftRookie();

    const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    const { data: teams } = useTeams(selectedSeasonId ?? "");

    const availableSeasons = useMemo(
        () => (seasons ?? []).filter((s) => s.status !== "completed"),
        [seasons],
    );

    const seasonItems = availableSeasons.map((s) => ({
        id: s.id,
        label: `Season ${s.year}`,
    }));

    const teamItems = (teams ?? []).map((t) => ({
        id: t.id!,
        label: t.name!,
    }));

    const selectedTeam = teams?.find((t) => t.id === selectedTeamId);

    const handleDraft = () => {
        if (!selectedSeasonId || !selectedTeamId || !selectedTeam) return;

        draftRookie.mutate(
            {
                rookieId: rookie.id,
                seasonId: selectedSeasonId,
                teamId: selectedTeamId,
                teamName: selectedTeam.name!,
                universeId,
                rookie,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setSelectedSeasonId(null);
                    setSelectedTeamId(null);
                },
            },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={UserPlus01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Recruter {rookie.first_name} {rookie.last_name}
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Potentiel : {rookie.potential_min}–{rookie.potential_max}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Select
                                    label="Saison"
                                    placeholder="Selectionner une saison"
                                    items={seasonItems}
                                    selectedKey={selectedSeasonId}
                                    onSelectionChange={(key) => {
                                        setSelectedSeasonId(key as string);
                                        setSelectedTeamId(null);
                                    }}
                                >
                                    {(item) => (
                                        <Select.Item id={item.id}>{item.label}</Select.Item>
                                    )}
                                </Select>

                                {selectedSeasonId && (
                                    <Select
                                        label="Equipe"
                                        placeholder="Selectionner une equipe"
                                        items={teamItems}
                                        selectedKey={selectedTeamId}
                                        onSelectionChange={(key) =>
                                            setSelectedTeamId(key as string)
                                        }
                                    >
                                        {(item) => (
                                            <Select.Item id={item.id}>{item.label}</Select.Item>
                                        )}
                                    </Select>
                                )}
                            </div>

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
                                    onClick={handleDraft}
                                    isLoading={draftRookie.isPending}
                                    isDisabled={!selectedSeasonId || !selectedTeamId}
                                >
                                    Recruter
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── RookieRow ──────────────────────────────────────────────────────────────

function RookieRow({
    rookie,
    onEdit,
    onDelete,
    onDraft,
}: {
    rookie: RookiePool;
    onEdit: () => void;
    onDelete: () => void;
    onDraft: () => void;
}) {
    return (
        <Table.Row id={rookie.id}>
            <Table.Cell>
                <p className="text-sm font-medium text-primary">
                    {rookie.first_name} {rookie.last_name}
                </p>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {rookie.nationality ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {rookie.potential_min}–{rookie.potential_max}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {rookie.available_from_year ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                {rookie.drafted ? (
                    <BadgeWithDot size="sm" color="gray" type="pill-color">
                        Recrute ({rookie.drafted_team_name})
                    </BadgeWithDot>
                ) : (
                    <BadgeWithDot size="sm" color="success" type="pill-color">
                        Disponible
                    </BadgeWithDot>
                )}
            </Table.Cell>
            <Table.Cell>
                <Dropdown.Root>
                    <Dropdown.DotsButton />
                    <Dropdown.Popover className="w-min">
                        <Dropdown.Menu
                            onAction={(key) => {
                                if (key === "edit") onEdit();
                                if (key === "draft") onDraft();
                                if (key === "delete") onDelete();
                            }}
                        >
                            <Dropdown.Item id="edit" icon={Edit01}>
                                <span className="pr-4">Modifier</span>
                            </Dropdown.Item>
                            {!rookie.drafted && (
                                <Dropdown.Item id="draft" icon={UserPlus01}>
                                    <span className="pr-4">Recruter</span>
                                </Dropdown.Item>
                            )}
                            {!rookie.drafted && (
                                <Dropdown.Item id="delete" icon={Trash01}>
                                    <span className="pr-4">Supprimer</span>
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown.Root>
            </Table.Cell>
        </Table.Row>
    );
}

// ─── RookieTable ────────────────────────────────────────────────────────────

function RookieTable({
    rookies,
    universeId,
    onEdit,
    onDelete,
    onDraft,
}: {
    rookies: RookiePool[];
    universeId: string;
    onEdit: (rookie: RookiePool) => void;
    onDelete: (rookie: RookiePool) => void;
    onDraft: (rookie: RookiePool) => void;
}) {
    if (rookies.length === 0) {
        return (
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
                        <EmptyState.Title>Aucun rookie</EmptyState.Title>
                        <EmptyState.Description>
                            Aucun rookie dans cette categorie.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <CreateRookieDialog universeId={universeId} />
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    return (
        <TableCard.Root>
            <Table>
                <Table.Header>
                    <Table.Head label="Rookie" isRowHeader />
                    <Table.Head label="Nationalite" />
                    <Table.Head label="Potentiel" />
                    <Table.Head label="Dispo des" />
                    <Table.Head label="Statut" />
                    <Table.Head label="" />
                </Table.Header>
                <Table.Body items={rookies}>
                    {(rookie) => (
                        <RookieRow
                            key={rookie.id}
                            rookie={rookie}
                            onEdit={() => onEdit(rookie)}
                            onDelete={() => onDelete(rookie)}
                            onDraft={() => onDraft(rookie)}
                        />
                    )}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RookiesPoolPage() {
    const params = useParams<{ id: string }>();
    const universeId = params.id;

    const { data: rookies, isLoading, error } = useRookiePool(universeId);

    const [editingRookie, setEditingRookie] = useState<RookiePool | null>(null);
    const [deletingRookie, setDeletingRookie] = useState<RookiePool | null>(null);
    const [draftingRookie, setDraftingRookie] = useState<RookiePool | null>(null);

    const available = useMemo(
        () => (rookies ?? []).filter((r) => !r.drafted),
        [rookies],
    );
    const drafted = useMemo(
        () => (rookies ?? []).filter((r) => r.drafted),
        [rookies],
    );

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement du pool rookies..." />
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
                            Impossible de charger le pool de rookies.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href={`/universe/${universeId}`} size="md" color="secondary" iconLeading={ArrowLeft}>
                            Retour a l&apos;univers
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
                <Button color="link-gray" size="sm" iconLeading={ArrowLeft} href={`/universe/${universeId}`}>
                    Retour a l&apos;univers
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Pool Rookies</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {rookies?.length ?? 0} rookie{(rookies?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <CreateRookieDialog universeId={universeId} />
            </div>

            {/* Content with tabs */}
            <div className="mt-6">
                <Tabs defaultSelectedKey="available">
                    <Tabs.List
                        type="button-gray"
                        size="sm"
                        items={[
                            { id: "available", label: `Disponibles (${available.length})` },
                            { id: "drafted", label: `Recrutes (${drafted.length})` },
                            { id: "all", label: `Tous (${rookies?.length ?? 0})` },
                        ]}
                    />

                    <Tabs.Panel id="available" className="pt-6">
                        <RookieTable
                            rookies={available}
                            universeId={universeId}
                            onEdit={setEditingRookie}
                            onDelete={setDeletingRookie}
                            onDraft={setDraftingRookie}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel id="drafted" className="pt-6">
                        <RookieTable
                            rookies={drafted}
                            universeId={universeId}
                            onEdit={setEditingRookie}
                            onDelete={setDeletingRookie}
                            onDraft={setDraftingRookie}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel id="all" className="pt-6">
                        <RookieTable
                            rookies={rookies ?? []}
                            universeId={universeId}
                            onEdit={setEditingRookie}
                            onDelete={setDeletingRookie}
                            onDraft={setDraftingRookie}
                        />
                    </Tabs.Panel>
                </Tabs>
            </div>

            {/* Edit modal */}
            {editingRookie && (
                <EditRookieDialog
                    universeId={universeId}
                    rookie={editingRookie}
                    isOpen={!!editingRookie}
                    onOpenChange={(open) => {
                        if (!open) setEditingRookie(null);
                    }}
                />
            )}

            {/* Delete modal */}
            {deletingRookie && (
                <DeleteRookieDialog
                    universeId={universeId}
                    rookie={deletingRookie}
                    isOpen={!!deletingRookie}
                    onOpenChange={(open) => {
                        if (!open) setDeletingRookie(null);
                    }}
                />
            )}

            {/* Draft modal */}
            {draftingRookie && (
                <DraftRookieDialog
                    universeId={universeId}
                    rookie={draftingRookie}
                    isOpen={!!draftingRookie}
                    onOpenChange={(open) => {
                        if (!open) setDraftingRookie(null);
                    }}
                />
            )}
        </div>
    );
}

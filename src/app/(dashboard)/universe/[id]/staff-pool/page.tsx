"use client";

import { useMemo, useState } from "react";
import type { Selection } from "react-aria-components";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit01,
    Plus,
    Trash01,
    Upload01,
    Users01,
    UserPlus01,
} from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Select } from "@/components/base/select/select";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { TableSelectionBar } from "@/components/application/table/table-selection-bar";
import { BulkDeleteDialog } from "@/components/application/table/bulk-delete-dialog";
import { Tabs } from "@/components/application/tabs/tabs";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { StarRating } from "@/components/base/star-rating/star-rating";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { StaffPoolForm } from "@/components/forms/staff-pool-form";
import { useImportStaffPool } from "@/hooks/use-import-staff-pool";
import {
    useStaffPool,
    useDeleteStaffPoolEntry,
    useDeleteStaffPoolEntries,
    useDraftStaffPoolEntry,
} from "@/hooks/use-staff-pool";
import { getSelectedIds, getSelectedCount } from "@/utils/selection";
import { useSeasons } from "@/hooks/use-seasons";
import { useTeams } from "@/hooks/use-teams";
import { useUniverse } from "@/hooks/use-universes";
import { useTableSort } from "@/hooks/use-table-sort";
import { staffPoolSchema } from "@/lib/validators";
import { staffRoleLabels } from "@/lib/validators/staff";
import type { StaffPool } from "@/types";

// ─── CreateStaffPoolDialog ─────────────────────────────────────────────────

function CreateStaffPoolDialog({ universeId }: { universeId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouveau staff
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
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
                                        Nouveau staff
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajouter un membre du staff au pool de l&apos;univers.
                                    </p>
                                </div>
                            </div>
                            <StaffPoolForm
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

// ─── EditStaffPoolDialog ───────────────────────────────────────────────────

function EditStaffPoolDialog({
    universeId,
    entry,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    entry: StaffPool;
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
                                    icon={Users01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier le staff
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier les informations de {entry.first_name} {entry.last_name}.
                                    </p>
                                </div>
                            </div>
                            <StaffPoolForm
                                universeId={universeId}
                                entry={entry}
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

// ─── DeleteStaffPoolDialog ─────────────────────────────────────────────────

function DeleteStaffPoolDialog({
    universeId,
    entry,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    entry: StaffPool;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteEntry = useDeleteStaffPoolEntry();

    const handleDelete = () => {
        deleteEntry.mutate(
            { id: entry.id, universeId },
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
                                Supprimer le staff
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {entry.first_name} {entry.last_name}
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
                                    isLoading={deleteEntry.isPending}
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

// ─── DraftStaffPoolDialog ──────────────────────────────────────────────────

function DraftStaffPoolDialog({
    universeId,
    entry,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    entry: StaffPool;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data: seasons } = useSeasons(universeId);
    const draftEntry = useDraftStaffPoolEntry();

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

        draftEntry.mutate(
            {
                entryId: entry.id,
                seasonId: selectedSeasonId,
                teamId: selectedTeamId,
                teamName: selectedTeam.name!,
                universeId,
                entry,
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
                                        Recruter {entry.first_name} {entry.last_name}
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        {staffRoleLabels[entry.role]}{entry.note != null ? ` — Note : ${entry.note}/5` : ""}
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
                                    isLoading={draftEntry.isPending}
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

// ─── StaffPoolRow ──────────────────────────────────────────────────────────

function StaffPoolRow({
    entry,
    onEdit,
    onDelete,
    onDraft,
}: {
    entry: StaffPool;
    onEdit: () => void;
    onDelete: () => void;
    onDraft: () => void;
}) {
    return (
        <Table.Row id={entry.id}>
            <Table.Cell>
                <p className="text-sm font-medium text-primary">
                    {entry.first_name} {entry.last_name}
                </p>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {entry.nationality ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {entry.birth_year ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <Badge size="sm" color="gray" type="pill-color">
                    {staffRoleLabels[entry.role] ?? entry.role}
                </Badge>
            </Table.Cell>
            <Table.Cell>
                {entry.note != null ? (
                    <StarRating value={Number(entry.note)} size="sm" />
                ) : (
                    <span className="text-sm text-tertiary">—</span>
                )}
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {entry.available_from_year ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                {entry.drafted ? (
                    <BadgeWithDot size="sm" color="gray" type="pill-color">
                        Recrute ({entry.drafted_team_name})
                    </BadgeWithDot>
                ) : (
                    <Badge size="sm" color="success" type="pill-color">
                        Disponible
                    </Badge>
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
                            {!entry.drafted && (
                                <Dropdown.Item id="draft" icon={UserPlus01}>
                                    <span className="pr-4">Recruter</span>
                                </Dropdown.Item>
                            )}
                            {!entry.drafted && (
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

// ─── StaffPoolTable ────────────────────────────────────────────────────────

function StaffPoolTable({
    entries,
    universeId,
    onEdit,
    onDelete,
    onDraft,
}: {
    entries: StaffPool[];
    universeId: string;
    onEdit: (entry: StaffPool) => void;
    onDelete: (entry: StaffPool) => void;
    onDraft: (entry: StaffPool) => void;
}) {
    const columns = useMemo(
        () => ({
            nom: (e: StaffPool) => `${e.first_name ?? ""} ${e.last_name}`,
            nationalite: (e: StaffPool) => e.nationality,
            naissance: (e: StaffPool) => e.birth_year,
            role: (e: StaffPool) => e.role,
            note: (e: StaffPool) => e.note,
            dispo: (e: StaffPool) => e.available_from_year,
        }),
        [],
    );

    const { sortDescriptor, onSortChange, sortedItems } =
        useTableSort(entries, columns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const deleteEntries = useDeleteStaffPoolEntries();

    const allIds = useMemo(() => entries.map((e) => e.id), [entries]);
    const selectedCount = getSelectedCount(selectedKeys, allIds.length);

    if (entries.length === 0) {
        return (
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
                        <EmptyState.Title>Aucun staff</EmptyState.Title>
                        <EmptyState.Description>
                            Aucun staff dans cette categorie.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <CreateStaffPoolDialog universeId={universeId} />
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    return (
        <>
            <TableCard.Root>
                {selectedCount > 0 && (
                    <TableSelectionBar
                        count={selectedCount}
                        onClearSelection={() => setSelectedKeys(new Set())}
                        actions={
                            <Button
                                size="sm"
                                color="primary-destructive"
                                iconLeading={Trash01}
                                onClick={() => setBulkDeleteOpen(true)}
                            >
                                Supprimer
                            </Button>
                        }
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
                        <Table.Head id="nom" label="Nom" isRowHeader allowsSorting />
                        <Table.Head id="nationalite" label="Nationalite" allowsSorting />
                        <Table.Head id="naissance" label="Naissance" allowsSorting />
                        <Table.Head id="role" label="Role" allowsSorting />
                        <Table.Head id="note" label="Note" allowsSorting />
                        <Table.Head id="dispo" label="Dispo des" allowsSorting />
                        <Table.Head label="Statut" />
                        <Table.Head label="" />
                    </Table.Header>
                    <Table.Body items={sortedItems}>
                        {(entry) => (
                            <StaffPoolRow
                                key={entry.id}
                                entry={entry}
                                onEdit={() => onEdit(entry)}
                                onDelete={() => onDelete(entry)}
                                onDraft={() => onDraft(entry)}
                            />
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            <BulkDeleteDialog
                count={selectedCount}
                entityLabel="staff"
                isOpen={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                isPending={deleteEntries.isPending}
                onConfirm={() => {
                    const ids = getSelectedIds(selectedKeys, allIds);
                    deleteEntries.mutate(
                        { ids, universeId },
                        {
                            onSuccess: () => {
                                setSelectedKeys(new Set());
                                setBulkDeleteOpen(false);
                            },
                        },
                    );
                }}
            />
        </>
    );
}

// ─── Import config ─────────────────────────────────────────────────────────

const staffExampleJson = JSON.stringify(
    [
        {
            first_name: "Adrian",
            last_name: "Newey",
            nationality: "GBR",
            birth_year: 1958,
            role: "technical_director",
            note: 5,
            available_from_year: 2025,
        },
    ],
    null,
    2,
);

const staffFields = [
    { name: "last_name", required: true, description: "Nom de famille" },
    { name: "first_name", required: false, description: "Prenom" },
    { name: "nationality", required: false, description: "Code pays (GBR, FRA, ITA, NED...)" },
    { name: "birth_year", required: false, description: "Annee de naissance (1850–2015)" },
    { name: "role", required: true, description: "principal, technical_director, sporting_director, chief_engineer" },
    { name: "note", required: false, description: "Note en etoiles (1–5, demi-etoiles)" },
    { name: "available_from_year", required: false, description: "Disponible a partir de (1950–2100)" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StaffPoolPage() {
    const params = useParams<{ id: string }>();
    const universeId = params.id;

    const { data: entries, isLoading, error } = useStaffPool(universeId);
    const { data: universe } = useUniverse(universeId);
    const importStaffPool = useImportStaffPool();

    const [editingEntry, setEditingEntry] = useState<StaffPool | null>(null);
    const [deletingEntry, setDeletingEntry] = useState<StaffPool | null>(null);
    const [draftingEntry, setDraftingEntry] = useState<StaffPool | null>(null);

    const drafted = useMemo(
        () => (entries ?? []).filter((e) => e.drafted),
        [entries],
    );

    const undrafted = useMemo(
        () => (entries ?? []).filter((e) => !e.drafted),
        [entries],
    );

    if (isLoading) {
        return <PageLoading label="Chargement du pool staff..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger le pool de staff."
                backHref={`/universe/${universeId}`}
                backLabel="Retour a l'univers"
            />
        );
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Univers", href: `/universe/${universeId}` },
                    { label: "Pool Staff" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Pool Staff</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {entries?.length ?? 0} membre{(entries?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog
                        title="Importer du staff"
                        description="Importez des membres du staff depuis un fichier JSON."
                        exampleData={staffExampleJson}
                        fields={staffFields}
                        schema={staffPoolSchema}
                        onImport={(items) => importStaffPool.mutate({ universeId, rows: items })}
                        isPending={importStaffPool.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateStaffPoolDialog universeId={universeId} />
                </div>
            </div>

            {/* Content with tabs */}
            <div className="mt-6">
                <Tabs defaultSelectedKey="available">
                    <Tabs.List
                        type="button-gray"
                        size="sm"
                        items={[
                            { id: "available", label: `Disponibles (${undrafted.length})` },
                            { id: "drafted", label: `Recrutes (${drafted.length})` },
                            { id: "all", label: `Tous (${entries?.length ?? 0})` },
                        ]}
                    />

                    <Tabs.Panel id="available" className="pt-6">
                        <StaffPoolTable
                            entries={undrafted}
                            universeId={universeId}
                            onEdit={setEditingEntry}
                            onDelete={setDeletingEntry}
                            onDraft={setDraftingEntry}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel id="drafted" className="pt-6">
                        <StaffPoolTable
                            entries={drafted}
                            universeId={universeId}
                            onEdit={setEditingEntry}
                            onDelete={setDeletingEntry}
                            onDraft={setDraftingEntry}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel id="all" className="pt-6">
                        <StaffPoolTable
                            entries={entries ?? []}
                            universeId={universeId}
                            onEdit={setEditingEntry}
                            onDelete={setDeletingEntry}
                            onDraft={setDraftingEntry}
                        />
                    </Tabs.Panel>
                </Tabs>
            </div>

            {/* Edit modal */}
            {editingEntry && (
                <EditStaffPoolDialog
                    universeId={universeId}
                    entry={editingEntry}
                    isOpen={!!editingEntry}
                    onOpenChange={(open) => {
                        if (!open) setEditingEntry(null);
                    }}
                />
            )}

            {/* Delete modal */}
            {deletingEntry && (
                <DeleteStaffPoolDialog
                    universeId={universeId}
                    entry={deletingEntry}
                    isOpen={!!deletingEntry}
                    onOpenChange={(open) => {
                        if (!open) setDeletingEntry(null);
                    }}
                />
            )}

            {/* Draft modal */}
            {draftingEntry && (
                <DraftStaffPoolDialog
                    universeId={universeId}
                    entry={draftingEntry}
                    isOpen={!!draftingEntry}
                    onOpenChange={(open) => {
                        if (!open) setDraftingEntry(null);
                    }}
                />
            )}
        </div>
    );
}

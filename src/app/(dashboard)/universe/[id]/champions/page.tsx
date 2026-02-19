"use client";

import { useMemo, useState } from "react";
import type { Selection } from "react-aria-components";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit01,
    Plus,
    Trash01,
    Trophy01,
    Upload01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
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
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { HistoryChampionForm } from "@/components/forms/history-champion-form";
import { useChampions } from "@/hooks/use-history";
import { useImportHistoryChampions } from "@/hooks/use-import-history-champions";
import {
    useDeleteChampion,
    useDeleteChampions,
} from "@/hooks/use-history-champions";
import { useUniverse } from "@/hooks/use-universes";
import { useTableSort } from "@/hooks/use-table-sort";
import { getSelectedIds, getSelectedCount } from "@/utils/selection";
import { historyChampionImportSchema } from "@/lib/validators/history-champion-import";
import type { HistoryChampionImportValues } from "@/lib/validators/history-champion-import";
import type { HistoryChampion } from "@/types";

// ─── Import config ──────────────────────────────────────────────────────────

const CHAMPIONS_IMPORT_EXAMPLE = JSON.stringify(
    [
        {
            year: 2023,
            driver_name: "Max Verstappen",
            driver_team: "Red Bull",
            driver_points: 575,
            team_name: "Red Bull",
            team_points: 860,
            summary: "Domination totale de Verstappen",
        },
    ],
    null,
    2,
);

const CHAMPIONS_IMPORT_FIELDS = [
    { name: "year", required: true, description: "Annee de la saison (1950-2100)" },
    { name: "driver_name", required: true, description: "Nom du champion pilote" },
    { name: "driver_team", required: false, description: "Ecurie du champion pilote" },
    { name: "driver_points", required: false, description: "Points du champion pilote" },
    { name: "team_name", required: false, description: "Nom du champion constructeur" },
    { name: "team_points", required: false, description: "Points du champion constructeur" },
    { name: "summary", required: false, description: "Resume de la saison" },
];

// ─── CreateChampionDialog ───────────────────────────────────────────────────

function CreateChampionDialog({ universeId }: { universeId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouveau champion
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Trophy01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Nouveau champion
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajouter une saison au palmares.
                                    </p>
                                </div>
                            </div>
                            <HistoryChampionForm
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

// ─── EditChampionDialog ─────────────────────────────────────────────────────

function EditChampionDialog({
    universeId,
    champion,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    champion: HistoryChampion;
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
                                    icon={Trophy01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier le champion
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier les informations de la saison {champion.year}.
                                    </p>
                                </div>
                            </div>
                            <HistoryChampionForm
                                universeId={universeId}
                                champion={champion}
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

// ─── DeleteChampionDialog ───────────────────────────────────────────────────

function DeleteChampionDialog({
    universeId,
    champion,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    champion: HistoryChampion;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteChampion = useDeleteChampion();

    const handleDelete = () => {
        deleteChampion.mutate(
            { id: champion.id, universeId },
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
                                Supprimer le champion
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer la saison{" "}
                                <span className="font-medium text-primary">
                                    {champion.year}
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
                                    isLoading={deleteChampion.isPending}
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

// ─── ChampionRow ────────────────────────────────────────────────────────────

function ChampionRow({
    champion,
    onEdit,
    onDelete,
}: {
    champion: HistoryChampion;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <Table.Row id={champion.id}>
            <Table.Cell>
                <span className="text-sm font-medium text-primary">
                    {champion.year}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-primary">
                    {champion.champion_driver_name}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {champion.champion_driver_team ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {champion.champion_driver_points ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {champion.champion_team_name ?? "—"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {champion.champion_team_points ?? "—"}
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

// ─── ChampionTable ──────────────────────────────────────────────────────────

function ChampionTable({
    champions,
    universeId,
    onEdit,
    onDelete,
}: {
    champions: HistoryChampion[];
    universeId: string;
    onEdit: (champion: HistoryChampion) => void;
    onDelete: (champion: HistoryChampion) => void;
}) {
    const championColumns = useMemo(
        () => ({
            saison: (c: HistoryChampion) => c.year,
            pilote: (c: HistoryChampion) => c.champion_driver_name,
            ecurie_pilote: (c: HistoryChampion) => c.champion_driver_team,
            pts_pilote: (c: HistoryChampion) => c.champion_driver_points,
            constructeur: (c: HistoryChampion) => c.champion_team_name,
            pts_constructeur: (c: HistoryChampion) => c.champion_team_points,
        }),
        [],
    );

    const { sortDescriptor, onSortChange, sortedItems: sortedChampions } =
        useTableSort(champions, championColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const deleteChampions = useDeleteChampions();

    const allIds = useMemo(() => champions.map((c) => c.id), [champions]);
    const selectedCount = getSelectedCount(selectedKeys, allIds.length);

    if (champions.length === 0) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <EmptyState size="md">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon
                            icon={Trophy01}
                            color="brand"
                            theme="light"
                        />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Aucun champion</EmptyState.Title>
                        <EmptyState.Description>
                            Ajoutez l&apos;historique des champions du monde.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <CreateChampionDialog universeId={universeId} />
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
                        <Table.Head id="saison" label="Saison" isRowHeader allowsSorting />
                        <Table.Head id="pilote" label="Pilote" allowsSorting />
                        <Table.Head id="ecurie_pilote" label="Ecurie Pilote" allowsSorting />
                        <Table.Head id="pts_pilote" label="Pts Pilote" allowsSorting />
                        <Table.Head id="constructeur" label="Constructeur" allowsSorting />
                        <Table.Head id="pts_constructeur" label="Pts Constructeur" allowsSorting />
                        <Table.Head label="" />
                    </Table.Header>
                    <Table.Body items={sortedChampions}>
                        {(champion) => (
                            <ChampionRow
                                key={champion.id}
                                champion={champion}
                                onEdit={() => onEdit(champion)}
                                onDelete={() => onDelete(champion)}
                            />
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            <BulkDeleteDialog
                count={selectedCount}
                entityLabel="champion"
                isOpen={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                isPending={deleteChampions.isPending}
                onConfirm={() => {
                    const ids = getSelectedIds(selectedKeys, allIds);
                    deleteChampions.mutate(
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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ChampionsPage() {
    const params = useParams<{ id: string }>();
    const universeId = params.id;

    const { data: champions, isLoading, error } = useChampions(universeId);
    const { data: universe } = useUniverse(universeId);
    const importChampions = useImportHistoryChampions();

    const [editingChampion, setEditingChampion] = useState<HistoryChampion | null>(null);
    const [deletingChampion, setDeletingChampion] = useState<HistoryChampion | null>(null);

    if (isLoading) {
        return <PageLoading label="Chargement du palmares..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger le palmares."
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
                    { label: "Palmares" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Palmares</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {champions?.length ?? 0} saison{(champions?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog<HistoryChampionImportValues>
                        title="Importer le palmares"
                        description="Importez l'historique des champions depuis un fichier JSON."
                        exampleData={CHAMPIONS_IMPORT_EXAMPLE}
                        fields={CHAMPIONS_IMPORT_FIELDS}
                        schema={historyChampionImportSchema}
                        onImport={(items) =>
                            importChampions.mutate({ universeId: universe?.id ?? universeId, rows: items })
                        }
                        isPending={importChampions.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateChampionDialog universeId={universeId} />
                </div>
            </div>

            {/* Table */}
            <div className="mt-6">
                <ChampionTable
                    champions={champions ?? []}
                    universeId={universeId}
                    onEdit={setEditingChampion}
                    onDelete={setDeletingChampion}
                />
            </div>

            {/* Edit modal */}
            {editingChampion && (
                <EditChampionDialog
                    universeId={universeId}
                    champion={editingChampion}
                    isOpen={!!editingChampion}
                    onOpenChange={(open) => {
                        if (!open) setEditingChampion(null);
                    }}
                />
            )}

            {/* Delete modal */}
            {deletingChampion && (
                <DeleteChampionDialog
                    universeId={universeId}
                    champion={deletingChampion}
                    isOpen={!!deletingChampion}
                    onOpenChange={(open) => {
                        if (!open) setDeletingChampion(null);
                    }}
                />
            )}
        </div>
    );
}

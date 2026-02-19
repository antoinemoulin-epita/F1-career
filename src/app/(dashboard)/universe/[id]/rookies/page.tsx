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
    User01,
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
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { RookiePoolForm } from "@/components/forms/rookie-pool-form";
import { useImportRookies } from "@/hooks/use-import-rookies";
import {
    useRookiePool,
    useDeleteRookie,
    useDeleteRookies,
    useDraftRookie,
} from "@/hooks/use-rookie-pool";
import { getSelectedIds, getSelectedCount } from "@/utils/selection";
import { useSeasons } from "@/hooks/use-seasons";
import { useTeams } from "@/hooks/use-teams";
import { useUniverse } from "@/hooks/use-universes";
import { useTableSort } from "@/hooks/use-table-sort";
import { rookiePoolSchema } from "@/lib/validators";
import type { RookiePool } from "@/types";

// ─── Availability logic ─────────────────────────────────────────────────────

type RookieAvailability = {
    status: "unavailable" | "early" | "optimal";
    label: string;
    color: "gray" | "warning" | "success";
    penalty: number;
};

function getRookieAvailability(
    rookie: RookiePool,
    currentYear: number | null,
): RookieAvailability {
    if (!currentYear || !rookie.available_from_year) {
        return { status: "optimal", label: "Disponible", color: "success", penalty: 0 };
    }

    // Earliest possible = available_from_year - potential_max + 1
    // (needs at least note=1, each year early costs -1)
    const earliestYear = rookie.available_from_year - rookie.potential_max + 1;

    if (currentYear < earliestYear) {
        return {
            status: "unavailable",
            label: "Non disponible",
            color: "gray",
            penalty: 0,
        };
    }

    if (currentYear < rookie.available_from_year) {
        const yearsEarly = rookie.available_from_year - currentYear;
        return {
            status: "early",
            label: `Peut-etre dispo (−${yearsEarly})`,
            color: "warning",
            penalty: yearsEarly,
        };
    }

    return { status: "optimal", label: "Optimal", color: "success", penalty: 0 };
}

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
    currentYear,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    rookie: RookiePool;
    currentYear: number | null;
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
                currentYear,
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
    currentYear,
    onEdit,
    onDelete,
    onDraft,
}: {
    rookie: RookiePool;
    currentYear: number | null;
    onEdit: () => void;
    onDelete: () => void;
    onDraft: () => void;
}) {
    const availability = getRookieAvailability(rookie, currentYear);

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
                    {rookie.note ?? "—"}
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
                    <Badge size="sm" color={availability.color} type="pill-color">
                        {availability.label}
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
    currentYear,
    onEdit,
    onDelete,
    onDraft,
}: {
    rookies: RookiePool[];
    universeId: string;
    currentYear: number | null;
    onEdit: (rookie: RookiePool) => void;
    onDelete: (rookie: RookiePool) => void;
    onDraft: (rookie: RookiePool) => void;
}) {
    const rookieColumns = useMemo(
        () => ({
            rookie: (r: RookiePool) => `${r.first_name ?? ""} ${r.last_name}`,
            nationalite: (r: RookiePool) => r.nationality,
            note: (r: RookiePool) => r.note,
            potentiel: (r: RookiePool) => r.potential_max,
            dispo: (r: RookiePool) => r.available_from_year,
        }),
        [],
    );

    const { sortDescriptor, onSortChange, sortedItems: sortedRookies } =
        useTableSort(rookies, rookieColumns);

    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const deleteRookies = useDeleteRookies();

    const allIds = useMemo(() => rookies.map((r) => r.id), [rookies]);
    const selectedCount = getSelectedCount(selectedKeys, allIds.length);

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
                        <Table.Head id="rookie" label="Rookie" isRowHeader allowsSorting />
                        <Table.Head id="nationalite" label="Nationalite" allowsSorting />
                        <Table.Head id="note" label="Note" allowsSorting />
                        <Table.Head id="potentiel" label="Potentiel" allowsSorting />
                        <Table.Head id="dispo" label="Dispo des" allowsSorting />
                        <Table.Head label="Statut" />
                        <Table.Head label="" />
                    </Table.Header>
                    <Table.Body items={sortedRookies}>
                        {(rookie) => (
                            <RookieRow
                                key={rookie.id}
                                rookie={rookie}
                                currentYear={currentYear}
                                onEdit={() => onEdit(rookie)}
                                onDelete={() => onDelete(rookie)}
                                onDraft={() => onDraft(rookie)}
                            />
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            <BulkDeleteDialog
                count={selectedCount}
                entityLabel="rookie"
                isOpen={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                isPending={deleteRookies.isPending}
                onConfirm={() => {
                    const ids = getSelectedIds(selectedKeys, allIds);
                    deleteRookies.mutate(
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

const rookieExampleJson = JSON.stringify(
    [
        {
            last_name: "Antonelli",
            first_name: "Kimi",
            nationality: "ITA",
            birth_year: 2006,
            note: 7,
            potential_min: 6,
            potential_max: 9,
            available_from_year: 2025,
        },
    ],
    null,
    2,
);

const rookieFields = [
    { name: "last_name", required: true, description: "Nom de famille" },
    { name: "first_name", required: false, description: "Prenom" },
    { name: "nationality", required: false, description: "Code pays (GBR, FRA, ITA, NED...)" },
    { name: "birth_year", required: false, description: "Annee de naissance (1940–2015)" },
    { name: "note", required: false, description: "Note de base a l'arrivee en F1 (0–10)" },
    { name: "potential_min", required: true, description: "Potentiel minimum, entier (0–10)" },
    { name: "potential_max", required: true, description: "Potentiel maximum, entier (0–10, >= min)" },
    { name: "available_from_year", required: false, description: "Disponible a partir de (1950–2100)" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RookiesPoolPage() {
    const params = useParams<{ id: string }>();
    const universeId = params.id;

    const { data: rookies, isLoading, error } = useRookiePool(universeId);
    const { data: universe } = useUniverse(universeId);
    const { data: seasons } = useSeasons(universeId);
    const importRookies = useImportRookies();

    const [editingRookie, setEditingRookie] = useState<RookiePool | null>(null);
    const [deletingRookie, setDeletingRookie] = useState<RookiePool | null>(null);
    const [draftingRookie, setDraftingRookie] = useState<RookiePool | null>(null);

    // Current year = latest season year, fallback to universe start_year
    const currentYear = seasons?.[0]?.year ?? universe?.start_year ?? null;

    const drafted = useMemo(
        () => (rookies ?? []).filter((r) => r.drafted),
        [rookies],
    );

    const undrafted = useMemo(
        () => (rookies ?? []).filter((r) => !r.drafted),
        [rookies],
    );

    if (isLoading) {
        return <PageLoading label="Chargement du pool rookies..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger le pool de rookies."
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
                    { label: "Pool Rookies" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Pool Rookies</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {rookies?.length ?? 0} rookie{(rookies?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog
                        title="Importer des rookies"
                        description="Importez des rookies depuis un fichier JSON."
                        exampleData={rookieExampleJson}
                        fields={rookieFields}
                        schema={rookiePoolSchema}
                        onImport={(items) => importRookies.mutate({ universeId, rows: items })}
                        isPending={importRookies.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateRookieDialog universeId={universeId} />
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
                            { id: "all", label: `Tous (${rookies?.length ?? 0})` },
                        ]}
                    />

                    <Tabs.Panel id="available" className="pt-6">
                        <RookieTable
                            rookies={undrafted}
                            universeId={universeId}
                            currentYear={currentYear}
                            onEdit={setEditingRookie}
                            onDelete={setDeletingRookie}
                            onDraft={setDraftingRookie}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel id="drafted" className="pt-6">
                        <RookieTable
                            rookies={drafted}
                            universeId={universeId}
                            currentYear={currentYear}
                            onEdit={setEditingRookie}
                            onDelete={setDeletingRookie}
                            onDraft={setDraftingRookie}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel id="all" className="pt-6">
                        <RookieTable
                            rookies={rookies ?? []}
                            universeId={universeId}
                            currentYear={currentYear}
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
                    currentYear={currentYear}
                    isOpen={!!draftingRookie}
                    onOpenChange={(open) => {
                        if (!open) setDraftingRookie(null);
                    }}
                />
            )}
        </div>
    );
}

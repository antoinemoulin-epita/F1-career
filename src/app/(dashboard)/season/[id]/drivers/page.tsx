"use client";

import { useCallback, useMemo, useState } from "react";
import type { Selection } from "react-aria-components";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit01,
    Plus,
    Trash01,
    Upload01,
    User01,
} from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { Dropdown } from "@/components/base/dropdown/dropdown";
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
import { DriverForm } from "@/components/forms/driver-form";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { useDrivers, useDeleteDriver, useDeleteDrivers } from "@/hooks/use-drivers";
import { getSelectedIds, getSelectedCount } from "@/utils/selection";
import { useImportDrivers } from "@/hooks/use-import-drivers";
import { useTeams } from "@/hooks/use-teams";
import { useTableSort } from "@/hooks/use-table-sort";
import { nationalityToFlag } from "@/lib/constants/nationalities";
import { driverImportSchema, type DriverImportValues } from "@/lib/validators/driver-import";
import type { DriverFormValues } from "@/lib/validators";
import { DriverLink, TeamLink } from "@/components/profile/entity-link";
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

// ─── Helpers ───────────────────────────────────────────────────────────────

function effectiveNoteColor(note: number): "success" | "brand" | "warning" | "error" {
    if (note >= 8) return "success";
    if (note >= 6) return "brand";
    if (note >= 4) return "warning";
    return "error";
}

// ─── DriverRow ──────────────────────────────────────────────────────────────

function DriverRow({
    driver,
    teamName,
    teamColor,
    teamIdentityId,
    showDriverRank,
    onEdit,
    onDelete,
}: {
    driver: DriverWithEffective;
    teamName: string | null;
    teamColor: string | null;
    teamIdentityId: string | null;
    /** Only show 1er/2e badges when at least one driver on the team has is_first_driver === true */
    showDriverRank: boolean;
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

    const flag = nationalityToFlag(driver.nationality);

    return (
        <Table.Row id={driver.id!}>
            <Table.Cell>
                <div className="flex items-center gap-2">
                    {flag ? (
                        <Avatar
                            size="xs"
                            placeholder={<span className="text-sm leading-none">{flag}</span>}
                            contrastBorder={false}
                        />
                    ) : (
                        <Avatar size="xs" contrastBorder={false} />
                    )}
                    {driver.person_id ? (
                        <DriverLink personId={driver.person_id} className="text-sm font-medium">
                            {driver.full_name}
                        </DriverLink>
                    ) : (
                        <p className="text-sm font-medium text-primary">
                            {driver.full_name}
                        </p>
                    )}
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
                </div>
            </Table.Cell>
            <Table.Cell>
                <div className="flex items-center gap-2">
                    {teamName && teamIdentityId ? (
                        <TeamLink teamIdentityId={teamIdentityId} color={teamColor}>
                            {teamName}
                        </TeamLink>
                    ) : (
                        <>
                            {teamColor && (
                                <span
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: teamColor }}
                                />
                            )}
                            <span className="text-sm text-tertiary">
                                {teamName ?? "—"}
                            </span>
                        </>
                    )}
                </div>
            </Table.Cell>
            <Table.Cell>
                <div className="flex items-center gap-1.5">
                    {showDriverRank && driver.is_first_driver === true && (
                        <Badge size="sm" color="brand" type="pill-color">
                            1er
                        </Badge>
                    )}
                    {showDriverRank && driver.is_first_driver === false && (
                        <Badge size="sm" color="gray" type="pill-color">
                            2e
                        </Badge>
                    )}
                    {driver.contract_years_remaining != null && driver.contract_years_remaining > 0 ? (
                        <span className="text-sm text-tertiary">
                            {driver.contract_years_remaining} an{driver.contract_years_remaining > 1 ? "s" : ""}
                        </span>
                    ) : driver.contract_years_remaining === 0 ? (
                        <Badge size="sm" color="error" type="pill-color">
                            Agent libre
                        </Badge>
                    ) : (
                        <span className="text-sm text-tertiary">—</span>
                    )}
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
                {driver.effective_note != null ? (
                    <Badge
                        size="sm"
                        color={effectiveNoteColor(driver.effective_note)}
                        type="pill-color"
                    >
                        {driver.effective_note}
                    </Badge>
                ) : (
                    <span className="text-sm text-tertiary">—</span>
                )}
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

// ─── Import config ─────────────────────────────────────────────────────────

const driverExampleJson = JSON.stringify(
    [
        {
            last_name: "Verstappen",
            first_name: "Max",
            nationality: "NED",
            birth_year: 1997,
            note: 9,
            potential_min: 9,
            potential_max: 10,
            team: "Red Bull Racing",
            is_rookie: false,
            is_first_driver: true,
            contract_years_remaining: 2,
            world_titles: 4,
            career_wins: 63,
        },
    ],
    null,
    2,
);

function buildDriverFields(teamNames: string[]) {
    const teamDesc = teamNames.length > 0
        ? `Nom de l'equipe : ${teamNames.join(", ")}`
        : "Nom de l'equipe (aucune equipe existante)";
    return [
        { name: "last_name", required: true, description: "Nom de famille" },
        { name: "first_name", required: false, description: "Prenom" },
        { name: "nationality", required: false, description: "Code pays (GBR, FRA, ITA, NED...)" },
        { name: "birth_year", required: false, description: "Annee de naissance (1950–2015)" },
        { name: "note", required: true, description: "Note globale, entier (0–10)" },
        { name: "potential_min", required: false, description: "Potentiel minimum, entier (0–10)" },
        { name: "potential_max", required: false, description: "Potentiel maximum, entier (0–10)" },
        { name: "team", required: false, description: teamDesc },
        { name: "is_rookie", required: false, description: "true/false" },
        { name: "is_retiring", required: false, description: "true/false" },
        { name: "is_first_driver", required: false, description: "true = 1er pilote, false = 2e pilote" },
        { name: "contract_years_remaining", required: false, description: "Annees de contrat restantes (0 = agent libre)" },
        { name: "world_titles", required: false, description: "Nombre de titres mondiaux" },
        { name: "career_wins", required: false, description: "Nombre de victoires en carriere" },
        { name: "career_points", required: false, description: "Points en carriere" },
    ];
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DriversPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: drivers, isLoading, error } = useDrivers(seasonId);
    const { data: teams } = useTeams(seasonId);
    const importDrivers = useImportDrivers();
    const deleteDrivers = useDeleteDrivers();

    const [editingDriver, setEditingDriver] = useState<DriverWithEffective | null>(null);
    const [deletingDriver, setDeletingDriver] = useState<DriverWithEffective | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const allIds = useMemo(() => (drivers ?? []).map((d) => d.id!), [drivers]);
    const selectedCount = getSelectedCount(selectedKeys, allIds.length);

    const teamMap = useMemo(
        () => new Map(teams?.map((t) => [t.id, t]) ?? []),
        [teams],
    );

    // Teams where at least one driver has is_first_driver === true (data explicitly set)
    const teamsWithRank = useMemo(() => {
        const set = new Set<string>();
        for (const d of drivers ?? []) {
            if (d.team_id && d.is_first_driver === true) set.add(d.team_id);
        }
        return set;
    }, [drivers]);

    const driverColumns = useMemo(
        () => ({
            pilote: (d: DriverWithEffective) => d.full_name ?? "",
            equipe: (d: DriverWithEffective) =>
                d.team_id ? teamMap.get(d.team_id)?.name ?? "" : "",
            contrat: (d: DriverWithEffective) => d.contract_years_remaining ?? -1,
            note: (d: DriverWithEffective) => d.note,
            potentiel: (d: DriverWithEffective) =>
                d.potential_revealed ? d.potential_final : d.potential_max,
            accl: (d: DriverWithEffective) => d.acclimatation,
            effective: (d: DriverWithEffective) => d.effective_note,
        }),
        [teamMap],
    );

    const { sortDescriptor, onSortChange, sortedItems: sortedDrivers } =
        useTableSort(drivers ?? [], driverColumns);

    const driverFields = useMemo(
        () => buildDriverFields((teams ?? []).map((t) => t.name!)),
        [teams],
    );

    const resolveDrivers = useCallback(
        (items: DriverImportValues[]) => {
            const nameToId = new Map(
                (teams ?? []).map((t) => [t.name!.toLowerCase(), t.id!]),
            );
            const resolved: DriverFormValues[] = [];
            const errors: string[] = [];

            items.forEach((item, i) => {
                const { team, ...rest } = item;
                if (team) {
                    const id = nameToId.get(team.trim().toLowerCase());
                    if (!id) {
                        errors.push(`Element ${i + 1} : equipe "${team}" introuvable`);
                        return;
                    }
                    resolved.push({ ...rest, team_id: id });
                } else {
                    resolved.push({ ...rest, team_id: null });
                }
            });

            return { resolved, errors };
        },
        [teams],
    );

    if (isLoading) {
        return <PageLoading label="Chargement des pilotes..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les pilotes de cette saison."
                backHref={`/season/${seasonId}`}
                backLabel="Retour a la saison"
            />
        );
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Saison", href: `/season/${seasonId}` },
                    { label: "Pilotes" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Pilotes</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {drivers?.length ?? 0} pilote{(drivers?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog<DriverImportValues, DriverFormValues>
                        title="Importer des pilotes"
                        description="Importez des pilotes depuis un fichier JSON."
                        exampleData={driverExampleJson}
                        fields={driverFields}
                        schema={driverImportSchema}
                        resolve={resolveDrivers}
                        onImport={(items) => importDrivers.mutate({ seasonId, rows: items })}
                        isPending={importDrivers.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateDriverDialog seasonId={seasonId} teams={teams ?? []} />
                </div>
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
                        {selectedCount > 0 ? (
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
                        ) : (
                            <TableCard.Header
                                title="Pilotes"
                                badge={String(drivers.length)}
                                contentTrailing={<CreateDriverDialog seasonId={seasonId} teams={teams ?? []} />}
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
                                <Table.Head id="pilote" label="Pilote" isRowHeader allowsSorting />
                                <Table.Head id="equipe" label="Equipe" allowsSorting />
                                <Table.Head id="contrat" label="Contrat" allowsSorting />
                                <Table.Head id="note" label="Note" allowsSorting />
                                <Table.Head id="potentiel" label="Potentiel" allowsSorting />
                                <Table.Head id="accl" label="Accl." allowsSorting />
                                <Table.Head id="effective" label="Effective" allowsSorting />
                                <Table.Head label="" />
                            </Table.Header>
                            <Table.Body items={sortedDrivers}>
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
                                            teamIdentityId={team?.team_identity_id ?? null}
                                            showDriverRank={!!driver.team_id && teamsWithRank.has(driver.team_id)}
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

            {/* Bulk delete dialog */}
            <BulkDeleteDialog
                count={selectedCount}
                entityLabel="pilote"
                isOpen={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                isPending={deleteDrivers.isPending}
                onConfirm={() => {
                    const ids = getSelectedIds(selectedKeys, allIds);
                    deleteDrivers.mutate(
                        { ids, seasonId },
                        {
                            onSuccess: () => {
                                setSelectedKeys(new Set());
                                setBulkDeleteOpen(false);
                            },
                        },
                    );
                }}
            />
        </div>
    );
}

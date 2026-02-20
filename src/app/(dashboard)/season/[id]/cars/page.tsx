"use client";

import { useCallback, useMemo, useState } from "react";
import type { Selection } from "react-aria-components";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Car01,
    Edit01,
    Plus,
    Trash02,
    Upload01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Select } from "@/components/base/select/select";
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
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { getSelectedCount } from "@/utils/selection";
import { CarForm } from "@/components/forms/car-form";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { useCars, useDeleteCar, useDeleteCars } from "@/hooks/use-cars";
import { useImportCars } from "@/hooks/use-import-cars";
import { useTeams } from "@/hooks/use-teams";
import { useEngineSuppliers } from "@/hooks/use-engine-suppliers";
import { useTableSort } from "@/hooks/use-table-sort";
import { carImportSchema, type CarImportValues } from "@/lib/validators/car-import";
import type { CarFormValues } from "@/lib/validators";
import type { Car, CarWithStats, TeamWithBudget, EngineSupplier } from "@/types";
import { getSuggestedMotor } from "@/lib/calculations/suggested-motor";

// ─── CreateCarDialog ────────────────────────────────────────────────────────

function CreateCarDialog({
    seasonId,
    teamsWithoutCar,
    supplierMap,
}: {
    seasonId: string;
    teamsWithoutCar: TeamWithBudget[];
    supplierMap: Map<string, EngineSupplier>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    const selectedTeam = teamsWithoutCar.find((t) => t.id === selectedTeamId);

    const teamItems = teamsWithoutCar.map((t) => ({
        id: t.id!,
        label: t.name!,
    }));

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) setSelectedTeamId(null);
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Button size="md" iconLeading={Plus} isDisabled={teamsWithoutCar.length === 0}>
                Nouvelle voiture
            </Button>
            <ModalOverlay>
                <Modal className="max-w-2xl">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Car01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Nouvelle voiture
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Configurer la voiture d&apos;une equipe.
                                    </p>
                                </div>
                            </div>

                            {/* Team selector */}
                            <div className="mb-6">
                                <Select
                                    label="Equipe"
                                    placeholder="Selectionner une equipe"
                                    items={teamItems}
                                    selectedKey={selectedTeamId}
                                    onSelectionChange={(key) => setSelectedTeamId(key as string)}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>
                            </div>

                            {selectedTeamId && selectedTeam ? (
                                <CarForm
                                    seasonId={seasonId}
                                    teamId={selectedTeamId}
                                    suggestedMotor={getSuggestedMotor(selectedTeam, supplierMap)}
                                    onSuccess={() => handleOpenChange(false)}
                                    onCancel={() => handleOpenChange(false)}
                                />
                            ) : (
                                <div className="flex justify-end gap-3">
                                    <Button size="md" color="secondary" onClick={() => handleOpenChange(false)}>
                                        Annuler
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── EditCarDialog ──────────────────────────────────────────────────────────

function EditCarDialog({
    seasonId,
    car,
    team,
    suggestedMotor,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    car: Car;
    team: TeamWithBudget | undefined;
    suggestedMotor: number | null;
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
                                    icon={Car01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier la voiture
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier la voiture de {team?.name ?? "l'equipe"}.
                                    </p>
                                </div>
                            </div>
                            <CarForm
                                seasonId={seasonId}
                                teamId={car.team_id}
                                car={car}
                                suggestedMotor={suggestedMotor}
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

// ─── DeleteCarDialog ────────────────────────────────────────────────────

function DeleteCarDialog({
    seasonId,
    car,
    teamName,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    car: CarWithStats;
    teamName: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteCar = useDeleteCar();

    const handleDelete = () => {
        deleteCar.mutate(
            { id: car.id!, seasonId },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <span className="hidden" />
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
                                Supprimer la voiture
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer la voiture de{" "}
                                <span className="font-medium text-primary">
                                    {teamName ?? "cette equipe"}
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
                                    isLoading={deleteCar.isPending}
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

// ─── BulkDeleteCarsDialog ───────────────────────────────────────────────

function BulkDeleteCarsDialog({
    seasonId,
    ids,
    isOpen,
    onOpenChange,
    onSuccess,
}: {
    seasonId: string;
    ids: string[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const deleteCars = useDeleteCars();

    const handleDelete = () => {
        deleteCars.mutate(
            { ids, seasonId },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    onSuccess();
                },
            },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <span className="hidden" />
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
                                Supprimer {ids.length} voiture{ids.length > 1 ? "s" : ""}
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Cette action est irreversible.
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
                                    isLoading={deleteCars.isPending}
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

// ─── CarRow ─────────────────────────────────────────────────────────────────

function CarRow({
    car,
    position,
    teamName,
    teamColor,
    onEdit,
    onDelete,
}: {
    car: CarWithStats;
    position: number;
    teamName: string | null;
    teamColor: string | null;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <Table.Row id={car.id!}>
            <Table.Cell>
                <span className="text-sm font-medium text-tertiary">{position}</span>
            </Table.Cell>
            <Table.Cell>
                <div className="flex items-center gap-3">
                    {teamColor && (
                        <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: teamColor }}
                        />
                    )}
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">
                            {teamName ?? "—"}
                        </p>
                        {car.engine_change_penalty && (
                            <Badge size="sm" color="warning" type="pill-color">
                                Chg. moteur
                            </Badge>
                        )}
                    </div>
                </div>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{car.motor}</span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{car.aero}</span>
            </Table.Cell>
            <Table.Cell>
                <div>
                    <span className="text-sm text-tertiary">{car.chassis}</span>
                    {car.engine_change_penalty && car.effective_chassis != null && (
                        <span className="ml-1 text-xs text-tertiary">
                            (eff: {car.effective_chassis})
                        </span>
                    )}
                </div>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm font-semibold text-primary">{car.total ?? "—"}</span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{car.speed ?? "—"}</span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{car.acceleration ?? "—"}</span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{car.grip ?? "—"}</span>
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
                            <Dropdown.Separator />
                            <Dropdown.Item id="delete" icon={Trash02}>
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

type CarImportResolved = CarFormValues & { team_id: string };

const carExampleJson = JSON.stringify(
    [
        {
            team: "Red Bull Racing",
            motor: 9,
            aero: 9,
            chassis: 8,
            engine_change_penalty: false,
        },
    ],
    null,
    2,
);

function buildCarFields(teamNames: string[]) {
    const teamDesc = teamNames.length > 0
        ? `Nom de l'equipe : ${teamNames.join(", ")}`
        : "Nom de l'equipe (aucune equipe sans voiture)";
    return [
        { name: "team", required: true, description: teamDesc },
        { name: "motor", required: true, description: "Note moteur (0–10)" },
        { name: "aero", required: true, description: "Note aero (0–10)" },
        { name: "chassis", required: true, description: "Note chassis (0–10)" },
        { name: "engine_change_penalty", required: false, description: "Penalite changement moteur (true/false)" },
    ];
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CarsPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: cars, isLoading, error } = useCars(seasonId);
    const { data: teams } = useTeams(seasonId);
    const { data: suppliers } = useEngineSuppliers(seasonId);
    const importCars = useImportCars();

    const [editingCar, setEditingCar] = useState<CarWithStats | null>(null);
    const [deletingCar, setDeletingCar] = useState<CarWithStats | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const selectedCount = getSelectedCount(selectedKeys, cars?.length ?? 0);

    const teamMap = useMemo(
        () => new Map(teams?.map((t) => [t.id, t]) ?? []),
        [teams],
    );

    const supplierMap = useMemo(
        () => new Map(suppliers?.map((s) => [s.id, s]) ?? []),
        [suppliers],
    );

    const teamsWithoutCar = useMemo(() => {
        const carTeamIds = new Set(cars?.map((c) => c.team_id) ?? []);
        return (teams ?? []).filter((t) => !carTeamIds.has(t.id));
    }, [teams, cars]);

    const carFields = useMemo(
        () => buildCarFields(teamsWithoutCar.map((t) => t.name).filter((n): n is string => !!n)),
        [teamsWithoutCar],
    );

    const resolveCars = useCallback(
        (items: CarImportValues[]) => {
            const nameToId = new Map(
                teamsWithoutCar.filter((t) => t.name).map((t) => [t.name!.toLowerCase(), t.id]),
            );
            const resolved: CarImportResolved[] = [];
            const errors: string[] = [];

            items.forEach((item, i) => {
                const { team, ...rest } = item;
                const id = nameToId.get(team.trim().toLowerCase());
                if (!id) {
                    errors.push(`Element ${i + 1} : equipe "${team}" introuvable ou a deja une voiture`);
                    return;
                }
                resolved.push({ ...rest, team_id: id });
            });

            return { resolved, errors };
        },
        [teamsWithoutCar],
    );

    const carColumns = useMemo(
        () => ({
            equipe: (c: CarWithStats) =>
                c.team_id ? teamMap.get(c.team_id)?.name ?? "" : "",
            moteur: (c: CarWithStats) => c.motor,
            aero: (c: CarWithStats) => c.aero,
            chassis: (c: CarWithStats) => c.chassis,
            total: (c: CarWithStats) => c.total,
            vitesse: (c: CarWithStats) => c.speed,
            grip: (c: CarWithStats) => c.grip,
            accel: (c: CarWithStats) => c.acceleration,
        }),
        [teamMap],
    );

    const { sortDescriptor, onSortChange, sortedItems: sortedCars } =
        useTableSort(cars ?? [], carColumns);

    if (isLoading) {
        return <PageLoading label="Chargement des voitures..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les voitures de cette saison."
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
                    { label: "Voitures" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Voitures</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {cars?.length ?? 0} voiture{(cars?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog<CarImportValues, CarImportResolved>
                        title="Importer des voitures"
                        description="Importez des voitures depuis un fichier JSON. Chaque voiture est associee a une equipe par son nom."
                        exampleData={carExampleJson}
                        fields={carFields}
                        schema={carImportSchema}
                        resolve={resolveCars}
                        onImport={(items) => importCars.mutate({ seasonId, rows: items })}
                        isPending={importCars.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateCarDialog
                        seasonId={seasonId}
                        teamsWithoutCar={teamsWithoutCar}
                        supplierMap={supplierMap}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {!cars || cars.length === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Car01}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Aucune voiture</EmptyState.Title>
                                <EmptyState.Description>
                                    Ajoutez votre premiere voiture pour configurer les performances.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateCarDialog
                                    seasonId={seasonId}
                                    teamsWithoutCar={teamsWithoutCar}
                                    supplierMap={supplierMap}
                                />
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
                                        iconLeading={Trash02}
                                        onClick={() => setBulkDeleteOpen(true)}
                                    >
                                        Supprimer
                                    </Button>
                                }
                            />
                        ) : (
                            <TableCard.Header
                                title="Voitures"
                                badge={String(cars.length)}
                                contentTrailing={
                                    <CreateCarDialog
                                        seasonId={seasonId}
                                        teamsWithoutCar={teamsWithoutCar}
                                        supplierMap={supplierMap}
                                    />
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
                                <Table.Head label="#" />
                                <Table.Head id="equipe" label="Equipe" isRowHeader allowsSorting />
                                <Table.Head id="moteur" label="Moteur" allowsSorting />
                                <Table.Head id="aero" label="Aero" allowsSorting />
                                <Table.Head id="chassis" label="Chassis" allowsSorting />
                                <Table.Head id="total" label="Total" allowsSorting />
                                <Table.Head id="vitesse" label="Vitesse" allowsSorting />
                                <Table.Head id="accel" label="Accel" allowsSorting />
                                <Table.Head id="grip" label="Grip" allowsSorting />
                                <Table.Head label="" />
                            </Table.Header>
                            <Table.Body items={sortedCars}>
                                {(car) => {
                                    const team = car.team_id
                                        ? teamMap.get(car.team_id)
                                        : undefined;
                                    const position = sortedCars.indexOf(car) + 1;
                                    return (
                                        <CarRow
                                            key={car.id}
                                            car={car}
                                            position={position}
                                            teamName={team?.name ?? null}
                                            teamColor={team?.color_primary ?? null}
                                            onEdit={() => setEditingCar(car)}
                                            onDelete={() => setDeletingCar(car)}
                                        />
                                    );
                                }}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                )}
            </div>

            {/* Edit modal */}
            {editingCar && (
                <EditCarDialog
                    seasonId={seasonId}
                    car={editingCar as Car}
                    team={editingCar.team_id ? teamMap.get(editingCar.team_id) : undefined}
                    suggestedMotor={
                        editingCar.team_id && teamMap.get(editingCar.team_id)
                            ? getSuggestedMotor(
                                  teamMap.get(editingCar.team_id)!,
                                  supplierMap,
                              )
                            : null
                    }
                    isOpen={!!editingCar}
                    onOpenChange={(open) => {
                        if (!open) setEditingCar(null);
                    }}
                />
            )}

            {/* Delete single car */}
            {deletingCar && (
                <DeleteCarDialog
                    seasonId={seasonId}
                    car={deletingCar}
                    teamName={deletingCar.team_id ? teamMap.get(deletingCar.team_id)?.name ?? null : null}
                    isOpen={!!deletingCar}
                    onOpenChange={(open) => {
                        if (!open) setDeletingCar(null);
                    }}
                />
            )}

            {/* Bulk delete cars */}
            <BulkDeleteCarsDialog
                seasonId={seasonId}
                ids={
                    selectedKeys === "all"
                        ? (cars ?? []).map((c) => c.id!).filter(Boolean)
                        : [...selectedKeys] as string[]
                }
                isOpen={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                onSuccess={() => setSelectedKeys(new Set())}
            />
        </div>
    );
}

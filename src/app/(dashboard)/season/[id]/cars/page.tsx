"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    Car01,
    Edit01,
    Plus,
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
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { CarForm } from "@/components/forms/car-form";
import { useCars } from "@/hooks/use-cars";
import { useTeams } from "@/hooks/use-teams";
import { useEngineSuppliers } from "@/hooks/use-engine-suppliers";
import type { Car, CarWithStats, TeamWithBudget, EngineSupplier } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSuggestedMotor(
    team: TeamWithBudget,
    supplierMap: Map<string, EngineSupplier>,
): number | null {
    if (!team.engine_supplier_id) return null;
    const supplier = supplierMap.get(team.engine_supplier_id);
    if (!supplier) return null;
    return team.is_factory_team ? supplier.note : supplier.note - 1;
}

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

// ─── CarRow ─────────────────────────────────────────────────────────────────

function CarRow({
    car,
    position,
    teamName,
    teamColor,
    onEdit,
}: {
    car: CarWithStats;
    position: number;
    teamName: string | null;
    teamColor: string | null;
    onEdit: () => void;
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
                <span className="text-sm text-tertiary">{car.grip ?? "—"}</span>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{car.acceleration ?? "—"}</span>
            </Table.Cell>
            <Table.Cell>
                <Dropdown.Root>
                    <Dropdown.DotsButton />
                    <Dropdown.Popover className="w-min">
                        <Dropdown.Menu
                            onAction={(key) => {
                                if (key === "edit") onEdit();
                            }}
                        >
                            <Dropdown.Item id="edit" icon={Edit01}>
                                <span className="pr-4">Modifier</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown.Root>
            </Table.Cell>
        </Table.Row>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CarsPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: cars, isLoading, error } = useCars(seasonId);
    const { data: teams } = useTeams(seasonId);
    const { data: suppliers } = useEngineSuppliers(seasonId);

    const [editingCar, setEditingCar] = useState<CarWithStats | null>(null);

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

    // Position map (cars already sorted by total desc)
    const positionMap = useMemo(
        () => new Map(cars?.map((c, i) => [c.id, i + 1]) ?? []),
        [cars],
    );

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
                <CreateCarDialog
                    seasonId={seasonId}
                    teamsWithoutCar={teamsWithoutCar}
                    supplierMap={supplierMap}
                />
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
                        <Table>
                            <Table.Header>
                                <Table.Head label="#" />
                                <Table.Head label="Equipe" isRowHeader />
                                <Table.Head label="Moteur" />
                                <Table.Head label="Aero" />
                                <Table.Head label="Chassis" />
                                <Table.Head label="Total" />
                                <Table.Head label="Vitesse" />
                                <Table.Head label="Grip" />
                                <Table.Head label="Accel" />
                                <Table.Head label="" />
                            </Table.Header>
                            <Table.Body items={cars}>
                                {(car) => {
                                    const team = car.team_id
                                        ? teamMap.get(car.team_id)
                                        : undefined;
                                    return (
                                        <CarRow
                                            key={car.id}
                                            car={car}
                                            position={positionMap.get(car.id!) ?? 0}
                                            teamName={team?.name ?? null}
                                            teamColor={team?.color_primary ?? null}
                                            onEdit={() => setEditingCar(car)}
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
        </div>
    );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit01,
    Plus,
    Trash01,
    Upload01,
    Users01,
} from "@untitledui/icons";
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
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { TeamForm } from "@/components/forms/team-form";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { useEngineSuppliers } from "@/hooks/use-engine-suppliers";
import { useImportTeams } from "@/hooks/use-import-teams";
import { useTeams, useDeleteTeam } from "@/hooks/use-teams";
import { teamImportSchema, type TeamImportValues } from "@/lib/validators/team-import";
import type { TeamFormValues } from "@/lib/validators";
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

// ─── Budget helpers ─────────────────────────────────────────────────────────

/** Base ~90 M€ + 12.5 M€ par point de budget (cap F1 ≈ 140 M€ pour 4 pts) */
const BUDGET_BASE = 90;
const BUDGET_PER_POINT = 12.5;

function formatBudgetEuros(budgetTotal: number | null): string {
    if (budgetTotal == null) return "—";
    const millions = BUDGET_BASE + budgetTotal * BUDGET_PER_POINT;
    return `${millions.toFixed(1)} M€`;
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
                    {formatBudgetEuros(team.budget_total)}
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

// ─── Import config ─────────────────────────────────────────────────────────

const teamExampleJson = JSON.stringify(
    [
        {
            name: "Red Bull Racing",
            short_name: "RBR",
            nationality: "AUT",
            color_primary: "#1E41FF",
            team_principal: "Christian Horner",
            technical_director: "Adrian Newey",
            engineer_level: 3,
            engine_supplier: "Honda",
            is_factory_team: false,
            shareholders: "Red Bull GmbH",
            owner_investment: 2,
            sponsor_investment: 2,
            surperformance_bonus: 1,
            title_sponsor: "Oracle",
            sponsor_duration: 3,
            sponsor_objective: "Top 3",
        },
    ],
    null,
    2,
);

function buildTeamFields(supplierNames: string[]) {
    const supplierDesc = supplierNames.length > 0
        ? `Nom du motoriste : ${supplierNames.join(", ")}`
        : "Nom du motoriste (aucun motoriste existant)";
    return [
        { name: "name", required: true, description: "Nom de l'equipe" },
        { name: "short_name", required: false, description: "Abreviation (5 car. max)" },
        { name: "nationality", required: false, description: "Code pays (GBR, FRA, ITA, NED...)" },
        { name: "color_primary", required: false, description: "Couleur principale (hex)" },
        { name: "color_secondary", required: false, description: "Couleur secondaire (hex)" },
        { name: "team_principal", required: false, description: "Directeur d'equipe" },
        { name: "technical_director", required: false, description: "Directeur technique" },
        { name: "engineer_level", required: false, description: "Niveau ingenieurs (1–3)" },
        { name: "engine_supplier", required: false, description: supplierDesc },
        { name: "is_factory_team", required: false, description: "Equipe usine (true/false)" },
        { name: "shareholders", required: false, description: "Actionnaires" },
        { name: "owner_investment", required: false, description: "Investissement proprietaire (0–2)" },
        { name: "sponsor_investment", required: false, description: "Investissement sponsor (0–2)" },
        { name: "surperformance_bonus", required: false, description: "Bonus surperformance (0+)" },
        { name: "title_sponsor", required: false, description: "Nom du sponsor titre" },
        { name: "sponsor_duration", required: false, description: "Duree du contrat sponsor (annees)" },
        { name: "sponsor_objective", required: false, description: "Objectif du sponsor" },
    ];
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeamsPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: teams, isLoading, error } = useTeams(seasonId);
    const { data: suppliers } = useEngineSuppliers(seasonId);
    const importTeams = useImportTeams();

    const [editingTeam, setEditingTeam] = useState<TeamWithBudget | null>(null);
    const [deletingTeam, setDeletingTeam] = useState<TeamWithBudget | null>(null);

    const supplierMap = useMemo(
        () => new Map(suppliers?.map((s) => [s.id, s]) ?? []),
        [suppliers],
    );

    const teamFields = useMemo(
        () => buildTeamFields((suppliers ?? []).map((s) => s.name)),
        [suppliers],
    );

    const resolveTeams = useCallback(
        (items: TeamImportValues[]) => {
            const nameToId = new Map(
                (suppliers ?? []).map((s) => [s.name.toLowerCase(), s.id]),
            );
            const resolved: TeamFormValues[] = [];
            const errors: string[] = [];

            items.forEach((item, i) => {
                const { engine_supplier, ...rest } = item;
                if (engine_supplier) {
                    const id = nameToId.get(engine_supplier.trim().toLowerCase());
                    if (!id) {
                        errors.push(`Element ${i + 1} : motoriste "${engine_supplier}" introuvable`);
                        return;
                    }
                    resolved.push({ ...rest, engine_supplier_id: id });
                } else {
                    resolved.push({ ...rest, engine_supplier_id: null });
                }
            });

            return { resolved, errors };
        },
        [suppliers],
    );

    if (isLoading) {
        return <PageLoading label="Chargement des equipes..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les equipes de cette saison."
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
                    { label: "Equipes" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Equipes</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {teams?.length ?? 0} equipe{(teams?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog<TeamImportValues, TeamFormValues>
                        title="Importer des equipes"
                        description="Importez des equipes depuis un fichier JSON."
                        exampleData={teamExampleJson}
                        fields={teamFields}
                        schema={teamImportSchema}
                        resolve={resolveTeams}
                        onImport={(items) => importTeams.mutate({ seasonId, rows: items })}
                        isPending={importTeams.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateTeamDialog seasonId={seasonId} />
                </div>
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

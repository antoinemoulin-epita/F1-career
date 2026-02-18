"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit01,
    Plus,
    Trash01,
    Users01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { StarRating } from "@/components/base/star-rating/star-rating";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { StaffForm } from "@/components/forms/staff-form";
import { useSeason } from "@/hooks/use-seasons";
import { useTeams } from "@/hooks/use-teams";
import { useStaff, useDeleteStaff, usePersonIdentities } from "@/hooks/use-staff";
import { staffRoleLabels } from "@/lib/validators/staff";
import type { StaffMember } from "@/types";

// ─── Types ──────────────────────────────────────────────────────────────────

type StaffWithPerson = StaffMember & {
    person: { id: string; first_name: string; last_name: string; nationality: string | null } | null;
};

// ─── CreateStaffDialog ──────────────────────────────────────────────────────

function CreateStaffDialog({
    seasonId,
    universeId,
    teams,
}: {
    seasonId: string;
    universeId: string;
    teams: Array<{ id: string; name: string }>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: persons } = usePersonIdentities(universeId);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Ajouter
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
                                        Ajouter un membre du staff
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Associer une personne a une equipe avec un role.
                                    </p>
                                </div>
                            </div>
                            <StaffForm
                                seasonId={seasonId}
                                persons={persons ?? []}
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

// ─── EditStaffDialog ────────────────────────────────────────────────────────

function EditStaffDialog({
    seasonId,
    universeId,
    teams,
    staff,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    universeId: string;
    teams: Array<{ id: string; name: string }>;
    staff: StaffMember;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data: persons } = usePersonIdentities(universeId);

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
                                        Modifier le membre
                                    </h2>
                                </div>
                            </div>
                            <StaffForm
                                seasonId={seasonId}
                                persons={persons ?? []}
                                teams={teams}
                                staff={staff}
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

// ─── DeleteStaffDialog ──────────────────────────────────────────────────────

function DeleteStaffDialog({
    seasonId,
    staff,
    personName,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    staff: StaffMember;
    personName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteStaff = useDeleteStaff();

    const handleDelete = () => {
        deleteStaff.mutate(
            { id: staff.id, seasonId },
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
                                Supprimer le membre
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">{personName}</span> du staff ?
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
                                    isLoading={deleteStaff.isPending}
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

// ─── StaffCard ──────────────────────────────────────────────────────────────

function StaffCard({
    staff,
    seasonYear,
    onEdit,
    onDelete,
}: {
    staff: StaffWithPerson;
    seasonYear?: number;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const personName = staff.person
        ? `${staff.person.first_name} ${staff.person.last_name}`
        : "—";

    const age = seasonYear && staff.birth_year ? seasonYear - staff.birth_year : null;

    return (
        <div className="flex items-center justify-between rounded-lg border border-secondary p-3">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary">{personName}</p>
                    {staff.note != null && (
                        <StarRating value={staff.note} size="sm" />
                    )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge size="sm" color="brand" type="pill-color">
                        {staffRoleLabels[staff.role] ?? staff.role}
                    </Badge>
                    {staff.person?.nationality && (
                        <span className="text-xs text-tertiary">{staff.person.nationality}</span>
                    )}
                    {age != null && (
                        <span className="text-xs text-tertiary">{age} ans</span>
                    )}
                    {staff.contract_years_remaining === 1 && (
                        <Badge size="sm" color="warning" type="pill-color">Dernier an</Badge>
                    )}
                    {staff.contract_years_remaining === 0 && (
                        <Badge size="sm" color="error" type="pill-color">Agent libre</Badge>
                    )}
                    {staff.is_retiring && (
                        <Badge size="sm" color="warning" type="pill-color">Retraite</Badge>
                    )}
                </div>
            </div>
            <div className="flex gap-1">
                <Button size="sm" color="tertiary" iconLeading={Edit01} onClick={onEdit} />
                <Button size="sm" color="tertiary-destructive" iconLeading={Trash01} onClick={onDelete} />
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StaffPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: season } = useSeason(seasonId);
    const { data: staffRaw, isLoading, error } = useStaff(seasonId);
    const { data: teamsRaw } = useTeams(seasonId);

    const [editingStaff, setEditingStaff] = useState<StaffWithPerson | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<StaffWithPerson | null>(null);

    const universeId = season?.universe_id ?? "";

    const teams = useMemo(
        () =>
            (teamsRaw ?? [])
                .filter((t): t is typeof t & { id: string; name: string } => t.id != null && t.name != null)
                .map((t) => ({ id: t.id, name: t.name })),
        [teamsRaw],
    );

    const teamNameMap = useMemo(
        () => new Map(teams.map((t) => [t.id, t.name])),
        [teams],
    );

    // Group staff by team
    const staffByTeam = useMemo(() => {
        const map = new Map<string, StaffWithPerson[]>();
        for (const s of (staffRaw ?? []) as StaffWithPerson[]) {
            const list = map.get(s.team_id) ?? [];
            list.push(s);
            map.set(s.team_id, list);
        }
        return map;
    }, [staffRaw]);

    if (isLoading) return <PageLoading label="Chargement du staff..." />;

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger le staff."
                backHref={`/season/${seasonId}`}
                backLabel="Retour a la saison"
            />
        );
    }

    const staffList = (staffRaw ?? []) as StaffWithPerson[];

    return (
        <div>
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Saison", href: `/season/${seasonId}` },
                        { label: "Staff" },
                    ]}
                />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Staff</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {staffList.length} membre{staffList.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <CreateStaffDialog seasonId={seasonId} universeId={universeId} teams={teams} />
            </div>

            <div className="mt-6">
                {staffList.length === 0 ? (
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
                                <EmptyState.Title>Aucun membre du staff</EmptyState.Title>
                                <EmptyState.Description>
                                    Ajoutez des membres du staff pour chaque equipe.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateStaffDialog seasonId={seasonId} universeId={universeId} teams={teams} />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {[...staffByTeam.entries()].map(([teamId, members]) => (
                            <div key={teamId}>
                                <h2 className="mb-3 text-md font-semibold text-primary">
                                    {teamNameMap.get(teamId) ?? teamId}
                                </h2>
                                <div className="space-y-2">
                                    {members.map((s) => (
                                        <StaffCard
                                            key={s.id}
                                            staff={s}
                                            seasonYear={season?.year}
                                            onEdit={() => setEditingStaff(s)}
                                            onDelete={() => setDeletingStaff(s)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingStaff && (
                <EditStaffDialog
                    seasonId={seasonId}
                    universeId={universeId}
                    teams={teams}
                    staff={editingStaff}
                    isOpen={!!editingStaff}
                    onOpenChange={(open) => { if (!open) setEditingStaff(null); }}
                />
            )}

            {deletingStaff && (
                <DeleteStaffDialog
                    seasonId={seasonId}
                    staff={deletingStaff}
                    personName={
                        deletingStaff.person
                            ? `${deletingStaff.person.first_name} ${deletingStaff.person.last_name}`
                            : "—"
                    }
                    isOpen={!!deletingStaff}
                    onOpenChange={(open) => { if (!open) setDeletingStaff(null); }}
                />
            )}
        </div>
    );
}

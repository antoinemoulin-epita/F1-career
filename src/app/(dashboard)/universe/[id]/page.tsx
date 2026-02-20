"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    AlertCircle,
    Calendar,
    ChevronRight,
    Edit05,
    Flag06,
    Globe02,
    HardDrive,
    Plus,
    Trash02,
} from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import {
    useUniverse,
    useUpdateUniverse,
    useDeleteUniverse,
} from "@/hooks/use-universes";
import { useSeasons, useCreateSeason } from "@/hooks/use-seasons";
import { createUniverseSchema } from "@/lib/validators";
import { cx } from "@/utils/cx";
import type { Season, SeasonStatus, Universe } from "@/types";

// ─── Status helpers ──────────────────────────────────────────────────────────

const statusColor: Record<SeasonStatus, "gray" | "brand" | "success"> = {
    preparation: "gray",
    active: "brand",
    completed: "success",
};

const statusLabel: Record<SeasonStatus, string> = {
    preparation: "Preparation",
    active: "Active",
    completed: "Completed",
};

// ─── SeasonCard ──────────────────────────────────────────────────────────────

function SeasonCard({
    season,
    isCurrent,
}: {
    season: Season;
    isCurrent: boolean;
}) {
    return (
        <Link href={`/season/${season.id}`}>
            <div
                className={cx(
                    "group rounded-xl border bg-primary p-5 transition duration-100 ease-linear hover:border-brand hover:shadow-sm",
                    isCurrent ? "border-brand" : "border-secondary",
                )}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary">
                            <Calendar className="size-5 text-fg-brand-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-md font-semibold text-primary transition duration-100 ease-linear group-hover:text-brand-secondary">
                                Season {season.year}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <BadgeWithDot
                                    size="sm"
                                    color={statusColor[season.status as SeasonStatus]}
                                    type="pill-color"
                                >
                                    {statusLabel[season.status as SeasonStatus]}
                                </BadgeWithDot>
                                {isCurrent && (
                                    <Badge size="sm" color="brand" type="pill-color">
                                        Current
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-brand-primary" />
                </div>

                {(season.gp_count != null ||
                    season.quali_laps != null ||
                    season.race_laps != null) && (
                    <div className="mt-4 flex items-center gap-3 text-sm text-tertiary">
                        {season.gp_count != null && (
                            <span className="flex items-center gap-1">
                                <Flag06 className="size-4 text-fg-quaternary" />
                                {season.gp_count} GPs
                            </span>
                        )}
                        {season.quali_laps != null && (
                            <span>{season.quali_laps} quali laps</span>
                        )}
                        {season.race_laps != null && (
                            <span>{season.race_laps} race laps</span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}

// ─── CreateSeasonDialog ──────────────────────────────────────────────────────

function CreateSeasonDialog({
    universeId,
    defaultYear,
}: {
    universeId: string;
    defaultYear: number;
}) {
    const createSeason = useCreateSeason();
    const [isOpen, setIsOpen] = useState(false);
    const [year, setYear] = useState(String(defaultYear));
    const [gpCount, setGpCount] = useState("");
    const [qualiLaps, setQualiLaps] = useState("");
    const [raceLaps, setRaceLaps] = useState("");
    const [error, setError] = useState("");

    const resetForm = () => {
        setYear(String(defaultYear));
        setGpCount("");
        setQualiLaps("");
        setRaceLaps("");
        setError("");
    };

    const handleSubmit = () => {
        const y = parseInt(year, 10);
        if (isNaN(y) || y < 1950 || y > 2100) {
            setError("Year must be between 1950 and 2100");
            return;
        }
        setError("");

        createSeason.mutate(
            {
                universe_id: universeId,
                year: y,
                gp_count: gpCount ? parseInt(gpCount, 10) : undefined,
                quali_laps: qualiLaps ? parseInt(qualiLaps, 10) : undefined,
                race_laps: raceLaps ? parseInt(raceLaps, 10) : undefined,
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) resetForm(); }}>
            <Button size="md" iconLeading={Plus}>
                New Season
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Calendar}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        New Season
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Add a new season to this universe.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Year"
                                    placeholder="2024"
                                    isRequired
                                    value={year}
                                    onChange={setYear}
                                    isInvalid={!!error}
                                    hint={error}
                                />
                                <Input
                                    label="GP Count"
                                    placeholder="22"
                                    value={gpCount}
                                    onChange={setGpCount}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Qualifying Laps"
                                        placeholder="3"
                                        value={qualiLaps}
                                        onChange={setQualiLaps}
                                    />
                                    <Input
                                        label="Race Laps"
                                        placeholder="50"
                                        value={raceLaps}
                                        onChange={setRaceLaps}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    size="md"
                                    color="secondary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="md"
                                    onClick={handleSubmit}
                                    isLoading={createSeason.isPending}
                                    isDisabled={!year.trim()}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── EditUniverseDialog ──────────────────────────────────────────────────────

function EditUniverseDialog({ universe }: { universe: Universe }) {
    const updateUniverse = useUpdateUniverse();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(universe.name);
    const [description, setDescription] = useState(universe.description ?? "");
    const [startYear, setStartYear] = useState(String(universe.start_year));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setName(universe.name);
        setDescription(universe.description ?? "");
        setStartYear(String(universe.start_year));
        setErrors({});
    };

    const handleSubmit = () => {
        const year = parseInt(startYear, 10);

        const result = createUniverseSchema.safeParse({
            name: name.trim(),
            description: description.trim() || undefined,
            start_year: isNaN(year) ? undefined : year,
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        updateUniverse.mutate(
            {
                id: universe.id,
                name: result.data.name,
                description: result.data.description ?? null,
                start_year: result.data.start_year,
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                },
            },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) resetForm(); }}>
            <Button size="sm" color="secondary" iconLeading={Edit05}>
                Edit
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Globe02}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Edit Universe
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Update your universe details.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Name"
                                    placeholder="My F1 Career"
                                    isRequired
                                    value={name}
                                    onChange={setName}
                                    isInvalid={!!errors.name}
                                    hint={errors.name}
                                />
                                <TextArea
                                    label="Description"
                                    placeholder="A brief description of your universe..."
                                    value={description}
                                    onChange={setDescription}
                                    rows={3}
                                />
                                <Input
                                    label="Start Year"
                                    placeholder="2024"
                                    isRequired
                                    value={startYear}
                                    onChange={setStartYear}
                                    isInvalid={!!errors.start_year}
                                    hint={errors.start_year}
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    size="md"
                                    color="secondary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="md"
                                    onClick={handleSubmit}
                                    isLoading={updateUniverse.isPending}
                                    isDisabled={!name.trim() || !startYear}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── DeleteUniverseDialog ────────────────────────────────────────────────────

function DeleteUniverseDialog({ universe }: { universe: Universe }) {
    const router = useRouter();
    const deleteUniverse = useDeleteUniverse();
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = () => {
        deleteUniverse.mutate(universe.id, {
            onSuccess: () => {
                router.push("/");
            },
        });
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="sm" color="tertiary-destructive" iconLeading={Trash02}>
                Delete
            </Button>
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
                                Delete universe
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-primary">
                                    {universe.name}
                                </span>
                                ? This action cannot be undone. All seasons and data
                                associated with this universe will be permanently removed.
                            </p>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    size="md"
                                    color="secondary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="md"
                                    color="primary-destructive"
                                    onClick={handleDelete}
                                    isLoading={deleteUniverse.isPending}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UniverseDetailPage() {
    const params = useParams<{ id: string }>();
    const {
        data: universe,
        isLoading: universeLoading,
        error: universeError,
    } = useUniverse(params.id);
    const { data: seasons, isLoading: seasonsLoading } = useSeasons(params.id);
    const isLoading = universeLoading || seasonsLoading;

    // Calculate default year for new season
    const defaultYear =
        seasons && seasons.length > 0
            ? Math.max(...seasons.map((s) => s.year)) + 1
            : (universe?.start_year ?? 2024);

    if (isLoading) return <PageLoading label="Chargement de l'univers..." />;

    if (universeError || !universe) {
        return (
            <PageError
                title="Univers introuvable"
                description="Cet univers n'existe pas ou vous n'y avez pas acces."
                backHref="/"
                backLabel="Retour aux univers"
            />
        );
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Univers", href: "/universe" },
                        { label: universe.name },
                    ]}
                />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-secondary">
                        <Globe02 className="size-6 text-fg-brand-primary" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-display-sm font-semibold text-primary">
                            {universe.name}
                        </h1>
                        {universe.description && (
                            <p className="mt-1 text-md text-tertiary">
                                {universe.description}
                            </p>
                        )}
                        <div className="mt-3">
                            <Badge size="sm" color="brand" type="pill-color">
                                Year {universe.start_year}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <EditUniverseDialog universe={universe} />
                    <DeleteUniverseDialog universe={universe} />
                </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-secondary" />

            {/* Rookie pool link */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Pool Rookies</h2>
                    <p className="mt-0.5 text-sm text-tertiary">
                        Gerez les jeunes pilotes disponibles au recrutement.
                    </p>
                </div>
                <Button size="md" color="secondary" href={`/universe/${universe.id}/rookies`}>
                    Voir le pool
                </Button>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-secondary" />

            {/* Staff pool link */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Pool Staff</h2>
                    <p className="mt-0.5 text-sm text-tertiary">
                        Gerez les directeurs et ingenieurs disponibles au recrutement.
                    </p>
                </div>
                <Button size="md" color="secondary" href={`/universe/${universe.id}/staff-pool`}>
                    Voir le pool
                </Button>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-secondary" />

            {/* Narrative arcs link */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Arcs narratifs</h2>
                    <p className="mt-0.5 text-sm text-tertiary">
                        Gerez les storylines de votre univers.
                    </p>
                </div>
                <Button size="md" color="secondary" href={`/universe/${universe.id}/arcs`}>
                    Voir les arcs
                </Button>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-secondary" />

            {/* Regulations link */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Reglementations</h2>
                    <p className="mt-0.5 text-sm text-tertiary">
                        Gerez les changements reglementaires et les resets de voitures.
                    </p>
                </div>
                <Button size="md" color="secondary" href={`/universe/${universe.id}/regulations`}>
                    Voir les reglementations
                </Button>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-secondary" />

            {/* Backup link */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Backup</h2>
                    <p className="mt-0.5 text-sm text-tertiary">
                        Exportez ou importez les donnees de votre univers.
                    </p>
                </div>
                <Button size="md" color="secondary" href={`/universe/${universe.id}/backup`}>
                    Gerer
                </Button>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-secondary" />

            {/* Palmares link */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Palmares</h2>
                    <p className="mt-0.5 text-sm text-tertiary">
                        Gerez l&apos;historique des champions du monde.
                    </p>
                </div>
                <Button size="md" color="secondary" href={`/universe/${universe.id}/champions`}>
                    Voir le palmares
                </Button>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-secondary" />

            {/* Seasons section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-primary">Seasons</h2>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {seasons?.length ?? 0} season{(seasons?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <CreateSeasonDialog
                    universeId={universe.id}
                    defaultYear={defaultYear}
                />
            </div>

            <div className="mt-6">
                {!seasons || seasons.length === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Calendar}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>No seasons yet</EmptyState.Title>
                                <EmptyState.Description>
                                    Create your first season to start tracking races and
                                    results.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateSeasonDialog
                                    universeId={universe.id}
                                    defaultYear={defaultYear}
                                />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {seasons.map((season) => (
                            <SeasonCard
                                key={season.id}
                                season={season}
                                isCurrent={season.id === universe.current_season_id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

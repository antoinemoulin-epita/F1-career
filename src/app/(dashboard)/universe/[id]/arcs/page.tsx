"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    CheckCircle,
    Edit05,
    Plus,
    Trash02,
    Upload01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { TextArea } from "@/components/base/textarea/textarea";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { Tabs } from "@/components/application/tabs/tabs";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { ArcForm } from "@/components/forms/arc-form";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { useImportArcs } from "@/hooks/use-import-arcs";
import { useAllNarrativeArcs, useUpdateArc, useDeleteArc } from "@/hooks/use-narrative-arcs";
import { useUniverse } from "@/hooks/use-universes";
import {
    arcTypeLabels,
    arcTypeBadgeColor,
    arcStatusLabels,
    arcStatusColor,
} from "@/lib/constants/arc-labels";
import { narrativeArcSchema } from "@/lib/validators";
import type { NarrativeArc } from "@/types";

// ─── ArcCard ────────────────────────────────────────────────────────────────

function ArcCard({
    arc,
    onEdit,
    onResolve,
    onDelete,
}: {
    arc: NarrativeArc;
    onEdit: () => void;
    onResolve: () => void;
    onDelete: () => void;
}) {
    const typeKey = arc.arc_type ?? "other";
    const statusKey = arc.status ?? "signal";
    const importance = arc.importance ?? 0;

    return (
        <div className="rounded-xl border border-secondary bg-primary p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary">{arc.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge
                            size="sm"
                            color={arcTypeBadgeColor[typeKey] ?? "gray"}
                            type="pill-color"
                        >
                            {arcTypeLabels[typeKey] ?? typeKey}
                        </Badge>
                        <Badge
                            size="sm"
                            color={arcStatusColor[statusKey] ?? "gray"}
                            type="pill-color"
                        >
                            {arcStatusLabels[statusKey] ?? statusKey}
                        </Badge>
                        {arc.has_branches && (
                            <Badge size="sm" color="purple" type="pill-color">
                                [?]
                            </Badge>
                        )}
                    </div>
                    {arc.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-tertiary">
                            {arc.description}
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <div
                        className="text-sm text-tertiary"
                        title={`Importance : ${importance}/5`}
                    >
                        {Array.from({ length: 5 }, (_, i) => (
                            <span
                                key={i}
                                className={
                                    i < importance
                                        ? "text-warning-primary"
                                        : "text-quaternary"
                                }
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <Dropdown.Root>
                        <Dropdown.DotsButton />
                        <Dropdown.Popover>
                            <Dropdown.Menu
                                onAction={(key) => {
                                    if (key === "edit") onEdit();
                                    if (key === "resolve") onResolve();
                                    if (key === "delete") onDelete();
                                }}
                            >
                                <Dropdown.Item id="edit" icon={Edit05} label="Modifier" />
                                {arc.status !== "resolved" && (
                                    <Dropdown.Item
                                        id="resolve"
                                        icon={CheckCircle}
                                        label="Resoudre"
                                    />
                                )}
                                <Dropdown.Separator />
                                <Dropdown.Item id="delete" icon={Trash02} label="Supprimer" />
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                </div>
            </div>
        </div>
    );
}

// ─── CreateArcDialog ────────────────────────────────────────────────────────

function CreateArcDialog({ universeId }: { universeId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouvel arc
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Plus}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Nouvel arc narratif
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajoutez une nouvelle storyline a votre univers.
                                    </p>
                                </div>
                            </div>
                            <ArcForm
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

// ─── EditArcDialog ──────────────────────────────────────────────────────────

function EditArcDialog({
    universeId,
    arc,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    arc: NarrativeArc;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            {/* No trigger button — controlled externally */}
            <span className="hidden" />
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Edit05}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier l&apos;arc
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifiez les details de cet arc narratif.
                                    </p>
                                </div>
                            </div>
                            <ArcForm
                                universeId={universeId}
                                arc={arc}
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

// ─── ResolveArcDialog ───────────────────────────────────────────────────────

function ResolveArcDialog({
    universeId,
    arc,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    arc: NarrativeArc;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const updateArc = useUpdateArc();
    const [summary, setSummary] = useState("");

    const handleResolve = () => {
        updateArc.mutate(
            {
                id: arc.id,
                universeId,
                form: {
                    status: "resolved",
                    resolution_summary: summary,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setSummary("");
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
                                    icon={CheckCircle}
                                    color="success"
                                    theme="light"
                                    size="md"
                                />
                            </div>
                            <h2 className="text-lg font-semibold text-primary">
                                Resoudre l&apos;arc
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Marquer{" "}
                                <span className="font-medium text-primary">
                                    {arc.name}
                                </span>{" "}
                                comme resolu.
                            </p>

                            <div className="mt-4">
                                <TextArea
                                    label="Resume de la resolution"
                                    placeholder="Comment cet arc s'est resolu..."
                                    value={summary}
                                    onChange={setSummary}
                                    rows={3}
                                />
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
                                    onClick={handleResolve}
                                    isLoading={updateArc.isPending}
                                >
                                    Resoudre
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── DeleteArcDialog ────────────────────────────────────────────────────────

function DeleteArcDialog({
    universeId,
    arc,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    arc: NarrativeArc;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteArc = useDeleteArc();

    const handleDelete = () => {
        deleteArc.mutate(
            { id: arc.id, universeId },
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
                                Supprimer l&apos;arc
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {arc.name}
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
                                    isLoading={deleteArc.isPending}
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

// ─── Import config ─────────────────────────────────────────────────────────

const arcExampleJson = JSON.stringify(
    [
        {
            name: "Rivalite Hamilton / Verstappen",
            description: "Duel au sommet pour le titre",
            arc_type: "rivalry",
            status: "developing",
            importance: 4,
        },
    ],
    null,
    2,
);

const arcFields = [
    { name: "name", required: true, description: "Nom de l'arc" },
    { name: "description", required: false, description: "Description de l'arc" },
    {
        name: "arc_type",
        required: true,
        description:
            "Type : transfer, rivalry, technical, sponsor, entry_exit, drama, regulation, other",
    },
    {
        name: "status",
        required: true,
        description: "Statut : signal, developing, confirmed, resolved",
    },
    { name: "importance", required: true, description: "1 (Mineur) a 5 (Majeur)" },
    { name: "related_driver_ids", required: false, description: "Tableau d'IDs de pilotes" },
    { name: "related_team_ids", required: false, description: "Tableau d'IDs d'equipes" },
    { name: "resolution_summary", required: false, description: "Resume de la resolution" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ArcsPage() {
    const params = useParams<{ id: string }>();
    const universeId = params.id;

    const { data: universe, isLoading: universeLoading, error: universeError } = useUniverse(universeId);
    const { data: arcs, isLoading: arcsLoading, error: arcsError } = useAllNarrativeArcs(universeId);
    const importArcs = useImportArcs();

    const [editingArc, setEditingArc] = useState<NarrativeArc | null>(null);
    const [resolvingArc, setResolvingArc] = useState<NarrativeArc | null>(null);
    const [deletingArc, setDeletingArc] = useState<NarrativeArc | null>(null);

    const isLoading = universeLoading || arcsLoading;

    const { activeArcs, resolvedArcs } = useMemo(() => {
        const all = arcs ?? [];
        return {
            activeArcs: all.filter((a) => a.status !== "resolved"),
            resolvedArcs: all.filter((a) => a.status === "resolved"),
        };
    }, [arcs]);

    if (isLoading) {
        return <PageLoading label="Chargement des arcs..." />;
    }

    if (universeError || arcsError || !universe) {
        return <PageError title="Erreur de chargement" backHref="/" backLabel="Retour" />;
    }

    const total = arcs?.length ?? 0;

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Univers", href: `/universe/${universeId}` },
                    { label: "Arcs narratifs" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Arcs narratifs
                    </h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {total} arc{total !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog
                        title="Importer des arcs"
                        description="Importez des arcs narratifs depuis un fichier JSON."
                        exampleData={arcExampleJson}
                        fields={arcFields}
                        schema={narrativeArcSchema}
                        onImport={(items) => importArcs.mutate({ universeId, rows: items })}
                        isPending={importArcs.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateArcDialog universeId={universeId} />
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {total === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Plus}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>
                                    Aucun arc narratif
                                </EmptyState.Title>
                                <EmptyState.Description>
                                    Creez votre premier arc pour suivre les storylines de votre
                                    univers.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateArcDialog universeId={universeId} />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <Tabs defaultSelectedKey="active">
                        <Tabs.List
                            type="button-gray"
                            size="sm"
                            items={[
                                {
                                    id: "active",
                                    label: `Actifs (${activeArcs.length})`,
                                },
                                {
                                    id: "resolved",
                                    label: `Resolus (${resolvedArcs.length})`,
                                },
                                {
                                    id: "all",
                                    label: `Tous (${total})`,
                                },
                            ]}
                        />

                        <Tabs.Panel id="active" className="pt-6">
                            <ArcList
                                arcs={activeArcs}
                                onEdit={setEditingArc}
                                onResolve={setResolvingArc}
                                onDelete={setDeletingArc}
                            />
                        </Tabs.Panel>

                        <Tabs.Panel id="resolved" className="pt-6">
                            <ArcList
                                arcs={resolvedArcs}
                                onEdit={setEditingArc}
                                onResolve={setResolvingArc}
                                onDelete={setDeletingArc}
                            />
                        </Tabs.Panel>

                        <Tabs.Panel id="all" className="pt-6">
                            <ArcList
                                arcs={arcs ?? []}
                                onEdit={setEditingArc}
                                onResolve={setResolvingArc}
                                onDelete={setDeletingArc}
                            />
                        </Tabs.Panel>
                    </Tabs>
                )}
            </div>

            {/* Edit dialog */}
            {editingArc && (
                <EditArcDialog
                    universeId={universeId}
                    arc={editingArc}
                    isOpen={!!editingArc}
                    onOpenChange={(open) => {
                        if (!open) setEditingArc(null);
                    }}
                />
            )}

            {/* Resolve dialog */}
            {resolvingArc && (
                <ResolveArcDialog
                    universeId={universeId}
                    arc={resolvingArc}
                    isOpen={!!resolvingArc}
                    onOpenChange={(open) => {
                        if (!open) setResolvingArc(null);
                    }}
                />
            )}

            {/* Delete dialog */}
            {deletingArc && (
                <DeleteArcDialog
                    universeId={universeId}
                    arc={deletingArc}
                    isOpen={!!deletingArc}
                    onOpenChange={(open) => {
                        if (!open) setDeletingArc(null);
                    }}
                />
            )}
        </div>
    );
}

// ─── ArcList ────────────────────────────────────────────────────────────────

function ArcList({
    arcs,
    onEdit,
    onResolve,
    onDelete,
}: {
    arcs: NarrativeArc[];
    onEdit: (arc: NarrativeArc) => void;
    onResolve: (arc: NarrativeArc) => void;
    onDelete: (arc: NarrativeArc) => void;
}) {
    if (arcs.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-tertiary">
                Aucun arc dans cette categorie.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {arcs.map((arc) => (
                <ArcCard
                    key={arc.id}
                    arc={arc}
                    onEdit={() => onEdit(arc)}
                    onResolve={() => onResolve(arc)}
                    onDelete={() => onDelete(arc)}
                />
            ))}
        </div>
    );
}

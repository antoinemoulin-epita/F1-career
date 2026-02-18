"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit05,
    Plus,
    Trash02,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { RegulationForm } from "@/components/forms/regulation-form";
import { useUniverse } from "@/hooks/use-universes";
import { useRegulations, useDeleteRegulation } from "@/hooks/use-regulations";
import { calculateResetResult } from "@/lib/calculations/reset";
import type { Regulation, ResetType } from "@/types";

// ─── Reset type labels ──────────────────────────────────────────────────────

const resetTypeLabels: Record<string, string> = {
    critical: "Critique",
    important: "Important",
    partial: "Partiel",
};

const resetTypeBadgeColor: Record<string, "error" | "warning" | "brand"> = {
    critical: "error",
    important: "warning",
    partial: "brand",
};

// ─── CreateRegulationDialog ─────────────────────────────────────────────────

function CreateRegulationDialog({ universeId }: { universeId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouvelle reglementation
            </Button>
            <ModalOverlay>
                <Modal className="max-w-2xl">
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
                                        Nouvelle reglementation
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajoutez un changement reglementaire a cet univers.
                                    </p>
                                </div>
                            </div>
                            <RegulationForm
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

// ─── EditRegulationDialog ───────────────────────────────────────────────────

function EditRegulationDialog({
    universeId,
    regulation,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    regulation: Regulation;
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
                                    icon={Edit05}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier la reglementation
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier {regulation.name}.
                                    </p>
                                </div>
                            </div>
                            <RegulationForm
                                universeId={universeId}
                                regulation={regulation}
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

// ─── DeleteRegulationDialog ─────────────────────────────────────────────────

function DeleteRegulationDialog({
    universeId,
    regulation,
    isOpen,
    onOpenChange,
}: {
    universeId: string;
    regulation: Regulation;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteRegulation = useDeleteRegulation();

    const handleDelete = () => {
        deleteRegulation.mutate(
            { id: regulation.id, universeId },
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
                                Supprimer la reglementation
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {regulation.name}
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
                                    isLoading={deleteRegulation.isPending}
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

// ─── ResetGuide ─────────────────────────────────────────────────────────────

function ResetGuide() {
    const types: ("critical" | "important" | "partial")[] = ["critical", "important", "partial"];

    return (
        <div className="rounded-xl border border-secondary p-5">
            <h3 className="mb-3 text-md font-semibold text-primary">Guide de reset</h3>
            <p className="mb-4 text-sm text-tertiary">
                Lors d'un changement reglementaire, la progression des voitures est reinitialise selon le type de reset.
                Si la progression de la voiture est ≥ 2, un bonus de +1 est applique.
            </p>
            <div className="grid grid-cols-3 gap-3">
                {types.map((type) => {
                    const base = calculateResetResult(type, 0);
                    const withBonus = calculateResetResult(type, 2);
                    return (
                        <div key={type} className="rounded-lg border border-secondary p-3">
                            <Badge size="sm" color={base.color} type="pill-color">
                                {base.label}
                            </Badge>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-tertiary">Base</span>
                                    <span className="font-medium text-primary">{base.rangeMin}–{base.rangeMax}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-tertiary">Avec bonus</span>
                                    <span className="font-medium text-primary">{withBonus.rangeMin}–{withBonus.rangeMax}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RegulationsPage() {
    const params = useParams<{ id: string }>();
    const universeId = params.id;

    const { data: universe, isLoading: universeLoading, error: universeError } = useUniverse(universeId);
    const { data: regulations, isLoading: regLoading, error: regError } = useRegulations(universeId);

    const [editingReg, setEditingReg] = useState<Regulation | null>(null);
    const [deletingReg, setDeletingReg] = useState<Regulation | null>(null);

    const isLoading = universeLoading || regLoading;

    if (isLoading) return <PageLoading label="Chargement des reglementations..." />;

    if (universeError || regError || !universe) {
        return <PageError title="Erreur de chargement" backHref="/" backLabel="Retour" />;
    }

    const total = regulations?.length ?? 0;

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Univers", href: `/universe/${universeId}` },
                    { label: "Reglementations" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Reglementations
                    </h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {total} reglementation{total !== 1 ? "s" : ""}
                    </p>
                </div>
                <CreateRegulationDialog universeId={universeId} />
            </div>

            {/* Reset guide */}
            <div className="mt-6">
                <ResetGuide />
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
                                <EmptyState.Title>Aucune reglementation</EmptyState.Title>
                                <EmptyState.Description>
                                    Ajoutez un changement reglementaire pour suivre les resets de voitures.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateRegulationDialog universeId={universeId} />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {(regulations ?? []).map((reg) => {
                            const typeKey = reg.reset_type ?? "partial";
                            const domains: string[] = [];
                            if (reg.affects_aero) domains.push("Aero");
                            if (reg.affects_chassis) domains.push("Chassis");
                            if (reg.affects_motor) domains.push("Moteur");

                            return (
                                <div key={reg.id} className="rounded-xl border border-secondary bg-primary p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-primary">{reg.name}</p>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                <Badge size="sm" color="gray" type="pill-color">
                                                    {reg.effective_year}
                                                </Badge>
                                                <Badge
                                                    size="sm"
                                                    color={resetTypeBadgeColor[typeKey] ?? "brand"}
                                                    type="pill-color"
                                                >
                                                    {resetTypeLabels[typeKey] ?? typeKey}
                                                </Badge>
                                                {domains.length > 0 && (
                                                    <Badge size="sm" color="gray" type="modern">
                                                        {domains.join(", ")}
                                                    </Badge>
                                                )}
                                            </div>
                                            {reg.description && (
                                                <p className="mt-2 line-clamp-2 text-sm text-tertiary">
                                                    {reg.description}
                                                </p>
                                            )}
                                        </div>
                                        <Dropdown.Root>
                                            <Dropdown.DotsButton />
                                            <Dropdown.Popover className="w-min">
                                                <Dropdown.Menu
                                                    onAction={(key) => {
                                                        if (key === "edit") setEditingReg(reg);
                                                        if (key === "delete") setDeletingReg(reg);
                                                    }}
                                                >
                                                    <Dropdown.Item id="edit" icon={Edit05}>
                                                        <span className="pr-4">Modifier</span>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item id="delete" icon={Trash02}>
                                                        <span className="pr-4">Supprimer</span>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown.Popover>
                                        </Dropdown.Root>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit dialog */}
            {editingReg && (
                <EditRegulationDialog
                    universeId={universeId}
                    regulation={editingReg}
                    isOpen={!!editingReg}
                    onOpenChange={(open) => { if (!open) setEditingReg(null); }}
                />
            )}

            {/* Delete dialog */}
            {deletingReg && (
                <DeleteRegulationDialog
                    universeId={universeId}
                    regulation={deletingReg}
                    isOpen={!!deletingReg}
                    onOpenChange={(open) => { if (!open) setDeletingReg(null); }}
                />
            )}
        </div>
    );
}

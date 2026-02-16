"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit01,
    Plus,
    Trash01,
    Tool01,
    Upload01,
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
import { EngineSupplierForm } from "@/components/forms/engine-supplier-form";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { useEngineSuppliers, useDeleteEngineSupplier } from "@/hooks/use-engine-suppliers";
import { useImportEngineSuppliers } from "@/hooks/use-import-engine-suppliers";
import { engineSupplierSchema } from "@/lib/validators";
import type { EngineSupplier } from "@/types";

// ─── Investment level display ────────────────────────────────────────────────

const investmentLabel: Record<number, string> = {
    1: "\u2605",
    2: "\u2605\u2605",
    3: "\u2605\u2605\u2605",
};

// ─── CreateDialog ────────────────────────────────────────────────────────────

function CreateSupplierDialog({ seasonId }: { seasonId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouveau motoriste
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Tool01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Nouveau motoriste
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajouter un fournisseur moteur a cette saison.
                                    </p>
                                </div>
                            </div>
                            <EngineSupplierForm
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

// ─── EditDialog ──────────────────────────────────────────────────────────────

function EditSupplierDialog({
    seasonId,
    supplier,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    supplier: EngineSupplier;
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
                                    icon={Tool01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Modifier le motoriste
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Modifier les informations de {supplier.name}.
                                    </p>
                                </div>
                            </div>
                            <EngineSupplierForm
                                seasonId={seasonId}
                                supplier={supplier}
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

// ─── DeleteDialog ────────────────────────────────────────────────────────────

function DeleteSupplierDialog({
    seasonId,
    supplier,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    supplier: EngineSupplier;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteSupplier = useDeleteEngineSupplier();

    const handleDelete = () => {
        deleteSupplier.mutate(
            { id: supplier.id, seasonId },
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
                                Supprimer le motoriste
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {supplier.name}
                                </span>
                                ? Les equipes liees perdront leur fournisseur moteur.
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
                                    isLoading={deleteSupplier.isPending}
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

// ─── SupplierRow ─────────────────────────────────────────────────────────────

function SupplierRow({
    supplier,
    onEdit,
    onDelete,
}: {
    supplier: EngineSupplier;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <Table.Row id={supplier.id}>
            <Table.Cell>
                <p className="text-sm font-medium text-primary">{supplier.name}</p>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">{supplier.nationality ?? "—"}</span>
            </Table.Cell>
            <Table.Cell>
                <Badge size="sm" color={supplier.note >= 7 ? "success" : supplier.note >= 4 ? "brand" : "warning"} type="pill-color">
                    {supplier.note}/10
                </Badge>
            </Table.Cell>
            <Table.Cell>
                <span className="text-sm text-tertiary">
                    {investmentLabel[supplier.investment_level ?? 2] ?? "—"}
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

const supplierExampleJson = JSON.stringify(
    [
        {
            name: "Mercedes",
            nationality: "GER",
            note: 8,
            investment_level: 3,
        },
        {
            name: "Ferrari",
            nationality: "ITA",
            note: 7,
            investment_level: 3,
        },
    ],
    null,
    2,
);

const supplierFields = [
    { name: "name", required: true, description: "Nom du motoriste" },
    { name: "nationality", required: false, description: "Code pays (GBR, FRA, ITA, GER, JPN...)" },
    { name: "note", required: true, description: "Note (0–10)" },
    { name: "investment_level", required: true, description: "Niveau d'investissement (1–3)" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EngineSuppliersPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: suppliers, isLoading, error } = useEngineSuppliers(seasonId);
    const importSuppliers = useImportEngineSuppliers();

    const [editingSupplier, setEditingSupplier] = useState<EngineSupplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<EngineSupplier | null>(null);

    if (isLoading) {
        return <PageLoading label="Chargement des motoristes..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les motoristes de cette saison."
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
                    { label: "Motoristes" },
                ]} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Motoristes</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {suppliers?.length ?? 0} motoriste{(suppliers?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportJsonDialog
                        title="Importer des motoristes"
                        description="Importez des motoristes depuis un fichier JSON."
                        exampleData={supplierExampleJson}
                        fields={supplierFields}
                        schema={engineSupplierSchema}
                        onImport={(items) => importSuppliers.mutate({ seasonId, rows: items })}
                        isPending={importSuppliers.isPending}
                        trigger={
                            <Button size="md" color="secondary" iconLeading={Upload01}>
                                Importer
                            </Button>
                        }
                    />
                    <CreateSupplierDialog seasonId={seasonId} />
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {!suppliers || suppliers.length === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Tool01}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Aucun motoriste</EmptyState.Title>
                                <EmptyState.Description>
                                    Ajoutez vos premiers motoristes avant de configurer les equipes.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateSupplierDialog seasonId={seasonId} />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <TableCard.Root>
                        <TableCard.Header
                            title="Motoristes"
                            badge={String(suppliers.length)}
                            contentTrailing={<CreateSupplierDialog seasonId={seasonId} />}
                        />
                        <Table>
                            <Table.Header>
                                <Table.Head label="Nom" isRowHeader />
                                <Table.Head label="Nationalite" />
                                <Table.Head label="Note" />
                                <Table.Head label="Investissement" />
                                <Table.Head label="" />
                            </Table.Header>
                            <Table.Body items={suppliers}>
                                {(supplier) => (
                                    <SupplierRow
                                        key={supplier.id}
                                        supplier={supplier}
                                        onEdit={() => setEditingSupplier(supplier)}
                                        onDelete={() => setDeletingSupplier(supplier)}
                                    />
                                )}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                )}
            </div>

            {/* Edit modal */}
            {editingSupplier && (
                <EditSupplierDialog
                    seasonId={seasonId}
                    supplier={editingSupplier}
                    isOpen={!!editingSupplier}
                    onOpenChange={(open) => { if (!open) setEditingSupplier(null); }}
                />
            )}

            {/* Delete modal */}
            {deletingSupplier && (
                <DeleteSupplierDialog
                    seasonId={seasonId}
                    supplier={deletingSupplier}
                    isOpen={!!deletingSupplier}
                    onOpenChange={(open) => { if (!open) setDeletingSupplier(null); }}
                />
            )}
        </div>
    );
}

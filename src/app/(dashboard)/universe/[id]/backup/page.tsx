"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Download01,
    Upload01,
    File06,
    XClose,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { useUniverse } from "@/hooks/use-universes";
import { useExportUniverse, useImportUniverse, parseBackupFile } from "@/hooks/use-backup";
import type { UniverseExportData } from "@/lib/import/json-schema";
import type { ImportResult } from "@/lib/import/json-import";

export default function BackupPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data: universe, isLoading, error } = useUniverse(params.id);
    const exportMutation = useExportUniverse();
    const importMutation = useImportUniverse();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<UniverseExportData | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const handleExport = () => {
        if (!universe) return;
        exportMutation.mutate({ universeId: universe.id, universeName: universe.name });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParseError(null);
        setPreview(null);
        setImportResult(null);

        try {
            const data = await parseBackupFile(file);
            setPreview(data);
        } catch (err) {
            setParseError(err instanceof Error ? err.message : "Failed to parse file");
        }

        // Reset file input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleImport = () => {
        if (!preview) return;
        importMutation.mutate(preview, {
            onSuccess: (result) => {
                setImportResult(result);
                setPreview(null);
            },
        });
    };

    const handleCancelPreview = () => {
        setPreview(null);
        setParseError(null);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Loading..." />
            </div>
        );
    }

    if (error || !universe) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon icon={AlertCircle} color="error" theme="light" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Universe not found</EmptyState.Title>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href="/" size="md" color="secondary" iconLeading={ArrowLeft}>
                            Back to universes
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button
                    color="link-gray"
                    size="sm"
                    iconLeading={ArrowLeft}
                    href={`/universe/${universe.id}`}
                >
                    Back to universe
                </Button>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-display-sm font-semibold text-primary">Backup & Import</h1>
                <p className="mt-1 text-md text-tertiary">
                    Exportez ou importez les donnees de votre univers.
                </p>
            </div>

            {/* Export section */}
            <div className="rounded-xl border border-secondary bg-primary p-6">
                <div className="flex items-start gap-4">
                    <FeaturedIcon icon={Download01} color="brand" theme="light" size="md" />
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-primary">Export</h2>
                        <p className="mt-1 text-sm text-tertiary">
                            Telechargez un backup complet de l&apos;univers{" "}
                            <span className="font-medium text-primary">{universe.name}</span> au
                            format JSON.
                        </p>
                        <div className="mt-4">
                            <Button
                                size="md"
                                iconLeading={Download01}
                                onClick={handleExport}
                                isLoading={exportMutation.isPending}
                                showTextWhileLoading
                            >
                                Exporter l&apos;univers
                            </Button>
                        </div>
                        {exportMutation.isError && (
                            <p className="mt-3 text-sm text-error-primary">
                                Erreur : {exportMutation.error.message}
                            </p>
                        )}
                        {exportMutation.isSuccess && (
                            <p className="mt-3 flex items-center gap-1.5 text-sm text-success-primary">
                                <CheckCircle className="size-4" />
                                Export termine avec succes.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Import section */}
            <div className="mt-6 rounded-xl border border-secondary bg-primary p-6">
                <div className="flex items-start gap-4">
                    <FeaturedIcon icon={Upload01} color="brand" theme="light" size="md" />
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-primary">Import</h2>
                        <p className="mt-1 text-sm text-tertiary">
                            Importez un univers depuis un fichier JSON. Un{" "}
                            <span className="font-medium text-primary">nouvel univers</span> sera
                            cree avec les donnees du fichier.
                        </p>

                        {/* File upload */}
                        <div className="mt-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button
                                size="md"
                                color="secondary"
                                iconLeading={File06}
                                onClick={() => fileInputRef.current?.click()}
                                isDisabled={importMutation.isPending}
                            >
                                Choisir un fichier JSON
                            </Button>
                        </div>

                        {/* Parse error */}
                        {parseError && (
                            <div className="mt-4 rounded-lg border border-error bg-error-primary p-3">
                                <p className="text-sm text-error-primary">{parseError}</p>
                            </div>
                        )}

                        {/* Preview */}
                        {preview && !importResult && (
                            <div className="mt-4 rounded-lg border border-secondary bg-secondary p-4">
                                <h3 className="text-sm font-semibold text-primary">Apercu</h3>
                                <div className="mt-2 space-y-1 text-sm text-tertiary">
                                    <p>
                                        Univers :{" "}
                                        <span className="font-medium text-primary">
                                            {preview.universe.name}
                                        </span>
                                    </p>
                                    <p>Annee de depart : {preview.universe.start_year}</p>
                                    <p>
                                        {preview.seasons.length} saison
                                        {preview.seasons.length !== 1 ? "s" : ""}
                                    </p>
                                    <p>
                                        {preview.narrativeArcs.length} arc
                                        {preview.narrativeArcs.length !== 1 ? "s" : ""} narratif
                                        {preview.narrativeArcs.length !== 1 ? "s" : ""}
                                    </p>
                                    <p>
                                        {preview.rookiePool.length} rookie
                                        {preview.rookiePool.length !== 1 ? "s" : ""}
                                    </p>
                                    {preview.universe.description && (
                                        <p className="mt-1 italic">{preview.universe.description}</p>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <Button
                                        size="md"
                                        onClick={handleImport}
                                        isLoading={importMutation.isPending}
                                        showTextWhileLoading
                                    >
                                        Importer
                                    </Button>
                                    <Button
                                        size="md"
                                        color="secondary"
                                        iconLeading={XClose}
                                        onClick={handleCancelPreview}
                                        isDisabled={importMutation.isPending}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Import error */}
                        {importMutation.isError && !importResult && (
                            <div className="mt-4 rounded-lg border border-error bg-error-primary p-3">
                                <p className="text-sm text-error-primary">
                                    Erreur : {importMutation.error.message}
                                </p>
                            </div>
                        )}

                        {/* Import result */}
                        {importResult && (
                            <div className="mt-4 rounded-lg border border-secondary bg-secondary p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="size-5 text-fg-success-primary" />
                                    <h3 className="text-sm font-semibold text-primary">
                                        Import termine
                                    </h3>
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-tertiary">
                                    <p>
                                        {importResult.seasonCount} saison
                                        {importResult.seasonCount !== 1 ? "s" : ""} importee
                                        {importResult.seasonCount !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {importResult.errors.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-warning-primary">
                                            {importResult.errors.length} avertissement
                                            {importResult.errors.length !== 1 ? "s" : ""}
                                        </p>
                                        <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-xs text-tertiary">
                                            {importResult.errors.map((err, i) => (
                                                <li key={i}>• {err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <Button
                                        size="md"
                                        href={`/universe/${importResult.universeId}`}
                                    >
                                        Voir l&apos;univers
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

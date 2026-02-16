"use client";

import { useState, useCallback } from "react";
import { Upload01 } from "@untitledui/icons";
import type { ZodType } from "zod";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

interface FieldInfo {
    name: string;
    required: boolean;
    description: string;
}

interface ImportJsonDialogProps<TRaw, TFinal = TRaw> {
    title: string;
    description: string;
    exampleData: string;
    fields: FieldInfo[];
    schema: ZodType<TRaw>;
    onImport: (items: TFinal[]) => void;
    resolve?: (items: TRaw[]) => { resolved: TFinal[]; errors: string[] };
    isPending: boolean;
    trigger: React.ReactNode;
}

interface ParseResult<T> {
    valid: T[];
    errors: string[];
}

export function ImportJsonDialog<TRaw, TFinal = TRaw>({
    title,
    description,
    exampleData,
    fields,
    schema,
    onImport,
    resolve,
    isPending,
    trigger,
}: ImportJsonDialogProps<TRaw, TFinal>) {
    const [isOpen, setIsOpen] = useState(false);
    const [parseResult, setParseResult] = useState<ParseResult<TFinal> | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const reset = useCallback(() => {
        setParseResult(null);
        setFileName(null);
    }, []);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open);
            if (!open) reset();
        },
        [reset],
    );

    const handleFile = useCallback(
        (files: FileList) => {
            const file = files[0];
            if (!file) return;

            setFileName(file.name);

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;

                let parsed: unknown;
                try {
                    parsed = JSON.parse(text);
                } catch {
                    setParseResult({
                        valid: [],
                        errors: ["Le fichier n'est pas un JSON valide."],
                    });
                    return;
                }

                if (!Array.isArray(parsed)) {
                    setParseResult({
                        valid: [],
                        errors: [
                            "Le JSON doit etre un tableau (array). Exemple : [{ ... }, { ... }]",
                        ],
                    });
                    return;
                }

                if (parsed.length === 0) {
                    setParseResult({
                        valid: [],
                        errors: ["Le tableau est vide."],
                    });
                    return;
                }

                const valid: TRaw[] = [];
                const errors: string[] = [];

                parsed.forEach((item, index) => {
                    const result = schema.safeParse(item);
                    if (result.success) {
                        valid.push(result.data);
                    } else {
                        const issues = result.error.issues
                            .map((i) => `${i.path.join(".")}: ${i.message}`)
                            .join(", ");
                        errors.push(`Element ${index + 1} : ${issues}`);
                    }
                });

                if (resolve && valid.length > 0) {
                    const result = resolve(valid);
                    setParseResult({
                        valid: result.resolved,
                        errors: [...errors, ...result.errors],
                    });
                } else {
                    setParseResult({ valid: valid as unknown as TFinal[], errors });
                }
            };
            reader.readAsText(file);
        },
        [schema, resolve],
    );

    const handleImport = useCallback(() => {
        if (!parseResult || parseResult.valid.length === 0) return;
        onImport(parseResult.valid);
        handleOpenChange(false);
    }, [parseResult, onImport, handleOpenChange]);

    const hasValidItems = parseResult && parseResult.valid.length > 0;
    const hasErrors = parseResult && parseResult.errors.length > 0;

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
            {trigger}
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            {/* Header */}
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Upload01}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        {title}
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* Format attendu */}
                            <div className="mb-4">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-quaternary">
                                    Format attendu
                                </p>
                                <pre className="max-h-40 overflow-auto rounded-lg bg-secondary p-3 text-xs text-secondary">
                                    {exampleData}
                                </pre>
                            </div>

                            {/* Champs */}
                            <div className="mb-4">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-quaternary">
                                    Champs
                                </p>
                                <ul className="space-y-1 text-sm text-tertiary">
                                    {fields.map((field) => (
                                        <li key={field.name}>
                                            <span className="font-mono text-xs text-secondary">
                                                {field.name}
                                            </span>{" "}
                                            <span
                                                className={
                                                    field.required
                                                        ? "text-xs font-medium text-error-primary"
                                                        : "text-xs text-quaternary"
                                                }
                                            >
                                                ({field.required ? "obligatoire" : "optionnel"})
                                            </span>{" "}
                                            — {field.description}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Drop zone */}
                            <FileUpload.DropZone
                                accept=".json"
                                allowsMultiple={false}
                                hint="Fichier JSON uniquement"
                                onDropFiles={handleFile}
                            />

                            {/* File name */}
                            {fileName && (
                                <p className="mt-2 text-xs text-tertiary">
                                    Fichier : {fileName}
                                </p>
                            )}

                            {/* Parse result */}
                            {parseResult && (
                                <div className="mt-3 space-y-2">
                                    {hasValidItems && (
                                        <Badge size="md" color="success" type="pill-color">
                                            {parseResult.valid.length} element
                                            {parseResult.valid.length > 1 ? "s" : ""} pret
                                            {parseResult.valid.length > 1 ? "s" : ""} a importer
                                        </Badge>
                                    )}

                                    {hasErrors && (
                                        <div className="max-h-32 overflow-auto rounded-lg bg-error-primary p-3">
                                            <p className="mb-1 text-xs font-medium text-error-primary">
                                                {parseResult.errors.length} erreur
                                                {parseResult.errors.length > 1 ? "s" : ""}
                                            </p>
                                            <ul className="space-y-0.5 text-xs text-error-primary">
                                                {parseResult.errors.map((err, i) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <Button
                                    size="md"
                                    color="secondary"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="md"
                                    onClick={handleImport}
                                    isLoading={isPending}
                                    isDisabled={!hasValidItems}
                                >
                                    Importer
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

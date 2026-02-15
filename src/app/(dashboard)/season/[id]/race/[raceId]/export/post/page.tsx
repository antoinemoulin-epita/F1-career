"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle, Copy01, Download01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePostRaceExport } from "@/hooks/use-post-race-export";
import { generatePostRaceMarkdown, type PostRaceExportSections } from "@/lib/export/post-race-template";

// ─── Section config ─────────────────────────────────────────────────────────

const SECTION_OPTIONS: { key: keyof PostRaceExportSections; label: string }[] = [
    { key: "conditions", label: "Conditions" },
    { key: "qualifying", label: "Qualifications" },
    { key: "results", label: "Classement course" },
    { key: "dnfs", label: "Abandons" },
    { key: "fastestLap", label: "Meilleur tour" },
    { key: "notableEvents", label: "Evenements marquants" },
    { key: "standings", label: "Classements" },
    { key: "predictions", label: "Comparaison predictions" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PostRaceExportPage() {
    const params = useParams<{ id: string; raceId: string }>();
    const seasonId = params.id;
    const raceId = params.raceId;

    const { data, isLoading, error } = usePostRaceExport(seasonId, raceId);
    const { copied, copy } = useClipboard();

    const [sections, setSections] = useState<PostRaceExportSections>({
        conditions: true,
        qualifying: true,
        results: true,
        dnfs: true,
        fastestLap: true,
        notableEvents: true,
        standings: true,
        predictions: true,
    });

    const markdown = useMemo(
        () => (data ? generatePostRaceMarkdown(data, sections) : ""),
        [data, sections],
    );

    const toggleSection = (key: keyof PostRaceExportSections) => {
        setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCopy = () => {
        copy(markdown);
    };

    const handleDownload = () => {
        if (!data) return;
        const slug = data.circuit_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `post-race-gp${data.round_number}-${slug}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ─── Loading ─────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement des resultats..." />
            </div>
        );
    }

    // ─── Error ───────────────────────────────────────────────────────────────

    if (error || !data) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon
                            icon={AlertCircle}
                            color="error"
                            theme="light"
                        />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Erreur de chargement</EmptyState.Title>
                        <EmptyState.Description>
                            Impossible de charger les resultats pour l&apos;export.
                            Verifiez que la course est bien terminee.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button
                            href={`/season/${seasonId}/calendar`}
                            size="md"
                            color="secondary"
                            iconLeading={ArrowLeft}
                        >
                            Retour au calendrier
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button
                    color="link-gray"
                    size="sm"
                    iconLeading={ArrowLeft}
                    href={`/season/${seasonId}/race/${raceId}/results`}
                >
                    Retour aux resultats
                </Button>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Export post-course
                    </h1>
                    <p className="mt-1 text-sm text-tertiary">
                        GP {data.round_number} — {data.circuit_flag} {data.circuit_name}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="md"
                        color="secondary"
                        iconLeading={copied ? CheckCircle : Copy01}
                        onClick={handleCopy}
                    >
                        {copied ? "Copie !" : "Copier"}
                    </Button>
                    <Button
                        size="md"
                        color="secondary"
                        iconLeading={Download01}
                        onClick={handleDownload}
                    >
                        Telecharger .md
                    </Button>
                </div>
            </div>

            {/* Checkboxes */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                {SECTION_OPTIONS.map((opt) => (
                    <Checkbox
                        key={opt.key}
                        label={opt.label}
                        isSelected={sections[opt.key]}
                        onChange={() => toggleSection(opt.key)}
                    />
                ))}
            </div>

            {/* Preview */}
            <pre className="mt-6 overflow-auto rounded-xl border border-secondary bg-secondary p-4 font-mono text-sm text-secondary whitespace-pre-wrap">
                {markdown}
            </pre>
        </div>
    );
}

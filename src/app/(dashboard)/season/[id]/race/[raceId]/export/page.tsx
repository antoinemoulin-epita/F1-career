"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Copy01, Download01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePreRaceExport } from "@/hooks/use-pre-race-export";
import { generatePreRaceMarkdown, type ExportSections } from "@/lib/export/pre-race-template";

// ─── Section config ─────────────────────────────────────────────────────────

const SECTION_OPTIONS: { key: keyof ExportSections; label: string }[] = [
    { key: "circuitInfo", label: "Infos circuit" },
    { key: "standings", label: "Classements actuels" },
    { key: "predictions", label: "Predictions vs Actuel" },
    { key: "narrativeArcs", label: "Arcs narratifs" },
    { key: "recentForm", label: "Forme recente" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ExportPage() {
    const params = useParams<{ id: string; raceId: string }>();
    const seasonId = params.id;
    const raceId = params.raceId;

    const { data, isLoading, error } = usePreRaceExport(seasonId, raceId);
    const { copied, copy } = useClipboard();

    const [sections, setSections] = useState<ExportSections>({
        circuitInfo: true,
        standings: true,
        predictions: true,
        narrativeArcs: true,
        recentForm: true,
    });

    const markdown = useMemo(
        () => (data ? generatePreRaceMarkdown(data, sections) : ""),
        [data, sections],
    );

    const toggleSection = (key: keyof ExportSections) => {
        setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCopy = () => {
        copy(markdown);
    };

    const handleDownload = () => {
        if (!data) return;
        const slug = data.circuit.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pre-race-gp${data.round_number}-${slug}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) return <PageLoading label="Chargement des donnees..." />;

    if (error || !data) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les donnees pour l'export."
                backHref={`/season/${seasonId}/calendar`}
                backLabel="Retour au calendrier"
            />
        );
    }

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Saison", href: `/season/${seasonId}` },
                        { label: `GP ${data.round_number}`, href: `/season/${seasonId}/race/${raceId}/qualifying` },
                        { label: "Export pre-course" },
                    ]}
                />
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Export pre-course
                    </h1>
                    <p className="mt-1 text-sm text-tertiary">
                        GP {data.round_number} — {data.circuit.flag_emoji} {data.circuit.name}
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

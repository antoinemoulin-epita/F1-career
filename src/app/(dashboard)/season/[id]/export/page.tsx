"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Copy01, Download01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useClipboard } from "@/hooks/use-clipboard";
import { useSeasonRecapExport } from "@/hooks/use-season-recap-export";
import {
    generateSeasonRecapMarkdown,
    type SeasonRecapExportSections,
} from "@/lib/export/season-recap-template";

// ─── Section config ─────────────────────────────────────────────────────────

const SECTION_OPTIONS: { key: keyof SeasonRecapExportSections; label: string }[] = [
    { key: "standings", label: "Classements" },
    { key: "raceByRace", label: "Historique course par course" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SeasonExportPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data, isLoading, error } = useSeasonRecapExport(seasonId);
    const { copied, copy } = useClipboard();

    const [sections, setSections] = useState<SeasonRecapExportSections>({
        standings: true,
        raceByRace: true,
    });

    const markdown = useMemo(
        () => (data ? generateSeasonRecapMarkdown(data, sections) : ""),
        [data, sections],
    );

    const toggleSection = (key: keyof SeasonRecapExportSections) => {
        setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCopy = () => {
        copy(markdown);
    };

    const handleDownload = () => {
        if (!data) return;
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recap-saison-${data.year}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) return <PageLoading label="Chargement des donnees..." />;

    if (error || !data) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les donnees pour l'export."
                backHref={`/season/${seasonId}`}
                backLabel="Retour a la saison"
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
                        { label: "Export saison" },
                    ]}
                />
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Export saison {data.year}
                    </h1>
                    <p className="mt-1 text-sm text-tertiary">
                        {data.gpCount} Grand{data.gpCount !== 1 ? "s" : ""} Prix — {data.races.length} course{data.races.length !== 1 ? "s" : ""} terminee{data.races.length !== 1 ? "s" : ""}
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

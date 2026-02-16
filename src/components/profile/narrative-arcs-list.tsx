"use client";

import { Badge, BadgeWithDot } from "@/components/base/badges/badges";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NarrativeArcItem {
    id: string;
    name: string;
    description?: string | null;
    arc_type?: string | null;
    status?: string | null;
    importance?: number | null;
    started_season?: { year: number } | null;
    resolved_season?: { year: number } | null;
    resolution_summary?: string | null;
}

interface NarrativeArcsListProps {
    title?: string;
    arcs: NarrativeArcItem[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const arcTypeLabels: Record<string, string> = {
    transfer: "Transfert",
    rivalry: "Rivalite",
    technical: "Technique",
    sponsor: "Sponsor",
    entry_exit: "Entree/Sortie",
    drama: "Drama",
    regulation: "Regulation",
    other: "Autre",
};

const arcStatusColors: Record<string, "gray" | "blue" | "brand" | "success"> = {
    signal: "gray",
    developing: "blue",
    confirmed: "brand",
    resolved: "success",
};

const arcStatusLabels: Record<string, string> = {
    signal: "Signal",
    developing: "En cours",
    confirmed: "Confirme",
    resolved: "Resolu",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function NarrativeArcsList({ title, arcs }: NarrativeArcsListProps) {
    if (arcs.length === 0) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-tertiary">Aucun arc narratif.</p>
            </div>
        );
    }

    return (
        <div>
            {title && (
                <h2 className="mb-3 text-sm font-semibold text-secondary">{title}</h2>
            )}
            <div className="space-y-3">
                {arcs.map((arc) => (
                    <div
                        key={arc.id}
                        className="rounded-xl border border-secondary bg-primary p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-primary">
                                        {arc.name}
                                    </h3>
                                    {arc.arc_type && (
                                        <Badge size="sm" color="gray" type="pill-color">
                                            {arcTypeLabels[arc.arc_type] ?? arc.arc_type}
                                        </Badge>
                                    )}
                                </div>
                                {arc.description && (
                                    <p className="mt-1 text-sm text-tertiary line-clamp-2">
                                        {arc.description}
                                    </p>
                                )}
                            </div>
                            {arc.status && (
                                <BadgeWithDot
                                    size="sm"
                                    color={arcStatusColors[arc.status] ?? "gray"}
                                    type="pill-color"
                                >
                                    {arcStatusLabels[arc.status] ?? arc.status}
                                </BadgeWithDot>
                            )}
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-xs text-tertiary">
                            {arc.started_season && (
                                <span>Debut : {arc.started_season.year}</span>
                            )}
                            {arc.resolved_season && (
                                <span>Fin : {arc.resolved_season.year}</span>
                            )}
                            {arc.importance && (
                                <span>Importance : {"★".repeat(arc.importance)}</span>
                            )}
                        </div>

                        {arc.resolution_summary && (
                            <p className="mt-2 text-xs text-tertiary italic">
                                {arc.resolution_summary}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

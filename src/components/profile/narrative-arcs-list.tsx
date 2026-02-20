"use client";

import { useMemo } from "react";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { DriverLink, TeamLink } from "@/components/profile/entity-link";
import { useArcRelatedEntities } from "@/hooks/use-arc-related-entities";

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
    related_driver_ids?: string[] | null;
    related_team_ids?: string[] | null;
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
    // Collect all unique driver/team IDs across all arcs
    const { allDriverIds, allTeamIds } = useMemo(() => {
        const driverSet = new Set<string>();
        const teamSet = new Set<string>();
        for (const arc of arcs) {
            for (const id of arc.related_driver_ids ?? []) driverSet.add(id);
            for (const id of arc.related_team_ids ?? []) teamSet.add(id);
        }
        return {
            allDriverIds: [...driverSet],
            allTeamIds: [...teamSet],
        };
    }, [arcs]);

    const { data: entities } = useArcRelatedEntities(allDriverIds, allTeamIds);

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
                {arcs.map((arc) => {
                    const drivers = (arc.related_driver_ids ?? [])
                        .map((id) => entities?.drivers.get(id))
                        .filter((d): d is NonNullable<typeof d> => !!d);
                    const teams = (arc.related_team_ids ?? [])
                        .map((id) => entities?.teams.get(id))
                        .filter((t): t is NonNullable<typeof t> => !!t);

                    return (
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

                            {/* Related entities */}
                            {(drivers.length > 0 || teams.length > 0) && (
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                    {drivers.map((d) => (
                                        <DriverLink key={d.driverId} personId={d.personId} className="text-xs">
                                            {d.firstName} {d.lastName}
                                        </DriverLink>
                                    ))}
                                    {teams.map((t) => (
                                        <TeamLink key={t.teamId} teamIdentityId={t.teamIdentityId} color={t.colorPrimary} className="text-xs">
                                            {t.name}
                                        </TeamLink>
                                    ))}
                                </div>
                            )}

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
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { DriverLink, TeamLink } from "@/components/profile/entity-link";
import { useArcRelatedEntities } from "@/hooks/use-arc-related-entities";
import { useAllNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useNewsByArc } from "@/hooks/use-news";
import {
    arcTypeLabels,
    arcTypeBadgeColor,
    arcStatusLabels,
    arcStatusColor,
    newsTypeLabels,
    newsTypeBadgeColor,
} from "@/lib/constants/arc-labels";

export default function ArcDetailPage() {
    const params = useParams<{ id: string; arcId: string }>();
    const universeId = params.id;
    const arcId = params.arcId;

    const { data: arcs, isLoading: arcsLoading, error: arcsError } = useAllNarrativeArcs(universeId);
    const { data: newsItems, isLoading: newsLoading } = useNewsByArc(arcId);

    const arc = useMemo(
        () => arcs?.find((a) => a.id === arcId) ?? null,
        [arcs, arcId],
    );

    // Resolve related entity IDs to names and identity IDs for linking
    const driverIds = useMemo(() => arc?.related_driver_ids ?? [], [arc]);
    const teamIds = useMemo(() => arc?.related_team_ids ?? [], [arc]);
    const { data: entities } = useArcRelatedEntities(driverIds, teamIds);

    const drivers = useMemo(
        () => driverIds.map((id) => entities?.drivers.get(id)).filter((d): d is NonNullable<typeof d> => !!d),
        [driverIds, entities],
    );
    const teams = useMemo(
        () => teamIds.map((id) => entities?.teams.get(id)).filter((t): t is NonNullable<typeof t> => !!t),
        [teamIds, entities],
    );

    const grouped = useMemo(() => {
        if (!newsItems || newsItems.length === 0) return [];

        const groups = new Map<number, { year: number; seasonId: string; news: typeof newsItems }>();
        for (const n of newsItems) {
            const season = n.season as { id: string; year: number } | null;
            const year = season?.year ?? 0;
            const seasonId = season?.id ?? "";
            if (!groups.has(year)) groups.set(year, { year, seasonId, news: [] });
            groups.get(year)!.news.push(n);
        }

        return [...groups.values()].sort((a, b) => b.year - a.year);
    }, [newsItems]);

    if (arcsLoading || newsLoading) {
        return <PageLoading label="Chargement de l'arc..." />;
    }

    if (arcsError || !arc) {
        return (
            <PageError
                title="Arc introuvable"
                description="Cet arc narratif n'existe pas ou a ete supprime."
                backHref={`/universe/${universeId}/arcs`}
                backLabel="Retour aux arcs"
            />
        );
    }

    const typeKey = arc.arc_type ?? "other";
    const statusKey = arc.status ?? "signal";
    const importance = arc.importance ?? 0;
    const totalNews = newsItems?.length ?? 0;

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Univers", href: `/universe/${universeId}` },
                        { label: "Arcs narratifs", href: `/universe/${universeId}/arcs` },
                        { label: arc.name },
                    ]}
                />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    {arc.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                        size="md"
                        color={arcTypeBadgeColor[typeKey] ?? "gray"}
                        type="pill-color"
                    >
                        {arcTypeLabels[typeKey] ?? typeKey}
                    </Badge>
                    <Badge
                        size="md"
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
                    <span className="text-sm text-tertiary">
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
                    </span>
                </div>
            </div>

            {/* Related entities */}
            {(drivers.length > 0 || teams.length > 0) && (
                <div className="mb-6 rounded-xl border border-secondary bg-primary p-6">
                    {drivers.length > 0 && (
                        <div className="mb-3 last:mb-0">
                            <p className="mb-1.5 text-xs font-semibold text-tertiary">Pilotes</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                {drivers.map((d) => (
                                    <DriverLink key={d.driverId} personId={d.personId}>
                                        {d.firstName} {d.lastName}
                                    </DriverLink>
                                ))}
                            </div>
                        </div>
                    )}
                    {teams.length > 0 && (
                        <div>
                            <p className="mb-1.5 text-xs font-semibold text-tertiary">Ecuries</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                {teams.map((t) => (
                                    <TeamLink key={t.teamId} teamIdentityId={t.teamIdentityId} color={t.colorPrimary}>
                                        {t.name}
                                    </TeamLink>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Description */}
            {arc.description && (
                <div className="mb-6 rounded-xl border border-secondary bg-primary p-6">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary">
                        {arc.description}
                    </p>
                </div>
            )}

            {/* Resolution summary */}
            {arc.status === "resolved" && arc.resolution_summary && (
                <div className="mb-6 rounded-xl border border-success bg-success-secondary p-6">
                    <p className="mb-1 text-xs font-semibold text-success-primary">Resolution</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary">
                        {arc.resolution_summary}
                    </p>
                </div>
            )}

            {/* News linked to this arc */}
            <div>
                <h2 className="mb-4 text-sm font-semibold text-secondary">
                    News liees ({totalNews})
                </h2>

                {totalNews === 0 ? (
                    <p className="py-8 text-center text-sm text-tertiary">
                        Aucune news liee a cet arc.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {grouped.map((group) => (
                            <div key={group.year}>
                                <h3 className="mb-3 text-sm font-semibold text-tertiary">
                                    Saison {group.year}
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {group.news.map((n) => {
                                        const nTypeKey = n.news_type ?? "other";
                                        const nImportance = n.importance ?? 0;
                                        return (
                                            <a
                                                key={n.id}
                                                href={`/season/${group.seasonId}/news/${n.id}`}
                                                className="rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover"
                                            >
                                                <p className="font-medium text-primary">
                                                    {n.headline}
                                                </p>
                                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                    <Badge
                                                        size="sm"
                                                        color={newsTypeBadgeColor[nTypeKey] ?? "gray"}
                                                        type="pill-color"
                                                    >
                                                        {newsTypeLabels[nTypeKey] ?? nTypeKey}
                                                    </Badge>
                                                    <span className="text-xs text-tertiary">
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <span
                                                                key={i}
                                                                className={
                                                                    i < nImportance
                                                                        ? "text-warning-primary"
                                                                        : "text-quaternary"
                                                                }
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </span>
                                                    {n.after_round != null && (
                                                        <Badge size="sm" color="gray" type="pill-color">
                                                            Round {n.after_round}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {n.content && (
                                                    <p className="mt-2 line-clamp-2 text-sm text-tertiary">
                                                        {n.content}
                                                    </p>
                                                )}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

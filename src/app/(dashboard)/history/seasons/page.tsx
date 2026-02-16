"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ChevronRight,
    Trophy01,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useChampions } from "@/hooks/use-history";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SeasonsListPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <SeasonsListContent />
        </Suspense>
    );
}

function SeasonsListContent() {
    const searchParams = useSearchParams();
    const universeId = searchParams.get("u") ?? "";

    const { data: champions, isLoading, error } = useChampions(universeId);

    // ─── No universe ──────────────────────────────────────────────────

    if (!universeId) {
        return (
            <PageError
                title="Univers manquant"
                description="Aucun univers selectionne."
                backHref="/history"
                backLabel="Retour"
            />
        );
    }

    if (isLoading) {
        return <PageLoading label="Chargement des saisons..." />;
    }

    if (error || !champions) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les saisons."
                backHref={`/history?u=${universeId}`}
                backLabel="Retour"
            />
        );
    }

    if (champions.length === 0) {
        return (
            <div>
                <div className="mb-6">
                    <Breadcrumbs items={[
                        { label: "Palmares", href: "/history" },
                        { label: "Saisons" },
                    ]} />
                </div>
                <div className="flex min-h-40 items-center justify-center">
                    <p className="text-sm text-tertiary">
                        Aucune saison archivee.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Palmares", href: "/history" },
                    { label: "Saisons" },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Saisons archivees
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    {champions.length} saison{champions.length !== 1 ? "s" : ""} completee{champions.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Seasons list */}
            <div className="space-y-3">
                {champions.map((c) => (
                    <Link
                        key={c.id}
                        href={`/history/seasons/${c.year}?u=${universeId}`}
                        className="group flex items-center gap-4 rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:bg-primary_hover"
                    >
                        <Badge size="md" color="brand" type="pill-color">
                            {c.year}
                        </Badge>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <Trophy01 className="size-4 text-fg-quaternary" />
                                <span className="text-sm font-medium text-primary">
                                    {c.champion_driver_name ?? "—"}
                                </span>
                                <span className="text-sm text-tertiary">
                                    ({c.champion_driver_team ?? "—"})
                                </span>
                                <span className="text-sm font-semibold text-primary">
                                    {c.champion_driver_points ?? 0} pts
                                </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                                <span className="text-xs text-tertiary">
                                    Constructeur : {c.champion_team_name ?? "—"}
                                </span>
                                <span className="text-xs text-tertiary">
                                    | {c.champion_team_points ?? 0} pts
                                </span>
                            </div>
                            {c.season_summary && (
                                <p className="mt-1 line-clamp-1 text-xs text-tertiary">
                                    {c.season_summary}
                                </p>
                            )}
                        </div>

                        <ChevronRight className="size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-secondary" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

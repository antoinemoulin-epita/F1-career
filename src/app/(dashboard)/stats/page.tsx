"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle,
    BarChart01,
    ChevronRight,
    Map01,
    SwitchHorizontal01,
    Users01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useUniverses } from "@/hooks/use-universes";
import { useChampions } from "@/hooks/use-history";
import type { FC } from "react";

// ─── NavCard ────────────────────────────────────────────────────────────────

function NavCard({
    href,
    icon: Icon,
    label,
    sublabel,
}: {
    href: string;
    icon: FC<{ className?: string }>;
    label: string;
    sublabel: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:bg-primary_hover"
        >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="size-5 text-fg-quaternary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">{label}</p>
                <p className="text-sm text-tertiary">{sublabel}</p>
            </div>
            <ChevronRight className="size-5 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-secondary" />
        </Link>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StatsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-80 items-center justify-center"><LoadingIndicator size="md" label="Chargement..." /></div>}>
            <StatsPageContent />
        </Suspense>
    );
}

function StatsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const universeIdParam = searchParams.get("u") ?? "";

    const { data: universes, isLoading: universesLoading } = useUniverses();

    const selectedUniverseId = useMemo(() => {
        if (universeIdParam) return universeIdParam;
        if (universes && universes.length === 1) return universes[0].id;
        return "";
    }, [universeIdParam, universes]);

    const { data: champions, isLoading: championsLoading } = useChampions(selectedUniverseId);

    const seasonCount = champions?.length ?? 0;

    const handleUniverseChange = (key: React.Key | null) => {
        if (!key) return;
        const id = String(key);
        router.push(`/stats?u=${id}`);
    };

    // ─── Loading ────────────────────────────────────────────────────────

    if (universesLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement..." />
            </div>
        );
    }

    // ─── No universes ───────────────────────────────────────────────────

    if (!universes || universes.length === 0) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon icon={AlertCircle} color="gray" theme="light" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Aucun univers</EmptyState.Title>
                        <EmptyState.Description>
                            Creez un univers et completez des saisons pour voir les statistiques.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href="/universe" size="md" color="primary">
                            Gerer les univers
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────

    const basePath = selectedUniverseId ? `u=${selectedUniverseId}` : "";

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        Statistiques
                    </h1>
                    <p className="mt-1 text-md text-tertiary">
                        Analyse detaillee des performances.
                    </p>
                </div>
            </div>

            {/* Universe selector */}
            {universes.length > 1 && (
                <div className="mt-6 max-w-xs">
                    <Select
                        label="Univers"
                        placeholder="Selectionner un univers"
                        selectedKey={selectedUniverseId || null}
                        onSelectionChange={handleUniverseChange}
                        items={universes.map((u) => ({ id: u.id, label: u.name }))}
                    >
                        {(item) => (
                            <Select.Item id={item.id}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>
                </div>
            )}

            {/* Content */}
            {!selectedUniverseId ? (
                <div className="mt-8 flex min-h-40 items-center justify-center">
                    <p className="text-sm text-tertiary">
                        Selectionnez un univers pour afficher les statistiques.
                    </p>
                </div>
            ) : championsLoading ? (
                <div className="mt-8 flex min-h-40 items-center justify-center">
                    <LoadingIndicator size="md" label="Chargement des statistiques..." />
                </div>
            ) : seasonCount === 0 ? (
                <div className="mt-8 flex min-h-40 items-center justify-center">
                    <EmptyState size="lg">
                        <EmptyState.Header>
                            <EmptyState.FeaturedIcon icon={BarChart01} color="gray" theme="light" />
                        </EmptyState.Header>
                        <EmptyState.Content>
                            <EmptyState.Title>Aucune statistique</EmptyState.Title>
                            <EmptyState.Description>
                                Completez des saisons pour alimenter les statistiques.
                            </EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                </div>
            ) : (
                <>
                    {/* Summary */}
                    <div className="mt-6 flex items-center gap-3">
                        <FeaturedIcon icon={BarChart01} color="brand" theme="light" size="sm" />
                        <div>
                            <p className="text-sm font-semibold text-primary">
                                {seasonCount} saison{seasonCount !== 1 ? "s" : ""} completee{seasonCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Navigation cards */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <NavCard
                            href={`/stats/head-to-head?${basePath}`}
                            icon={SwitchHorizontal01}
                            label="Duel Coequipiers"
                            sublabel="H2H par saison"
                        />
                        <NavCard
                            href={`/stats/circuits?${basePath}`}
                            icon={Map01}
                            label="Stats Circuit"
                            sublabel="Historique par circuit"
                        />
                        <NavCard
                            href={`/stats/drivers?${basePath}`}
                            icon={Users01}
                            label="Profil Pilote"
                            sublabel="Carriere detaillee"
                        />
                        <NavCard
                            href={`/stats/compare?${basePath}`}
                            icon={BarChart01}
                            label="Comparaison"
                            sublabel="Multi-pilotes"
                        />
                    </div>
                </>
            )}
        </div>
    );
}

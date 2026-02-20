"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUniverseId } from "@/hooks/use-universe-id";

const supabase = createClient();

export default function TeamsListPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <TeamsListContent />
        </Suspense>
    );
}

function TeamsListContent() {
    const { universeId, isLoading: universeLoading } = useUniverseId();

    const { data: teams, isLoading, error } = useQuery({
        queryKey: ["team-identities", universeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("team_identities")
                .select("*")
                .eq("universe_id", universeId)
                .order("name");
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });

    if (universeLoading || isLoading) return <PageLoading label="Chargement des equipes..." />;

    if (!universeId) {
        return (
            <PageError
                title="Univers manquant"
                backHref="/universe"
                backLabel="Retour"
            />
        );
    }
    if (error) return <PageError title="Erreur" backHref="/universe" backLabel="Retour" />;

    return (
        <div>
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Encyclopedie" },
                    { label: "Equipes" },
                ]} />
            </div>

            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">Equipes</h1>
                <p className="mt-1 text-sm text-tertiary">
                    {teams?.length ?? 0} equipe{(teams?.length ?? 0) !== 1 ? "s" : ""} dans cet univers
                </p>
            </div>

            {!teams || teams.length === 0 ? (
                <EmptyState size="md">
                    <EmptyState.Content>
                        <EmptyState.Title>Aucune equipe</EmptyState.Title>
                    </EmptyState.Content>
                </EmptyState>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {teams.map((t) => (
                        <Link
                            key={t.id}
                            href={`/profile/team/${t.id}`}
                            className="rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                {t.color_primary && (
                                    <span
                                        className="size-4 shrink-0 rounded-full"
                                        style={{ backgroundColor: t.color_primary }}
                                    />
                                )}
                                <p className="text-sm font-semibold text-primary">{t.name}</p>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                                {t.nationality && (
                                    <span className="text-xs text-tertiary">{t.nationality}</span>
                                )}
                                {t.short_name && (
                                    <span className="text-xs text-tertiary">({t.short_name})</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

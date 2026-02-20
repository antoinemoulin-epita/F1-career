"use client";

import { useMemo } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/base/badges/badges";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUniverseId } from "@/hooks/use-universe-id";

const supabase = createClient();

export default function DriversListPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <DriversListContent />
        </Suspense>
    );
}

function DriversListContent() {
    const { universeId, isLoading: universeLoading } = useUniverseId();

    const { data: persons, isLoading, error } = useQuery({
        queryKey: ["person-identities", "drivers", universeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("person_identities")
                .select("*")
                .eq("universe_id", universeId)
                .eq("role", "driver")
                .order("last_name");
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });

    if (universeLoading || isLoading) return <PageLoading label="Chargement des pilotes..." />;

    if (!universeId) {
        return (
            <PageError
                title="Univers manquant"
                description="Selectionnez un univers pour voir les pilotes."
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
                    { label: "Pilotes" },
                ]} />
            </div>

            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">Pilotes</h1>
                <p className="mt-1 text-sm text-tertiary">
                    {persons?.length ?? 0} pilote{(persons?.length ?? 0) !== 1 ? "s" : ""} dans cet univers
                </p>
            </div>

            {!persons || persons.length === 0 ? (
                <EmptyState size="md">
                    <EmptyState.Content>
                        <EmptyState.Title>Aucun pilote</EmptyState.Title>
                        <EmptyState.Description>
                            Les pilotes apparaitront ici une fois des saisons creees.
                        </EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {persons.map((p) => (
                        <Link
                            key={p.id}
                            href={`/profile/driver/${p.id}`}
                            className="rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:shadow-sm"
                        >
                            <p className="text-sm font-semibold text-primary">
                                {p.first_name} {p.last_name}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                {p.nationality && (
                                    <span className="text-xs text-tertiary">{p.nationality}</span>
                                )}
                                {p.birth_year && (
                                    <span className="text-xs text-tertiary">Ne en {p.birth_year}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

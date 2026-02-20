"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/base/badges/badges";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUniverseId } from "@/hooks/use-universe-id";

const supabase = createClient();

export default function EngineSupplierListPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <EngineSupplierListContent />
        </Suspense>
    );
}

function EngineSupplierListContent() {
    const { universeId, isLoading: universeLoading } = useUniverseId();

    const { data: history, isLoading, error } = useQuery({
        queryKey: ["engine-supplier-history-all", universeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_engine_supplier_history")
                .select("*")
                .eq("universe_id", universeId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });

    // Deduplicate: keep the latest-year entry per supplier name
    const suppliers = useMemo(() => {
        if (!history) return [];
        const seen = new Map<string, (typeof history)[0]>();
        for (const row of history) {
            const name = row.name ?? "";
            if (!name) continue;
            // history is ordered by year desc, so the first entry per name is the latest
            if (!seen.has(name)) seen.set(name, row);
        }
        return [...seen.values()].sort((a, b) =>
            (a.name ?? "").localeCompare(b.name ?? ""),
        );
    }, [history]);

    if (universeLoading || isLoading) return <PageLoading label="Chargement des motoristes..." />;

    if (!universeId) {
        return (
            <PageError
                title="Univers manquant"
                description="Selectionnez un univers pour voir les motoristes."
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
                    { label: "Motoristes" },
                ]} />
            </div>

            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">Motoristes</h1>
                <p className="mt-1 text-sm text-tertiary">
                    {suppliers.length} motoriste{suppliers.length !== 1 ? "s" : ""} dans cet univers
                </p>
            </div>

            {suppliers.length === 0 ? (
                <EmptyState size="md">
                    <EmptyState.Content>
                        <EmptyState.Title>Aucun motoriste</EmptyState.Title>
                        <EmptyState.Description>
                            Les motoristes apparaitront ici une fois des saisons creees.
                        </EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {suppliers.map((s) => (
                        <Link
                            key={s.engine_supplier_id}
                            href={`/profile/engine-supplier/${s.engine_supplier_id}`}
                            className="rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:shadow-sm"
                        >
                            <p className="text-sm font-semibold text-primary">{s.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                                {s.nationality && (
                                    <span className="text-xs text-tertiary">{s.nationality}</span>
                                )}
                                <span className="text-xs text-tertiary">
                                    {s.note}/10
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <Badge size="sm" color="brand" type="pill-color">
                                    Invest. {s.investment_level}/3
                                </Badge>
                                {s.has_factory_team && (
                                    <Badge size="sm" color="success" type="pill-color">
                                        Factory
                                    </Badge>
                                )}
                                {s.client_teams_count != null && s.client_teams_count > 0 && (
                                    <Badge size="sm" color="gray" type="pill-color">
                                        {s.client_teams_count} equipe{s.client_teams_count !== 1 ? "s" : ""}
                                    </Badge>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

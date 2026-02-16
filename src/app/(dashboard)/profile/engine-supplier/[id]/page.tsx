"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { ProfileHeader, FactoryBadge } from "@/components/profile/profile-header";
import { StatGrid } from "@/components/profile/stat-grid";
import { RatingDisplay } from "@/components/profile/rating-display";
import { TeamLink } from "@/components/profile/entity-link";
import { useEngineSupplierProfile, useEngineSupplierHistory } from "@/hooks/use-engine-supplier-profile";

export default function EngineSupplierProfilePage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <EngineSupplierContent />
        </Suspense>
    );
}

function EngineSupplierContent() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const { data: supplier, isLoading, error } = useEngineSupplierProfile(id);

    const season = supplier?.season as { year: number; universe_id: string } | null;
    const { data: history } = useEngineSupplierHistory(
        supplier?.name ?? "",
        season?.universe_id ?? "",
    );

    if (isLoading) return <PageLoading label="Chargement..." />;

    if (error || !supplier) {
        return (
            <PageError
                title="Fournisseur introuvable"
                backHref="/profile/engine-supplier"
                backLabel="Retour"
            />
        );
    }

    return (
        <div>
            <ProfileHeader
                breadcrumbs={[
                    { label: "Encyclopedie" },
                    { label: "Motoristes" },
                    { label: supplier.name ?? "" },
                ]}
                title={supplier.name ?? ""}
                subtitle={supplier.nationality ?? undefined}
            />

            <div className="space-y-8">
                <RatingDisplay
                    title="Performance"
                    ratings={[
                        { label: "Note moteur", value: supplier.note ?? 0 },
                        { label: "Investissement", value: supplier.investment_level ?? 0, max: 3 },
                    ]}
                />

                {/* History */}
                {history && history.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">
                            Historique par saison
                        </h2>
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3">Annee</th>
                                        <th className="px-4 py-3">Note</th>
                                        <th className="px-4 py-3">Invest.</th>
                                        <th className="px-4 py-3">Equipes</th>
                                        <th className="px-4 py-3">Factory</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {history.map((h) => (
                                        <tr key={h.season_id}>
                                            <td className="px-4 py-3 font-medium text-primary">{h.year}</td>
                                            <td className="px-4 py-3 text-primary tabular-nums">{h.note}/10</td>
                                            <td className="px-4 py-3 text-tertiary tabular-nums">{h.investment_level}/3</td>
                                            <td className="px-4 py-3 text-tertiary">{h.client_teams ?? "—"}</td>
                                            <td className="px-4 py-3">
                                                {h.has_factory_team && <FactoryBadge />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

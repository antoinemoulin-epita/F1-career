"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/base/badges/badges";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useCircuits } from "@/hooks/use-circuits";

export default function CircuitsListPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <CircuitsListContent />
        </Suspense>
    );
}

const circuitTypeLabels: Record<string, string> = {
    high_speed: "Haute vitesse",
    technical: "Technique",
    balanced: "Equilibre",
    street: "Urbain",
};

function CircuitsListContent() {
    const { data: circuits, isLoading, error } = useCircuits();

    if (isLoading) return <PageLoading label="Chargement des circuits..." />;
    if (error) return <PageError title="Erreur" backHref="/" backLabel="Retour" />;

    return (
        <div>
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Encyclopedie" },
                    { label: "Circuits" },
                ]} />
            </div>

            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">Circuits</h1>
                <p className="mt-1 text-sm text-tertiary">
                    {circuits?.length ?? 0} circuit{(circuits?.length ?? 0) !== 1 ? "s" : ""}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {circuits?.map((c) => (
                    <Link
                        key={c.id}
                        href={`/profile/circuit/${c.id}`}
                        className="rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:shadow-sm"
                    >
                        <p className="text-sm font-semibold text-primary">
                            {c.flag_emoji && `${c.flag_emoji} `}{c.name}
                        </p>
                        <p className="mt-0.5 text-xs text-tertiary">
                            {[c.city, c.country].filter(Boolean).join(", ")}
                        </p>
                        <div className="mt-2 flex gap-2">
                            {c.circuit_type && (
                                <Badge size="sm" color="gray" type="pill-color">
                                    {circuitTypeLabels[c.circuit_type] ?? c.circuit_type}
                                </Badge>
                            )}
                            {c.prestige != null && c.prestige > 0 && (
                                <Badge size="sm" color="warning" type="pill-color">
                                    {"★".repeat(c.prestige)}
                                </Badge>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

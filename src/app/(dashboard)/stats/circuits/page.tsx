"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useCircuitStats, type CircuitStat } from "@/hooks/use-stats";

// ─── Weather badge ──────────────────────────────────────────────────────────

function WeatherBadge({ weather }: { weather: string }) {
    const config: Record<string, { label: string; color: "gray" | "blue" | "warning" }> = {
        dry: { label: "Sec", color: "gray" },
        wet: { label: "Pluie", color: "blue" },
        mixed: { label: "Mixte", color: "warning" },
    };
    const { label, color } = config[weather] ?? config.dry;
    return (
        <Badge size="sm" color={color} type="pill-color">
            {label}
        </Badge>
    );
}

// ─── Circuit type badge ─────────────────────────────────────────────────────

function CircuitTypeBadge({ type }: { type: string }) {
    const labels: Record<string, string> = {
        high_speed: "Rapide",
        technical: "Technique",
        balanced: "Equilibre",
        street: "Urbain",
    };
    return (
        <Badge size="sm" color="gray" type="pill-color">
            {labels[type] ?? type}
        </Badge>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CircuitsStatsPage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <CircuitsStatsContent />
        </Suspense>
    );
}

function CircuitsStatsContent() {
    const searchParams = useSearchParams();
    const universeId = searchParams.get("u") ?? "";

    const { data: circuits, isLoading, error } = useCircuitStats(universeId);

    const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null);

    const selectedCircuit = circuits?.find((c) => c.circuitId === selectedCircuitId) ?? null;

    // ─── Loading / error ─────────────────────────────────────────────

    if (!universeId) {
        return (
            <PageError
                title="Univers manquant"
                backHref="/stats"
                backLabel="Retour"
            />
        );
    }

    if (isLoading) {
        return <PageLoading label="Chargement des circuits..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger les statistiques des circuits."
                backHref="/stats"
                backLabel="Retour"
            />
        );
    }

    if (!circuits || circuits.length === 0) {
        return (
            <div>
                <div className="mb-6">
                    <Breadcrumbs items={[
                        { label: "Statistiques", href: "/stats" },
                        { label: "Circuits" },
                    ]} />
                </div>
                <div className="flex min-h-40 items-center justify-center">
                    <p className="text-sm text-tertiary">
                        Aucune donnee de circuit disponible.
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
                    { label: "Statistiques", href: "/stats" },
                    { label: "Circuits" },
                ]} />
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Statistiques par Circuit
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    Historique et records pour chaque circuit
                </p>
            </div>

            {/* Circuits table */}
            <div className="overflow-auto rounded-xl border border-secondary">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                            <th className="px-4 py-3">Circuit</th>
                            <th className="px-4 py-3">Pays</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Courses</th>
                            <th className="px-4 py-3">Roi du circuit</th>
                            <th className="px-4 py-3">V</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary">
                        {circuits.map((circuit) => (
                            <tr
                                key={circuit.circuitId}
                                className={`cursor-pointer transition duration-100 ease-linear hover:bg-primary_hover ${
                                    selectedCircuitId === circuit.circuitId ? "bg-active" : ""
                                }`}
                                onClick={() =>
                                    setSelectedCircuitId(
                                        selectedCircuitId === circuit.circuitId ? null : circuit.circuitId,
                                    )
                                }
                            >
                                <td className="px-4 py-3 font-medium text-primary">
                                    {circuit.flagEmoji} {circuit.circuitName}
                                </td>
                                <td className="px-4 py-3 text-tertiary">{circuit.country}</td>
                                <td className="px-4 py-3">
                                    <CircuitTypeBadge type={circuit.circuitType} />
                                </td>
                                <td className="px-4 py-3 text-tertiary">{circuit.raceCount}</td>
                                <td className="px-4 py-3 text-primary">
                                    {circuit.mostWinsDriver || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    {circuit.mostWinsCount > 0 && (
                                        <Badge size="sm" color="brand" type="pill-color">
                                            {circuit.mostWinsCount}
                                        </Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Circuit detail */}
            {selectedCircuit && (
                <div className="mt-6">
                    <h2 className="mb-3 text-lg font-semibold text-primary">
                        {selectedCircuit.flagEmoji} {selectedCircuit.circuitName}
                    </h2>
                    <div className="overflow-auto rounded-xl border border-secondary">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                    <th className="px-4 py-3">Annee</th>
                                    <th className="px-4 py-3">Vainqueur</th>
                                    <th className="px-4 py-3">Equipe</th>
                                    <th className="px-4 py-3">Meteo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary">
                                {[...selectedCircuit.winners]
                                    .sort((a, b) => b.year - a.year)
                                    .map((w, i) => {
                                        const weather = selectedCircuit.weatherHistory.find(
                                            (wh) => wh.year === w.year,
                                        );
                                        return (
                                            <tr key={`${w.year}-${i}`}>
                                                <td className="px-4 py-3 font-medium text-primary">
                                                    {w.year}
                                                </td>
                                                <td className="px-4 py-3 text-primary">
                                                    {w.driverName}
                                                </td>
                                                <td className="px-4 py-3 text-tertiary">
                                                    {w.teamName}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <WeatherBadge weather={weather?.weather ?? "dry"} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

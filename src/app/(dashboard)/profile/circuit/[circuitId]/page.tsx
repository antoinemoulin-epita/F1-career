"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { ProfileHeader } from "@/components/profile/profile-header";
import { StatGrid } from "@/components/profile/stat-grid";
import { useCircuitProfile, useCircuitRaceHistory } from "@/hooks/use-circuit-profile";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CircuitProfilePage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <CircuitProfileContent />
        </Suspense>
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const circuitTypeLabels: Record<string, string> = {
    high_speed: "Haute vitesse",
    technical: "Technique",
    balanced: "Equilibre",
    street: "Urbain",
};

const keyAttributeLabels: Record<string, string> = {
    speed: "Vitesse",
    grip: "Grip",
    acceleration: "Acceleration",
};

const climateLabels: Record<string, string> = {
    tropical: "Tropical",
    temperate: "Tempere",
    desert: "Desert",
    mediterranean: "Mediterraneen",
    continental: "Continental",
};

function prestigeStars(prestige: number | null): string {
    if (!prestige) return "—";
    return "★".repeat(prestige) + "☆".repeat(3 - prestige);
}

// ─── Content ────────────────────────────────────────────────────────────────

function CircuitProfileContent() {
    const params = useParams<{ circuitId: string }>();
    const circuitId = params.circuitId;

    const { data: circuit, isLoading, error } = useCircuitProfile(circuitId);
    const { data: raceHistory } = useCircuitRaceHistory(circuitId);

    if (isLoading) return <PageLoading label="Chargement du circuit..." />;

    if (error || !circuit) {
        return (
            <PageError
                title="Circuit introuvable"
                backHref="/profile/circuit"
                backLabel="Retour aux circuits"
            />
        );
    }

    return (
        <div>
            <ProfileHeader
                breadcrumbs={[
                    { label: "Encyclopedie", href: "/profile/circuit" },
                    { label: "Circuits", href: "/profile/circuit" },
                    { label: circuit.name ?? "" },
                ]}
                title={`${circuit.flag_emoji ?? ""} ${circuit.name ?? ""}`.trim()}
                subtitle={[circuit.city, circuit.country].filter(Boolean).join(", ")}
            />

            <div className="space-y-8">
                {/* Characteristics */}
                <StatGrid
                    title="Caracteristiques"
                    columns={5}
                    stats={[
                        { label: "Type", value: circuitTypeLabels[circuit.circuit_type ?? ""] ?? "—" },
                        { label: "Attribut cle", value: keyAttributeLabels[circuit.key_attribute ?? ""] ?? "—" },
                        { label: "Prestige", value: prestigeStars(circuit.prestige) },
                        { label: "Climat", value: climateLabels[circuit.region_climate ?? ""] ?? "—" },
                        { label: "Proba pluie", value: (circuit.base_rain_probability ?? 0) === 0 ? "Sec" : `${circuit.base_rain_probability}%` },
                    ]}
                />

                {/* Race stats */}
                <StatGrid
                    title="Statistiques"
                    columns={4}
                    stats={[
                        { label: "GP courus", value: circuit.total_races ?? 0 },
                        { label: "GP sous la pluie", value: circuit.wet_races ?? 0 },
                        { label: "GP mixtes", value: circuit.mixed_races ?? 0 },
                        { label: "Premier GP", value: circuit.first_gp_year ?? "—" },
                    ]}
                />

                {/* Race history */}
                {raceHistory && raceHistory.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">
                            Historique des GP
                        </h2>
                        <div className="overflow-auto rounded-xl border border-secondary">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                        <th className="px-4 py-3">Annee</th>
                                        <th className="px-4 py-3">Meteo</th>
                                        <th className="px-4 py-3">Vainqueur</th>
                                        <th className="px-4 py-3">P2</th>
                                        <th className="px-4 py-3">P3</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary">
                                    {raceHistory.map((race) => {
                                        const season = race.season as { year: number } | null;
                                        type Podium = (typeof race.podiums)[number];
                                        const p1 = race.podiums.find((p: Podium) => p.finish_position === 1);
                                        const p2 = race.podiums.find((p: Podium) => p.finish_position === 2);
                                        const p3 = race.podiums.find((p: Podium) => p.finish_position === 3);

                                        const driverName = (d: typeof p1) => {
                                            if (!d?.driver) return "—";
                                            return `${d.driver.first_name ?? ""} ${d.driver.last_name ?? ""}`.trim();
                                        };

                                        return (
                                            <tr key={race.id}>
                                                <td className="px-4 py-3 font-medium text-primary">
                                                    {season?.year ?? "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        size="sm"
                                                        color={
                                                            race.weather === "wet" ? "blue"
                                                            : race.weather === "mixed" ? "orange"
                                                            : "gray"
                                                        }
                                                        type="pill-color"
                                                    >
                                                        {race.weather === "wet" ? "Pluie"
                                                            : race.weather === "mixed" ? "Mixte"
                                                            : "Sec"}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-primary">
                                                    {driverName(p1)}
                                                </td>
                                                <td className="px-4 py-3 text-tertiary">
                                                    {driverName(p2)}
                                                </td>
                                                <td className="px-4 py-3 text-tertiary">
                                                    {driverName(p3)}
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
        </div>
    );
}

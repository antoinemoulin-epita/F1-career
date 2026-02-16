"use client";

import { Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { Tabs } from "@/components/application/tabs/tabs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { StatsLineChart, CHART_COLORS } from "@/components/charts/line-chart";
import {
    ProfileHeader,
    RookieBadge,
    RetiringBadge,
    ChampionBadge,
    FirstDriverBadge,
    ContractBadge,
} from "@/components/profile/profile-header";
import { StatGrid } from "@/components/profile/stat-grid";
import { CareerTimeline } from "@/components/profile/career-timeline";
import { ResultsTable } from "@/components/profile/results-table";
import { RatingDisplay } from "@/components/profile/rating-display";
import { NarrativeArcsList } from "@/components/profile/narrative-arcs-list";
import { TransfersList } from "@/components/profile/transfers-list";
import { TeamLink } from "@/components/profile/entity-link";
import {
    usePersonProfile,
    usePersonSeasons,
    usePersonRaceHistory,
    usePersonTransfers,
    usePersonArcs,
} from "@/hooks/use-person-profile";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DriverProfilePage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement du profil..." />}>
            <DriverProfileContent />
        </Suspense>
    );
}

// ─── Content ────────────────────────────────────────────────────────────────

function DriverProfileContent() {
    const params = useParams<{ personId: string }>();
    const personId = params.personId;

    const { data: profile, isLoading, error } = usePersonProfile(personId);
    const { data: seasons } = usePersonSeasons(personId);
    const { data: raceHistory } = usePersonRaceHistory(personId);
    const { data: transfers } = usePersonTransfers(personId);
    const { data: arcs } = usePersonArcs(personId);

    // Current season (most recent)
    const currentSeason = useMemo(() => seasons?.[0] ?? null, [seasons]);

    // Chart data
    const chartData = useMemo(() => {
        if (!seasons) return [];
        return [...seasons]
            .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
            .map((s) => ({
                year: String(s.year),
                points: s.season_points ?? 0,
                note: s.note ?? 0,
            }));
    }, [seasons]);

    // Career timeline entries
    const timelineEntries = useMemo(() => {
        if (!seasons) return [];
        return seasons.map((s) => ({
            year: s.year ?? 0,
            role: s.is_rookie ? "Rookie" : s.is_first_driver ? "Pilote #1" : "Pilote #2",
            teamName: s.team_name ?? "Sans equipe",
            teamColor: s.team_color,
            detail: s.championship_position ? `P${s.championship_position} - ${s.season_points ?? 0} pts` : undefined,
            teamIdentityId: s.team_identity_id,
        }));
    }, [seasons]);

    // Race results mapped
    const raceResults = useMemo(() => {
        if (!raceHistory) return [];
        return raceHistory.map((r) => ({
            year: r.year ?? 0,
            round_number: r.round_number ?? 0,
            circuit_name: r.circuit_name ?? "",
            flag_emoji: r.flag_emoji,
            weather: r.weather,
            quali_position: r.quali_position,
            grid_position: r.grid_position,
            finish_position: r.finish_position,
            points: r.points,
            fastest_lap: r.fastest_lap,
            result_status: r.result_status,
            team_name: r.team_name,
            team_color: r.team_color,
        }));
    }, [raceHistory]);

    // ─── Loading / Error ────────────────────────────────────────────────

    if (isLoading) {
        return <PageLoading label="Chargement du profil pilote..." />;
    }

    if (error || !profile) {
        return (
            <PageError
                title="Pilote introuvable"
                description="Ce profil pilote n'existe pas."
                backHref="/profile/driver"
                backLabel="Retour aux pilotes"
            />
        );
    }

    const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();

    return (
        <div>
            {/* Header */}
            <ProfileHeader
                breadcrumbs={[
                    { label: "Encyclopedie", href: "/profile/driver" },
                    { label: "Pilotes", href: "/profile/driver" },
                    { label: fullName },
                ]}
                title={fullName}
                subtitle={[
                    profile.nationality,
                    profile.birth_year ? `Ne en ${profile.birth_year}` : null,
                ].filter(Boolean).join(" · ")}
                badges={
                    <>
                        {(profile.world_titles ?? 0) > 0 && (
                            <ChampionBadge count={profile.world_titles ?? 0} />
                        )}
                        {currentSeason?.is_rookie && <RookieBadge />}
                        {currentSeason?.is_retiring && <RetiringBadge />}
                        {currentSeason?.is_first_driver && <FirstDriverBadge />}
                        {currentSeason?.contract_years_remaining != null && (
                            <ContractBadge years={currentSeason.contract_years_remaining} />
                        )}
                    </>
                }
            />

            {/* Tabs */}
            <Tabs>
                <Tabs.List
                    type="underline"
                    size="sm"
                    items={[
                        { id: "overview", label: "Apercu" },
                        { id: "career", label: "Carriere" },
                        { id: "results", label: "Resultats" },
                        { id: "transfers", label: `Transferts${(transfers?.length ?? 0) > 0 ? ` (${transfers!.length})` : ""}` },
                        { id: "storylines", label: `Storylines${(arcs?.length ?? 0) > 0 ? ` (${arcs!.length})` : ""}` },
                    ]}
                />

                {/* ─── Tab: Apercu ─────────────────────────────────── */}
                <Tabs.Panel id="overview">
                    <div className="space-y-8 pt-6">
                        {/* Career stats */}
                        <StatGrid
                            title="Statistiques de carriere"
                            stats={[
                                { label: "Titres", value: profile.world_titles ?? 0, highlight: (profile.world_titles ?? 0) > 0 },
                                { label: "Victoires", value: profile.total_wins ?? 0 },
                                { label: "Podiums", value: profile.total_podiums ?? 0 },
                                { label: "Poles", value: profile.total_poles ?? 0 },
                                { label: "Points", value: profile.total_points ?? 0 },
                                { label: "Saisons", value: profile.seasons_count ?? 0 },
                            ]}
                        />

                        {/* Current season */}
                        {currentSeason && (
                            <div>
                                <h2 className="mb-3 text-sm font-semibold text-secondary">
                                    Saison actuelle ({currentSeason.year})
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-secondary bg-primary p-4">
                                        <p className="text-xs text-tertiary">Equipe</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            {currentSeason.team_color && (
                                                <span
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: currentSeason.team_color }}
                                                />
                                            )}
                                            {currentSeason.team_identity_id ? (
                                                <TeamLink teamIdentityId={currentSeason.team_identity_id}>
                                                    {currentSeason.team_name ?? "—"}
                                                </TeamLink>
                                            ) : (
                                                <span className="text-sm font-medium text-primary">
                                                    {currentSeason.team_name ?? "—"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <RatingDisplay
                                        ratings={[
                                            { label: "Note", value: currentSeason.note ?? 0 },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Points evolution chart */}
                        {chartData.length > 1 && (
                            <div>
                                <h2 className="mb-3 text-sm font-semibold text-secondary">
                                    Evolution des points
                                </h2>
                                <div className="rounded-xl border border-secondary bg-primary p-4">
                                    <StatsLineChart
                                        data={chartData}
                                        lines={[
                                            { dataKey: "points", label: "Points", color: CHART_COLORS[0] },
                                        ]}
                                        xAxisKey="year"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Tabs.Panel>

                {/* ─── Tab: Carriere ───────────────────────────────── */}
                <Tabs.Panel id="career">
                    <div className="space-y-8 pt-6">
                        <CareerTimeline
                            title="Parcours"
                            entries={timelineEntries}
                        />

                        {/* Seasons table */}
                        {seasons && seasons.length > 0 && (
                            <div>
                                <h2 className="mb-3 text-sm font-semibold text-secondary">
                                    Saisons
                                </h2>
                                <div className="overflow-auto rounded-xl border border-secondary">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-secondary bg-secondary text-left text-xs font-medium text-tertiary">
                                                <th className="px-4 py-3">Annee</th>
                                                <th className="px-4 py-3">Pos</th>
                                                <th className="px-4 py-3">Pts</th>
                                                <th className="px-4 py-3">V</th>
                                                <th className="px-4 py-3">Pdm</th>
                                                <th className="px-4 py-3">PP</th>
                                                <th className="px-4 py-3">Note</th>
                                                <th className="px-4 py-3">Equipe</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary">
                                            {seasons.map((s) => (
                                                <tr key={s.season_id}>
                                                    <td className="px-4 py-3 font-medium text-primary">
                                                        {s.year}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {s.championship_position ? (
                                                            <Badge
                                                                size="sm"
                                                                color={
                                                                    s.championship_position === 1 ? "warning"
                                                                    : s.championship_position <= 3 ? "brand"
                                                                    : "gray"
                                                                }
                                                                type="pill-color"
                                                            >
                                                                P{s.championship_position}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-tertiary">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-primary tabular-nums">
                                                        {s.season_points ?? 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-tertiary tabular-nums">
                                                        {s.season_wins ?? 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-tertiary tabular-nums">
                                                        {s.season_podiums ?? 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-tertiary tabular-nums">
                                                        {s.season_poles ?? 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-tertiary tabular-nums">
                                                        {s.note ?? "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {s.team_color && (
                                                                <span
                                                                    className="size-2.5 rounded-full"
                                                                    style={{ backgroundColor: s.team_color }}
                                                                />
                                                            )}
                                                            <span className="text-tertiary">
                                                                {s.team_name ?? "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Note evolution */}
                        {chartData.length > 1 && (
                            <div>
                                <h2 className="mb-3 text-sm font-semibold text-secondary">
                                    Evolution de la note
                                </h2>
                                <div className="rounded-xl border border-secondary bg-primary p-4">
                                    <StatsLineChart
                                        data={chartData}
                                        lines={[
                                            { dataKey: "note", label: "Note", color: CHART_COLORS[1] },
                                        ]}
                                        xAxisKey="year"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Tabs.Panel>

                {/* ─── Tab: Resultats ──────────────────────────────── */}
                <Tabs.Panel id="results">
                    <div className="pt-6">
                        <ResultsTable
                            title="Resultats course par course"
                            results={raceResults}
                            showTeam
                        />
                    </div>
                </Tabs.Panel>

                {/* ─── Tab: Transferts ─────────────────────────────── */}
                <Tabs.Panel id="transfers">
                    <div className="pt-6">
                        <TransfersList
                            title="Historique des transferts"
                            transfers={transfers ?? []}
                            hideDriver
                        />
                    </div>
                </Tabs.Panel>

                {/* ─── Tab: Storylines ─────────────────────────────── */}
                <Tabs.Panel id="storylines">
                    <div className="pt-6">
                        <NarrativeArcsList
                            title="Arcs narratifs"
                            arcs={arcs ?? []}
                        />
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

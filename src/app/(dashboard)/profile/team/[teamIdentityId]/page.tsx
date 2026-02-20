"use client";

import { Suspense, useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { Tabs } from "@/components/application/tabs/tabs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { StatsLineChart, CHART_COLORS } from "@/components/charts/line-chart";
import {
    ProfileHeader,
    FactoryBadge,
    ChampionBadge,
} from "@/components/profile/profile-header";
import { StatGrid } from "@/components/profile/stat-grid";
import { RatingDisplay } from "@/components/profile/rating-display";
import { NarrativeArcsList } from "@/components/profile/narrative-arcs-list";
import { TransfersList } from "@/components/profile/transfers-list";
import { DriverLink, EngineSupplierLink, StaffLink } from "@/components/profile/entity-link";
import {
    useTeamProfile,
    useTeamHistory,
    useTeamDrivers,
    useTeamTransfers,
    useTeamArcs,
} from "@/hooks/use-team-profile";
import { useNewsByEntity } from "@/hooks/use-news-mentions";
import { newsTypeLabels, newsTypeBadgeColor } from "@/lib/constants/arc-labels";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeamProfilePage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement du profil..." />}>
            <TeamProfileContent />
        </Suspense>
    );
}

// ─── Content ────────────────────────────────────────────────────────────────

function TeamProfileContent() {
    const params = useParams<{ teamIdentityId: string }>();
    const teamIdentityId = params.teamIdentityId;

    const { data: profile, isLoading, error } = useTeamProfile(teamIdentityId);
    const { data: history } = useTeamHistory(teamIdentityId);
    const { data: drivers } = useTeamDrivers(teamIdentityId);
    const { data: transfers } = useTeamTransfers(teamIdentityId);
    const { data: arcs } = useTeamArcs(teamIdentityId);
    const { data: entityNews } = useNewsByEntity("team", teamIdentityId);

    // Chart data from history
    const chartData = useMemo(() => {
        if (!history) return [];
        return [...history]
            .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
            .map((h) => ({
                year: String(h.year),
                points: h.season_points ?? 0,
                position: h.championship_position ?? 0,
            }));
    }, [history]);

    // Current drivers (from most recent season)
    const currentDrivers = useMemo(() => {
        if (!drivers || !profile) return [];
        return drivers.filter((d) => d.season_id === profile.current_season_id);
    }, [drivers, profile]);

    // Aggregate history stats
    const totalStats = useMemo(() => {
        if (!history) return { wins: 0, podiums: 0, poles: 0, points: 0, titles: 0 };
        return {
            wins: history.reduce((sum, h) => sum + (h.season_wins ?? 0), 0),
            podiums: history.reduce((sum, h) => sum + (h.season_podiums ?? 0), 0),
            poles: history.reduce((sum, h) => sum + (h.season_poles ?? 0), 0),
            points: history.reduce((sum, h) => sum + (h.season_points ?? 0), 0),
            titles: profile?.constructor_titles ?? 0,
        };
    }, [history, profile]);

    if (isLoading) {
        return <PageLoading label="Chargement du profil equipe..." />;
    }

    if (error || !profile) {
        return (
            <PageError
                title="Equipe introuvable"
                description="Ce profil equipe n'existe pas."
                backHref="/profile/team"
                backLabel="Retour aux equipes"
            />
        );
    }

    return (
        <div>
            <ProfileHeader
                breadcrumbs={[
                    { label: "Encyclopedie", href: "/profile/team" },
                    { label: "Equipes", href: "/profile/team" },
                    { label: profile.name ?? "" },
                ]}
                title={profile.name ?? ""}
                subtitle={[
                    profile.nationality,
                    profile.founded_year ? `Fondee en ${profile.founded_year}` : null,
                ].filter(Boolean).join(" · ")}
                accentColor={profile.color_primary ?? undefined}
                badges={
                    <>
                        {(profile.constructor_titles ?? 0) > 0 && (
                            <ChampionBadge count={profile.constructor_titles ?? 0} />
                        )}
                        {profile.is_factory_team && <FactoryBadge />}
                    </>
                }
            />

            <Tabs>
                <Tabs.List
                    type="underline"
                    size="sm"
                    items={[
                        { id: "overview", label: "Apercu" },
                        { id: "history", label: "Historique" },
                        { id: "finance", label: "Finance" },
                        { id: "transfers", label: `Transferts${(transfers?.length ?? 0) > 0 ? ` (${transfers!.length})` : ""}` },
                        { id: "storylines", label: `Storylines${(arcs?.length ?? 0) > 0 ? ` (${arcs!.length})` : ""}` },
                        { id: "news", label: `News${(entityNews?.length ?? 0) > 0 ? ` (${entityNews!.length})` : ""}` },
                    ]}
                />

                {/* ─── Tab: Apercu ─────────────────────────────────── */}
                <Tabs.Panel id="overview">
                    <div className="space-y-8 pt-6">
                        {/* Stats */}
                        <StatGrid
                            title="Statistiques"
                            stats={[
                                { label: "Titres constructeurs", value: totalStats.titles, highlight: totalStats.titles > 0 },
                                { label: "Victoires", value: totalStats.wins },
                                { label: "Podiums", value: totalStats.podiums },
                                { label: "Poles", value: totalStats.poles },
                                { label: "Points", value: totalStats.points },
                                { label: "Saisons", value: history?.length ?? 0 },
                            ]}
                        />

                        {/* Current drivers */}
                        <div>
                            <h2 className="mb-3 text-sm font-semibold text-secondary">
                                Pilotes actuels
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {currentDrivers.map((d) => {
                                    const name = `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim();
                                    return (
                                        <div key={d.driver_id} className="rounded-xl border border-secondary bg-primary p-4">
                                            <div className="flex items-center justify-between">
                                                {d.person_id ? (
                                                    <DriverLink personId={d.person_id}>
                                                        {name}
                                                    </DriverLink>
                                                ) : (
                                                    <span className="text-sm font-medium text-primary">{name}</span>
                                                )}
                                                {d.is_first_driver && (
                                                    <Badge size="sm" color="success" type="pill-color">
                                                        #1
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Car ratings */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <RatingDisplay
                                title="Voiture"
                                ratings={[
                                    { label: "Moteur", value: profile.motor ?? 0 },
                                    { label: "Aero", value: profile.aero ?? 0 },
                                    { label: "Chassis", value: profile.chassis ?? 0 },
                                ]}
                            />
                            <div>
                                <h2 className="mb-3 text-sm font-semibold text-secondary">Motoriste</h2>
                                <div className="rounded-xl border border-secondary bg-primary p-4">
                                    <p className="text-sm font-medium text-primary">
                                        {profile.engine_name ?? "—"}
                                    </p>
                                    {profile.engine_note != null && (
                                        <p className="mt-1 text-xs text-tertiary">
                                            Note : {profile.engine_note}/10
                                        </p>
                                    )}
                                </div>

                                <h2 className="mb-3 mt-4 text-sm font-semibold text-secondary">Staff</h2>
                                <div className="space-y-2">
                                    {profile.team_principal && (
                                        <div className="rounded-xl border border-secondary bg-primary p-3">
                                            <p className="text-xs text-tertiary">Team Principal</p>
                                            <p className="text-sm font-medium text-primary">{profile.team_principal}</p>
                                        </div>
                                    )}
                                    {profile.technical_director && (
                                        <div className="rounded-xl border border-secondary bg-primary p-3">
                                            <p className="text-xs text-tertiary">Directeur Technique</p>
                                            <p className="text-sm font-medium text-primary">{profile.technical_director}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Tabs.Panel>

                {/* ─── Tab: Historique ─────────────────────────────── */}
                <Tabs.Panel id="history">
                    <div className="space-y-8 pt-6">
                        {history && history.length > 0 && (
                            <>
                                {/* Points chart */}
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

                                {/* History table */}
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
                                                    <th className="px-4 py-3">Moteur</th>
                                                    <th className="px-4 py-3">M/A/C</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-secondary">
                                                {history.map((h) => (
                                                    <tr key={h.season_id}>
                                                        <td className="px-4 py-3 font-medium text-primary">{h.year}</td>
                                                        <td className="px-4 py-3">
                                                            {h.championship_position ? (
                                                                <Badge
                                                                    size="sm"
                                                                    color={
                                                                        h.championship_position === 1 ? "warning"
                                                                        : h.championship_position <= 3 ? "brand"
                                                                        : "gray"
                                                                    }
                                                                    type="pill-color"
                                                                >
                                                                    P{h.championship_position}
                                                                </Badge>
                                                            ) : "—"}
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-primary tabular-nums">{h.season_points ?? 0}</td>
                                                        <td className="px-4 py-3 text-tertiary tabular-nums">{h.season_wins ?? 0}</td>
                                                        <td className="px-4 py-3 text-tertiary tabular-nums">{h.season_podiums ?? 0}</td>
                                                        <td className="px-4 py-3 text-tertiary tabular-nums">{h.season_poles ?? 0}</td>
                                                        <td className="px-4 py-3 text-tertiary">{h.engine_name ?? "—"}</td>
                                                        <td className="px-4 py-3 text-tertiary tabular-nums">
                                                            {h.motor ?? 0}/{h.aero ?? 0}/{h.chassis ?? 0}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Tabs.Panel>

                {/* ─── Tab: Finance ────────────────────────────────── */}
                <Tabs.Panel id="finance">
                    <div className="space-y-6 pt-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-xl border border-secondary bg-primary p-4">
                                <p className="text-xs text-tertiary">Sponsor titre</p>
                                <p className="mt-1 text-sm font-medium text-primary">
                                    {profile.title_sponsor ?? "Aucun"}
                                </p>
                                {profile.sponsor_duration && (
                                    <p className="mt-0.5 text-xs text-tertiary">
                                        Duree : {profile.sponsor_duration} an{profile.sponsor_duration > 1 ? "s" : ""}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-xl border border-secondary bg-primary p-4">
                                <p className="text-xs text-tertiary">Objectif sponsor</p>
                                <p className="mt-1 text-sm font-medium text-primary">
                                    {profile.sponsor_objective ?? "—"}
                                </p>
                                {profile.sponsor_objective_met != null && (
                                    <Badge
                                        size="sm"
                                        color={profile.sponsor_objective_met ? "success" : "error"}
                                        type="pill-color"
                                    >
                                        {profile.sponsor_objective_met ? "Atteint" : "Non atteint"}
                                    </Badge>
                                )}
                            </div>
                            <div className="rounded-xl border border-secondary bg-primary p-4">
                                <p className="text-xs text-tertiary">Actionnaires</p>
                                <p className="mt-1 text-sm font-medium text-primary">
                                    {profile.shareholders ?? "—"}
                                </p>
                            </div>
                        </div>

                        <RatingDisplay
                            title="Investissements"
                            ratings={[
                                { label: "Proprietaire", value: profile.owner_investment ?? 0, max: 2 },
                                { label: "Sponsor", value: profile.sponsor_investment ?? 0, max: 2 },
                                { label: "Ingenieurs", value: profile.engineer_level ?? 0, max: 3 },
                            ]}
                        />
                    </div>
                </Tabs.Panel>

                {/* ─── Tab: Transferts ─────────────────────────────── */}
                <Tabs.Panel id="transfers">
                    <div className="pt-6">
                        <TransfersList
                            title="Transferts"
                            transfers={transfers ?? []}
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

                {/* ─── Tab: News ──────────────────────────────────── */}
                <Tabs.Panel id="news">
                    <div className="pt-6">
                        <h2 className="mb-3 text-sm font-semibold text-secondary">
                            Actualites mentionnant cette ecurie
                        </h2>
                        {(entityNews?.length ?? 0) === 0 ? (
                            <p className="text-sm text-tertiary">Aucune mention trouvee.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {entityNews!.map((n) => {
                                    const typeKey = n.news_type ?? "other";
                                    return (
                                        <a
                                            key={n.id}
                                            href={`/season/${n.season_id}/news/${n.id}`}
                                            className="rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover"
                                        >
                                            <p className="font-medium text-primary">{n.headline}</p>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                <Badge
                                                    size="sm"
                                                    color={newsTypeBadgeColor[typeKey] ?? "gray"}
                                                    type="pill-color"
                                                >
                                                    {newsTypeLabels[typeKey] ?? typeKey}
                                                </Badge>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}

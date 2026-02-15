"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Copy01,
    Download01,
    Trophy01,
    Users01,
    Zap,
    Star01,
    Target04,
    CurrencyDollar,
    FileCheck02,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Tabs } from "@/components/application/tabs/tabs";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { useSeason } from "@/hooks/use-seasons";
import { useDrivers } from "@/hooks/use-drivers";
import { useTeams } from "@/hooks/use-teams";
import { useDriverStandings, useConstructorStandings } from "@/hooks/use-standings";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useSurperformance } from "@/hooks/use-surperformance";
import { useArchiveSeason, type DriverEvolution, type TeamBudgetChange } from "@/hooks/use-end-season";
import { useClipboard } from "@/hooks/use-clipboard";
import {
    generateEndSeasonMarkdown,
    type EndSeasonExportSections,
    type EndSeasonExportData,
    type DriverEvolutionDisplay,
} from "@/lib/export/end-season-template";
import type { StandingRow } from "@/lib/export/pre-race-template";
import { cx } from "@/utils/cx";
import type { FC } from "react";

// ─── Steps config ───────────────────────────────────────────────────────────

type StepId = "champions" | "surperformance" | "evolutions" | "rookies" | "budgets" | "validation";

const STEPS: { id: StepId; label: string; icon: FC }[] = [
    { id: "champions", label: "Champions", icon: Trophy01 },
    { id: "surperformance", label: "Surperformances", icon: Zap },
    { id: "evolutions", label: "Evolutions", icon: Star01 },
    { id: "rookies", label: "Rookies", icon: Target04 },
    { id: "budgets", label: "Budgets", icon: CurrencyDollar },
    { id: "validation", label: "Validation", icon: FileCheck02 },
];

// ─── Section card ───────────────────────────────────────────────────────────

function SectionCard({
    title,
    icon,
    color,
    children,
}: {
    title: string;
    icon: FC;
    color: "brand" | "success" | "warning" | "error" | "gray";
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-secondary p-5">
            <div className="mb-4 flex items-center gap-3">
                <FeaturedIcon icon={icon} color={color} theme="light" size="sm" />
                <h3 className="text-md font-semibold text-primary">{title}</h3>
            </div>
            {children}
        </div>
    );
}

// ─── Effect badge ───────────────────────────────────────────────────────────

function EffectBadge({ value, label }: { value: number; label?: string }) {
    if (value === 0) return null;
    const color = value > 0 ? "success" : "error";
    const text = label
        ? `${value > 0 ? "+" : ""}${value} ${label}`
        : `${value > 0 ? "+" : ""}${value}`;
    return (
        <Badge size="sm" color={color} type="pill-color">
            {text}
        </Badge>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EndSeasonPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    // ─── Data fetching ──────────────────────────────────────────────────
    const { data: season, isLoading: seasonLoading } = useSeason(seasonId);
    const { data: driversRaw, isLoading: driversLoading } = useDrivers(seasonId);
    const { data: teamsRaw, isLoading: teamsLoading } = useTeams(seasonId);
    const { data: driverStandingsRaw, isLoading: dsLoading } = useDriverStandings(seasonId);
    const { data: constructorStandingsRaw, isLoading: csLoading } = useConstructorStandings(seasonId);
    const { data: surperfData, isLoading: surperfLoading } = useSurperformance(seasonId);
    const { data: narrativeArcsRaw } = useNarrativeArcs(season?.universe_id ?? "");
    const archiveSeason = useArchiveSeason();
    const { copied, copy } = useClipboard();

    const isLoading = seasonLoading || driversLoading || teamsLoading || dsLoading || csLoading || surperfLoading;

    // ─── Current step ───────────────────────────────────────────────────
    const [currentStepId, setCurrentStepId] = useState<StepId>("champions");
    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStepId);

    // ─── Local state for evolutions ─────────────────────────────────────
    // Driver evolutions: map of driver_id → overrides
    const [declineEnabled, setDeclineEnabled] = useState<Map<string, boolean>>(new Map());
    const [progressionEnabled, setProgressionEnabled] = useState<Map<string, boolean>>(new Map());
    const [championBonusEnabled, setChampionBonusEnabled] = useState(true);
    const [rookieReveals, setRookieReveals] = useState<Map<string, number | null>>(new Map());
    const [budgetOverrides, setBudgetOverrides] = useState<Map<string, boolean>>(new Map());
    const [seasonSummary, setSeasonSummary] = useState("");
    const [isArchived, setIsArchived] = useState(false);
    const [exportSections, setExportSections] = useState<EndSeasonExportSections>({
        champions: true,
        standings: true,
        stats: true,
        surperformances: true,
        evolutions: true,
        retirees: true,
        arcs: true,
    });

    // ─── Champions ──────────────────────────────────────────────────────
    const championDriver = driverStandingsRaw?.[0] ?? null;
    const championConstructor = constructorStandingsRaw?.[0] ?? null;

    // ─── Driver / team arrays ────────────────────────────────────────────
    const drivers = driversRaw ?? [];
    const teams = teamsRaw ?? [];

    // ─── Team name map ──────────────────────────────────────────────────
    const teamNameMap = useMemo(() => {
        const map = new Map<string, string>();
        teams.forEach((t) => { if (t.id && t.name) map.set(t.id, t.name); });
        return map;
    }, [teams]);

    // Drivers eligible for decline (age ≥ 35)
    const decliningDrivers = useMemo(
        () => drivers.filter((d) => d.age != null && d.age >= 35),
        [drivers],
    );

    // Drivers eligible for progression (age ≤ 26, note < potential_final)
    const progressingDrivers = useMemo(
        () =>
            drivers.filter(
                (d) =>
                    d.age != null &&
                    d.age <= 26 &&
                    d.note != null &&
                    d.potential_final != null &&
                    d.note < d.potential_final,
            ),
        [drivers],
    );

    // Rookies with unrevealed potential
    const rookies = useMemo(
        () => drivers.filter((d) => d.is_rookie && !d.potential_revealed),
        [drivers],
    );

    // ─── Initialize toggles on first render ─────────────────────────────
    useMemo(() => {
        if (decliningDrivers.length > 0 && declineEnabled.size === 0) {
            const map = new Map<string, boolean>();
            decliningDrivers.forEach((d) => { if (d.id) map.set(d.id, true); });
            setDeclineEnabled(map);
        }
        if (progressingDrivers.length > 0 && progressionEnabled.size === 0) {
            const map = new Map<string, boolean>();
            progressingDrivers.forEach((d) => { if (d.id) map.set(d.id, true); });
            setProgressionEnabled(map);
        }
        if (rookies.length > 0 && rookieReveals.size === 0) {
            const map = new Map<string, number | null>();
            rookies.forEach((d) => {
                if (d.id) {
                    // Default: propose surperformance-based reveal
                    const surp = surperfData?.drivers.find((s) => s.driver_id === d.id);
                    if (surp && surp.effect === "positive" && d.potential_max != null) {
                        map.set(d.id, d.potential_max);
                    } else if (surp && surp.effect === "negative" && d.potential_min != null) {
                        map.set(d.id, d.potential_min);
                    } else {
                        map.set(d.id, null); // needs manual selection
                    }
                }
            });
            setRookieReveals(map);
        }
        if (surperfData && budgetOverrides.size === 0) {
            const map = new Map<string, boolean>();
            surperfData.teams.forEach((t) => {
                if (t.budget_change !== 0) map.set(t.team_id, true);
            });
            setBudgetOverrides(map);
        }
    }, [decliningDrivers, progressingDrivers, rookies, surperfData, declineEnabled.size, progressionEnabled.size, rookieReveals.size, budgetOverrides.size]);

    // ─── Build final evolutions for validation ──────────────────────────
    const driverEvolutions = useMemo<DriverEvolution[]>(() => {
        return drivers
            .filter((d) => d.id != null)
            .map((d) => {
                const id = d.id!;
                const surp = surperfData?.drivers.find((s) => s.driver_id === id);
                const isChampion = championDriver?.driver_id === id;

                return {
                    driver_id: id,
                    potential_change: surp?.potential_change ?? 0,
                    decline: declineEnabled.get(id) ? -1 : 0,
                    progression: progressionEnabled.get(id) ? 1 : 0,
                    champion_bonus: isChampion && championBonusEnabled ? 1 : 0,
                    rookie_reveal: rookieReveals.get(id) ?? null,
                };
            })
            .filter(
                (e) =>
                    e.potential_change !== 0 ||
                    e.decline !== 0 ||
                    e.progression !== 0 ||
                    e.champion_bonus !== 0 ||
                    e.rookie_reveal != null,
            );
    }, [drivers, surperfData, championDriver, declineEnabled, progressionEnabled, championBonusEnabled, rookieReveals]);

    const teamBudgetChanges = useMemo<TeamBudgetChange[]>(() => {
        if (!surperfData) return [];
        return surperfData.teams
            .filter((t) => t.budget_change !== 0 && budgetOverrides.get(t.team_id))
            .map((t) => ({
                team_id: t.team_id,
                surperformance_delta: t.budget_change,
            }));
    }, [surperfData, budgetOverrides]);

    // ─── Export data ────────────────────────────────────────────────────
    const exportData = useMemo<EndSeasonExportData | null>(() => {
        if (!season || !driverStandingsRaw || !constructorStandingsRaw) return null;

        const leaderDriverPts = driverStandingsRaw[0]?.points ?? 0;
        const driverStandings: StandingRow[] = driverStandingsRaw.map((s) => ({
            position: s.position ?? 0,
            name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim(),
            team: s.team_name ?? undefined,
            points: s.points ?? 0,
            wins: s.wins ?? 0,
            podiums: s.podiums ?? 0,
            poles: s.poles ?? 0,
            gap: (s.points ?? 0) - leaderDriverPts,
        }));

        const leaderCtorPts = constructorStandingsRaw[0]?.points ?? 0;
        const constructorStandings: StandingRow[] = constructorStandingsRaw.map((s) => ({
            position: s.position ?? 0,
            name: s.team_name ?? "",
            points: s.points ?? 0,
            wins: s.wins ?? 0,
            podiums: s.podiums ?? 0,
            poles: s.poles ?? 0,
            gap: (s.points ?? 0) - leaderCtorPts,
        }));

        const totalRaces = Math.max(...driverStandingsRaw.map((s) => s.after_round ?? 0), 0);

        const driverEvolutionDisplays: DriverEvolutionDisplay[] = driverEvolutions.map((evo) => {
            const d = drivers.find((dr) => dr.id === evo.driver_id);
            const total = evo.potential_change + evo.decline + evo.progression + evo.champion_bonus;
            const parts: string[] = [];
            if (evo.champion_bonus > 0) parts.push("champion +1");
            if (evo.potential_change > 0) parts.push(`surperf +${evo.potential_change}`);
            if (evo.potential_change < 0) parts.push(`surperf ${evo.potential_change}`);
            if (evo.decline < 0) parts.push("declin -1");
            if (evo.progression > 0) parts.push("progression +1");
            if (evo.rookie_reveal != null) parts.push(`potentiel revele: ${evo.rookie_reveal}`);
            return {
                name: d?.full_name ?? "",
                parts,
                totalNoteChange: total,
            };
        });

        const retirees = drivers
            .filter((d) => d.is_retiring)
            .map((d) => ({
                name: d.full_name ?? "",
                team: teamNameMap.get(d.team_id ?? "") ?? "—",
                age: d.age ?? null,
            }));

        const arcs = (narrativeArcsRaw ?? []).map((a) => ({
            name: a.name ?? "",
            arc_type: a.arc_type ?? "",
            status: a.status ?? "",
            description: a.description ?? null,
        }));

        return {
            year: season.year,
            champion: {
                driverName: championDriver
                    ? `${championDriver.first_name ?? ""} ${championDriver.last_name ?? ""}`.trim()
                    : null,
                driverTeam: championDriver?.team_name ?? null,
                driverPoints: championDriver?.points ?? null,
                teamName: championConstructor?.team_name ?? null,
                teamPoints: championConstructor?.points ?? null,
            },
            driverStandings,
            constructorStandings,
            stats: {
                uniqueWinners: new Set(driverStandingsRaw.filter((d) => (d.wins ?? 0) > 0).map((d) => d.driver_id)).size,
                uniquePodiums: new Set(driverStandingsRaw.filter((d) => (d.podiums ?? 0) > 0).map((d) => d.driver_id)).size,
                uniquePoleSitters: new Set(driverStandingsRaw.filter((d) => (d.poles ?? 0) > 0).map((d) => d.driver_id)).size,
                totalDrivers: driverStandingsRaw.length,
                totalRaces,
            },
            driverSurperformances: surperfData?.drivers ?? [],
            teamSurperformances: surperfData?.teams ?? [],
            driverEvolutions: driverEvolutionDisplays,
            rookieReveals: rookies
                .filter((r) => rookieReveals.get(r.id!) != null)
                .map((r) => ({ name: r.full_name ?? "", potential: rookieReveals.get(r.id!)! })),
            teamBudgetChanges: teamBudgetChanges.map((c) => ({
                name: teams.find((t) => t.id === c.team_id)?.name ?? "",
                delta: c.surperformance_delta,
            })),
            retirees,
            arcs,
            seasonSummary: seasonSummary || null,
        };
    }, [
        season, driverStandingsRaw, constructorStandingsRaw, drivers, teams,
        championDriver, championConstructor, surperfData, driverEvolutions,
        teamBudgetChanges, rookies, rookieReveals, narrativeArcsRaw, seasonSummary, teamNameMap,
    ]);

    const exportMarkdown = useMemo(
        () => (exportData ? generateEndSeasonMarkdown(exportData, exportSections) : ""),
        [exportData, exportSections],
    );

    // ─── Handlers ───────────────────────────────────────────────────────
    const goNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepId(STEPS[currentStepIndex + 1].id);
        }
    };

    const goPrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepId(STEPS[currentStepIndex - 1].id);
        }
    };

    const handleArchive = () => {
        if (!season) return;

        archiveSeason.mutate(
            {
                seasonId,
                universeId: season.universe_id,
                year: season.year,
                championDriverId: championDriver?.driver_id ?? null,
                championDriverName: championDriver
                    ? `${championDriver.first_name ?? ""} ${championDriver.last_name ?? ""}`.trim()
                    : null,
                championDriverPoints: championDriver?.points ?? null,
                championDriverTeam: championDriver?.team_name ?? null,
                championTeamId: championConstructor?.team_id ?? null,
                championTeamName: championConstructor?.team_name ?? null,
                championTeamPoints: championConstructor?.points ?? null,
                seasonSummary: seasonSummary || null,
                driverEvolutions,
                teamBudgetChanges,
            },
            {
                onSuccess: () => setIsArchived(true),
            },
        );
    };

    const handleCopy = () => copy(exportMarkdown);

    const handleDownload = () => {
        const blob = new Blob([exportMarkdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fin-saison-${season?.year ?? ""}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleExportSection = (key: keyof EndSeasonExportSections) => {
        setExportSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // ─── Loading ────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement des donnees..." />
            </div>
        );
    }

    if (!season || !driverStandingsRaw || !constructorStandingsRaw) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon icon={AlertCircle} color="error" theme="light" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Erreur</EmptyState.Title>
                        <EmptyState.Description>
                            Impossible de charger les donnees de la saison.
                        </EmptyState.Description>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href={`/season/${seasonId}`} size="md" color="secondary" iconLeading={ArrowLeft}>
                            Retour
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────────
    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button color="link-gray" size="sm" iconLeading={ArrowLeft} href={`/season/${seasonId}`}>
                    Retour a la saison
                </Button>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-display-sm font-semibold text-primary">
                    Fin de saison {season.year}
                </h1>
                <p className="mt-1 text-sm text-tertiary">
                    Etape {currentStepIndex + 1} sur {STEPS.length}
                </p>
            </div>

            {/* Tabs navigation */}
            <Tabs
                selectedKey={currentStepId}
                onSelectionChange={(key) => setCurrentStepId(key as StepId)}
            >
                <Tabs.List
                    type="underline"
                    size="sm"
                    items={STEPS.map((s, i) => ({
                        id: s.id,
                        label: s.label,
                        badge: i < currentStepIndex ? "✓" : String(i + 1),
                    }))}
                />

                {/* Step 1: Champions */}
                <Tabs.Panel id="champions" className="mt-6">
                    <div className="space-y-4">
                        <SectionCard title="Champion pilotes" icon={Trophy01} color="success">
                            {championDriver ? (
                                <div className="flex items-center gap-3">
                                    <span
                                        className="size-3 rounded-full"
                                        style={{ backgroundColor: championDriver.team_color ?? "#94a3b8" }}
                                    />
                                    <div>
                                        <p className="text-md font-semibold text-primary">
                                            {championDriver.first_name} {championDriver.last_name}
                                        </p>
                                        <p className="text-sm text-tertiary">
                                            {championDriver.team_name} — {championDriver.points} pts, {championDriver.wins} victoires
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-tertiary">Aucune donnee</p>
                            )}
                        </SectionCard>

                        <SectionCard title="Champion constructeurs" icon={Users01} color="success">
                            {championConstructor ? (
                                <div className="flex items-center gap-3">
                                    <span
                                        className="size-3 rounded-full"
                                        style={{ backgroundColor: championConstructor.team_color ?? "#94a3b8" }}
                                    />
                                    <div>
                                        <p className="text-md font-semibold text-primary">
                                            {championConstructor.team_name}
                                        </p>
                                        <p className="text-sm text-tertiary">
                                            {championConstructor.points} pts, {championConstructor.wins} victoires
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-tertiary">Aucune donnee</p>
                            )}
                        </SectionCard>

                        {/* Season stats */}
                        <SectionCard title="Stats saison" icon={Target04} color="brand">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { label: "Vainqueurs differents", value: new Set(driverStandingsRaw.filter((d) => (d.wins ?? 0) > 0).map((d) => d.driver_id)).size },
                                    { label: "Podiums differents", value: new Set(driverStandingsRaw.filter((d) => (d.podiums ?? 0) > 0).map((d) => d.driver_id)).size },
                                    { label: "Pole sitters", value: new Set(driverStandingsRaw.filter((d) => (d.poles ?? 0) > 0).map((d) => d.driver_id)).size },
                                    { label: "Pilotes au depart", value: driverStandingsRaw.length },
                                ].map((stat) => (
                                    <div key={stat.label} className="rounded-lg bg-secondary p-3">
                                        <p className="text-display-xs font-semibold text-primary">{stat.value}</p>
                                        <p className="text-xs text-tertiary">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                </Tabs.Panel>

                {/* Step 2: Surperformances */}
                <Tabs.Panel id="surperformance" className="mt-6">
                    <div className="space-y-4">
                        <SectionCard title="Surperformance pilotes" icon={Zap} color="brand">
                            {surperfData && surperfData.drivers.length > 0 ? (
                                <div className="overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-secondary text-left text-xs font-medium text-tertiary">
                                                <th className="pb-2 pr-4">Pilote</th>
                                                <th className="pb-2 pr-4">Equipe</th>
                                                <th className="pb-2 pr-4">Predit</th>
                                                <th className="pb-2 pr-4">Final</th>
                                                <th className="pb-2 pr-4">Delta</th>
                                                <th className="pb-2">Effet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary">
                                            {surperfData.drivers.map((d) => (
                                                <tr key={d.driver_id}>
                                                    <td className="py-2 pr-4 font-medium text-primary">{d.name}</td>
                                                    <td className="py-2 pr-4 text-tertiary">{d.team}</td>
                                                    <td className="py-2 pr-4">P{d.predicted_position}</td>
                                                    <td className="py-2 pr-4">P{d.final_position}</td>
                                                    <td className="py-2 pr-4">
                                                        <span className={cx(
                                                            "font-medium",
                                                            d.delta > 0 && "text-success-primary",
                                                            d.delta < 0 && "text-error-primary",
                                                        )}>
                                                            {d.delta > 0 ? `+${d.delta}` : d.delta}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        {d.effect !== "neutral" && (
                                                            <EffectBadge value={d.potential_change} label="potentiel" />
                                                        )}
                                                        {d.effect === "neutral" && (
                                                            <Badge size="sm" color="gray" type="pill-color">neutre</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-tertiary">Aucune donnee de surperformance</p>
                            )}
                        </SectionCard>

                        <SectionCard title="Surperformance constructeurs" icon={Zap} color="brand">
                            {surperfData && surperfData.teams.length > 0 ? (
                                <div className="overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-secondary text-left text-xs font-medium text-tertiary">
                                                <th className="pb-2 pr-4">Equipe</th>
                                                <th className="pb-2 pr-4">Predit</th>
                                                <th className="pb-2 pr-4">Final</th>
                                                <th className="pb-2 pr-4">Delta</th>
                                                <th className="pb-2">Effet budget</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary">
                                            {surperfData.teams.map((t) => (
                                                <tr key={t.team_id}>
                                                    <td className="py-2 pr-4 font-medium text-primary">{t.name}</td>
                                                    <td className="py-2 pr-4">P{t.predicted_position}</td>
                                                    <td className="py-2 pr-4">P{t.final_position}</td>
                                                    <td className="py-2 pr-4">
                                                        <span className={cx(
                                                            "font-medium",
                                                            t.delta > 0 && "text-success-primary",
                                                            t.delta < 0 && "text-error-primary",
                                                        )}>
                                                            {t.delta > 0 ? `+${t.delta}` : t.delta}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        {t.budget_change !== 0 ? (
                                                            <EffectBadge value={t.budget_change} label="budget" />
                                                        ) : (
                                                            <Badge size="sm" color="gray" type="pill-color">neutre</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-tertiary">Aucune donnee</p>
                            )}
                        </SectionCard>
                    </div>
                </Tabs.Panel>

                {/* Step 3: Driver evolutions */}
                <Tabs.Panel id="evolutions" className="mt-6">
                    <div className="space-y-4">
                        {/* Champion bonus */}
                        {championDriver && (
                            <SectionCard title="Bonus champion" icon={Trophy01} color="success">
                                <Checkbox
                                    label={`${championDriver.first_name} ${championDriver.last_name} : +1 potentiel (bonus champion du monde)`}
                                    isSelected={championBonusEnabled}
                                    onChange={() => setChampionBonusEnabled((v) => !v)}
                                />
                            </SectionCard>
                        )}

                        {/* Declines */}
                        <SectionCard title="Declins (age ≥ 35)" icon={AlertCircle} color="warning">
                            {decliningDrivers.length > 0 ? (
                                <div className="space-y-2">
                                    {decliningDrivers.map((d) => (
                                        <div key={d.id} className="flex items-center justify-between">
                                            <Checkbox
                                                label={`${d.full_name} (${d.age} ans, note ${d.note})`}
                                                isSelected={declineEnabled.get(d.id!) ?? true}
                                                onChange={() =>
                                                    setDeclineEnabled((prev) => {
                                                        const next = new Map(prev);
                                                        next.set(d.id!, !(next.get(d.id!) ?? true));
                                                        return next;
                                                    })
                                                }
                                            />
                                            <Badge size="sm" color="error" type="pill-color">-1 note</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-tertiary">Aucun pilote concerne</p>
                            )}
                        </SectionCard>

                        {/* Progressions */}
                        <SectionCard title="Progressions (age ≤ 26, note &lt; potentiel)" icon={Star01} color="success">
                            {progressingDrivers.length > 0 ? (
                                <div className="space-y-2">
                                    {progressingDrivers.map((d) => (
                                        <div key={d.id} className="flex items-center justify-between">
                                            <Checkbox
                                                label={`${d.full_name} (${d.age} ans, note ${d.note} → pot. ${d.potential_final})`}
                                                isSelected={progressionEnabled.get(d.id!) ?? true}
                                                onChange={() =>
                                                    setProgressionEnabled((prev) => {
                                                        const next = new Map(prev);
                                                        next.set(d.id!, !(next.get(d.id!) ?? true));
                                                        return next;
                                                    })
                                                }
                                            />
                                            <Badge size="sm" color="success" type="pill-color">+1 note</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-tertiary">Aucun pilote concerne</p>
                            )}
                        </SectionCard>
                    </div>
                </Tabs.Panel>

                {/* Step 4: Rookies */}
                <Tabs.Panel id="rookies" className="mt-6">
                    <SectionCard title="Revelation potentiel rookies" icon={Target04} color="brand">
                        {rookies.length > 0 ? (
                            <div className="space-y-4">
                                {rookies.map((d) => {
                                    const surp = surperfData?.drivers.find((s) => s.driver_id === d.id);
                                    const reveal = rookieReveals.get(d.id!);
                                    return (
                                        <div key={d.id} className="rounded-lg border border-secondary p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-primary">
                                                        {d.full_name}
                                                    </p>
                                                    <p className="text-xs text-tertiary">
                                                        {teamNameMap.get(d.team_id ?? "") ?? "—"} — Fourchette : {d.potential_min}–{d.potential_max}
                                                    </p>
                                                    {surp && (
                                                        <p className="mt-1 text-xs text-tertiary">
                                                            Surperformance : {surp.delta > 0 ? `+${surp.delta}` : surp.delta} ({surp.effect})
                                                        </p>
                                                    )}
                                                </div>
                                                {surp?.effect === "positive" && (
                                                    <Badge size="sm" color="success" type="pill-color">Haut potentiel suggere</Badge>
                                                )}
                                                {surp?.effect === "negative" && (
                                                    <Badge size="sm" color="error" type="pill-color">Bas potentiel suggere</Badge>
                                                )}
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-sm text-secondary">Potentiel revele :</span>
                                                <div className="flex gap-1">
                                                    {Array.from(
                                                        { length: (d.potential_max ?? 10) - (d.potential_min ?? 1) + 1 },
                                                        (_, i) => (d.potential_min ?? 1) + i,
                                                    ).map((val) => (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() =>
                                                                setRookieReveals((prev) => {
                                                                    const next = new Map(prev);
                                                                    next.set(d.id!, val);
                                                                    return next;
                                                                })
                                                            }
                                                            className={cx(
                                                                "flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition duration-100 ease-linear",
                                                                reveal === val
                                                                    ? "border-brand bg-brand-primary text-brand-secondary"
                                                                    : "border-secondary bg-primary text-secondary hover:bg-primary_hover",
                                                            )}
                                                        >
                                                            {val}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-tertiary">Aucun rookie a reveler cette saison</p>
                        )}
                    </SectionCard>
                </Tabs.Panel>

                {/* Step 5: Budgets */}
                <Tabs.Panel id="budgets" className="mt-6">
                    <SectionCard title="Ajustements budgets constructeurs" icon={CurrencyDollar} color="brand">
                        {surperfData && surperfData.teams.some((t) => t.budget_change !== 0) ? (
                            <div className="space-y-2">
                                {surperfData.teams
                                    .filter((t) => t.budget_change !== 0)
                                    .map((t) => (
                                        <div key={t.team_id} className="flex items-center justify-between">
                                            <Checkbox
                                                label={`${t.name} : ${t.budget_change > 0 ? "+" : ""}${t.budget_change} bonus surperformance`}
                                                isSelected={budgetOverrides.get(t.team_id) ?? true}
                                                onChange={() =>
                                                    setBudgetOverrides((prev) => {
                                                        const next = new Map(prev);
                                                        next.set(t.team_id, !(next.get(t.team_id) ?? true));
                                                        return next;
                                                    })
                                                }
                                            />
                                            <EffectBadge value={t.budget_change} label="budget" />
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-sm text-tertiary">Aucun ajustement budgetaire necessaire</p>
                        )}
                    </SectionCard>
                </Tabs.Panel>

                {/* Step 6: Validation */}
                <Tabs.Panel id="validation" className="mt-6">
                    {!isArchived ? (
                        <div className="space-y-4">
                            <SectionCard title="Recapitulatif des changements" icon={FileCheck02} color="brand">
                                <div className="space-y-3">
                                    {/* Champions */}
                                    <div>
                                        <p className="text-xs font-medium text-tertiary uppercase">Champions</p>
                                        <p className="text-sm text-primary">
                                            Pilote : {championDriver ? `${championDriver.first_name} ${championDriver.last_name}` : "—"} |{" "}
                                            Constructeur : {championConstructor?.team_name ?? "—"}
                                        </p>
                                    </div>

                                    {/* Driver changes */}
                                    {driverEvolutions.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-tertiary uppercase">Evolutions pilotes ({driverEvolutions.length})</p>
                                            <div className="mt-1 space-y-1">
                                                {driverEvolutions.map((evo) => {
                                                    const d = drivers.find((dr) => dr.id === evo.driver_id);
                                                    const total = evo.potential_change + evo.decline + evo.progression + evo.champion_bonus;
                                                    const parts: string[] = [];
                                                    if (evo.champion_bonus > 0) parts.push("champion +1");
                                                    if (evo.potential_change > 0) parts.push(`surperf +${evo.potential_change}`);
                                                    if (evo.potential_change < 0) parts.push(`surperf ${evo.potential_change}`);
                                                    if (evo.decline < 0) parts.push("declin -1");
                                                    if (evo.progression > 0) parts.push("progression +1");
                                                    if (evo.rookie_reveal != null) parts.push(`potentiel revele: ${evo.rookie_reveal}`);

                                                    return (
                                                        <div key={evo.driver_id} className="flex items-center justify-between text-sm">
                                                            <span className="text-primary">{d?.full_name ?? evo.driver_id}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-tertiary">{parts.join(", ")}</span>
                                                                {total !== 0 && <EffectBadge value={total} label="note" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Team changes */}
                                    {teamBudgetChanges.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-tertiary uppercase">Budgets ({teamBudgetChanges.length})</p>
                                            <div className="mt-1 space-y-1">
                                                {teamBudgetChanges.map((change) => {
                                                    const t = teams.find((tm) => tm.id === change.team_id);
                                                    return (
                                                        <div key={change.team_id} className="flex items-center justify-between text-sm">
                                                            <span className="text-primary">{t?.name ?? change.team_id}</span>
                                                            <EffectBadge value={change.surperformance_delta} label="surperf" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {driverEvolutions.length === 0 && teamBudgetChanges.length === 0 && (
                                        <p className="text-sm text-tertiary">Aucun changement a appliquer</p>
                                    )}
                                </div>
                            </SectionCard>

                            {/* Season summary */}
                            <div className="rounded-xl border border-secondary p-5">
                                <label htmlFor="season-summary" className="mb-2 block text-sm font-medium text-secondary">
                                    Resume de la saison (optionnel)
                                </label>
                                <textarea
                                    id="season-summary"
                                    className="w-full rounded-lg border border-primary bg-primary px-3 py-2 text-sm text-primary placeholder:text-placeholder focus:border-brand focus:outline-none"
                                    rows={3}
                                    placeholder="Faits marquants, surprises, moments forts..."
                                    value={seasonSummary}
                                    onChange={(e) => setSeasonSummary(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Success banner */}
                            <div className="flex items-center gap-3 rounded-xl border border-secondary bg-success-secondary p-4">
                                <FeaturedIcon icon={CheckCircle} color="success" theme="light" size="sm" />
                                <div>
                                    <p className="text-sm font-semibold text-primary">Saison archivee avec succes</p>
                                    <p className="text-sm text-tertiary">
                                        Tous les changements ont ete appliques. Exportez le recapitulatif avant de quitter.
                                    </p>
                                </div>
                            </div>

                            {/* Export controls */}
                            <div className="rounded-xl border border-secondary p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-md font-semibold text-primary">Export recapitulatif</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            iconLeading={copied ? CheckCircle : Copy01}
                                            onClick={handleCopy}
                                        >
                                            {copied ? "Copie !" : "Copier"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            iconLeading={Download01}
                                            onClick={handleDownload}
                                        >
                                            Telecharger .md
                                        </Button>
                                    </div>
                                </div>

                                {/* Section checkboxes */}
                                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
                                    {([
                                        ["champions", "Champions"],
                                        ["standings", "Classements"],
                                        ["stats", "Statistiques"],
                                        ["surperformances", "Surperformances"],
                                        ["evolutions", "Evolutions"],
                                        ["retirees", "Retraites"],
                                        ["arcs", "Arcs narratifs"],
                                    ] as [keyof EndSeasonExportSections, string][]).map(([key, label]) => (
                                        <Checkbox
                                            key={key}
                                            size="sm"
                                            label={label}
                                            isSelected={exportSections[key]}
                                            onChange={() => toggleExportSection(key)}
                                        />
                                    ))}
                                </div>

                                {/* Markdown preview */}
                                <pre className="overflow-auto rounded-xl border border-secondary bg-secondary p-4 text-sm text-secondary whitespace-pre-wrap font-mono max-h-[600px]">
                                    {exportMarkdown}
                                </pre>
                            </div>

                            {/* Go back to season */}
                            <div className="flex justify-end">
                                <Button
                                    size="md"
                                    color="primary"
                                    iconLeading={ArrowRight}
                                    href={`/season/${seasonId}`}
                                >
                                    Retour a la saison
                                </Button>
                            </div>
                        </div>
                    )}
                </Tabs.Panel>
            </Tabs>

            {/* Navigation buttons */}
            {!isArchived && (
                <div className="mt-8 flex items-center justify-between border-t border-secondary pt-4">
                    <Button
                        size="md"
                        color="secondary"
                        iconLeading={ArrowLeft}
                        onClick={goPrev}
                        isDisabled={currentStepIndex === 0}
                    >
                        Precedent
                    </Button>

                    {currentStepId === "validation" ? (
                        <Button
                            size="md"
                            color="primary"
                            iconLeading={CheckCircle}
                            onClick={handleArchive}
                            isLoading={archiveSeason.isPending}
                        >
                            Archiver la saison
                        </Button>
                    ) : (
                        <Button
                            size="md"
                            color="primary"
                            iconTrailing={ArrowRight}
                            onClick={goNext}
                        >
                            Suivant
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

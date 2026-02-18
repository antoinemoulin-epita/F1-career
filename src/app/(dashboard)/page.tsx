"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Globe02,
    ChevronDown,
    ChevronRight,
    ArrowUpRight,
    Database01,
    LayersThree01,
    Shield01,
    Zap,
    GitBranch01,
    FileCode02,
    Settings01,
    InfoCircle,
    Dataflow03,
    PuzzlePiece01,
    Eye,
} from "@untitledui/icons";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface RouteNode {
    path: string;
    label: string;
    description: string;
    dynamic?: boolean;
    children?: RouteNode[];
}

interface RuleItem {
    title: string;
    description: string;
    type: "pattern" | "rule" | "convention";
}

// ─── Route Map Data ─────────────────────────────────────────────────────────────

const siteRoutes: RouteNode[] = [
    {
        path: "/universe",
        label: "Univers",
        description: "Liste et gestion des univers paralleles",
        children: [
            { path: "/universe/new", label: "Nouvel Univers", description: "Formulaire de creation d'un univers" },
            {
                path: "/universe/[id]",
                label: "Detail Univers",
                description: "Vue d'ensemble d'un univers avec ses saisons",
                dynamic: true,
                children: [
                    { path: "/universe/[id]/backup", label: "Backup", description: "Export/import JSON de l'univers" },
                    { path: "/universe/[id]/arcs", label: "Arcs Narratifs", description: "Gestion des arcs narratifs" },
                    { path: "/universe/[id]/rookies", label: "Rookies", description: "Pool de rookies disponibles" },
                ],
            },
        ],
    },
    {
        path: "/season",
        label: "Saison",
        description: "Gestion de la saison en cours",
        children: [
            {
                path: "/season/[id]",
                label: "Detail Saison",
                description: "Vue d'ensemble d'une saison",
                dynamic: true,
                children: [
                    { path: "/season/[id]/calendar", label: "Calendrier", description: "Gestion du calendrier des courses" },
                    { path: "/season/[id]/teams", label: "Equipes", description: "Gestion des equipes de la saison" },
                    { path: "/season/[id]/drivers", label: "Pilotes", description: "Gestion des pilotes de la saison" },
                    { path: "/season/[id]/cars", label: "Voitures", description: "Stats des monoplaces" },
                    { path: "/season/[id]/engine-suppliers", label: "Motoristes", description: "Gestion des motoristes" },
                    { path: "/season/[id]/predictions", label: "Predictions", description: "Predictions pre-saison" },
                    { path: "/season/[id]/news", label: "Actualites", description: "News et evenements" },
                    { path: "/season/[id]/end-season", label: "Fin de Saison", description: "Archivage de fin de saison" },
                    {
                        path: "/season/[id]/race/[raceId]",
                        label: "Course",
                        description: "Pages liees a une course specifique",
                        dynamic: true,
                        children: [
                            { path: "/season/[id]/race/[raceId]/qualifying", label: "Qualifications", description: "Saisie des resultats de qualifications" },
                            { path: "/season/[id]/race/[raceId]/results", label: "Resultats", description: "Saisie des resultats de course" },
                            { path: "/season/[id]/race/[raceId]/export", label: "Export Pre-Course", description: "Template social media pre-course" },
                            { path: "/season/[id]/race/[raceId]/export/post", label: "Export Post-Course", description: "Template social media post-course" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: "/history",
        label: "Palmares",
        description: "Historique et hall of fame",
        children: [
            { path: "/history/champions", label: "Champions", description: "Tableau d'honneur des champions" },
            { path: "/history/wins", label: "Victoires", description: "Toutes les victoires en course" },
            { path: "/history/records", label: "Records", description: "Records all-time (series, stats)" },
            { path: "/history/seasons", label: "Saisons", description: "Archives des saisons terminees" },
            { path: "/history/seasons/[year]", label: "Saison Archivee", description: "Detail d'une saison archivee par annee", dynamic: true },
        ],
    },
    {
        path: "/stats",
        label: "Statistiques",
        description: "Analyses et comparaisons statistiques",
        children: [
            { path: "/stats/head-to-head", label: "Duel Coequipiers", description: "Head-to-head entre coequipiers" },
            { path: "/stats/circuits", label: "Circuits", description: "Statistiques par circuit" },
            { path: "/stats/drivers", label: "Pilotes", description: "Statistiques all-time pilotes" },
            { path: "/stats/compare", label: "Comparaison", description: "Comparaison cote a cote" },
        ],
    },
    {
        path: "/profile",
        label: "Encyclopedie",
        description: "Fiches detaillees des entites",
        children: [
            { path: "/profile/driver", label: "Pilotes", description: "Annuaire des pilotes (person_identities)" },
            { path: "/profile/driver/[personId]", label: "Fiche Pilote", description: "Profil carriere d'un pilote", dynamic: true },
            { path: "/profile/team", label: "Equipes", description: "Annuaire des equipes (team_identities)" },
            { path: "/profile/team/[teamIdentityId]", label: "Fiche Equipe", description: "Profil d'une identite d'equipe", dynamic: true },
            { path: "/profile/circuit", label: "Circuits", description: "Annuaire des circuits" },
            { path: "/profile/circuit/[circuitId]", label: "Fiche Circuit", description: "Profil d'un circuit", dynamic: true },
            { path: "/profile/engine-supplier/[id]", label: "Fiche Motoriste", description: "Profil d'un motoriste", dynamic: true },
            { path: "/profile/staff/[personId]", label: "Fiche Staff", description: "Profil d'un membre du staff", dynamic: true },
        ],
    },
];

const architectureRules: RuleItem[] = [
    { title: "Hierarchie Universe > Season > Race", description: "Toutes les donnees sont organisees dans une hierarchie stricte. Un univers contient des saisons, chaque saison a ses equipes/pilotes/calendrier, et chaque course a ses qualifications et resultats.", type: "pattern" },
    { title: "Person/Team Identity", description: "Les pilotes sont lies entre saisons via person_identities, les equipes via team_identities. Cela permet a l'encyclopedie d'afficher des profils sur toute la carriere, pas juste une saison.", type: "pattern" },
    { title: "Client-side Data Fetching", description: "Tout le fetching de donnees utilise TanStack Query dans des composants client. Pas de Server Components pour les donnees. Le cote serveur gere uniquement l'auth (middleware + server actions).", type: "rule" },
    { title: "Query Key Factory", description: "Chaque hook definit un objet queryKeys avec des cles structurees (ex: seasonKeys.detail(id)). Les mutations invalident precisement les bonnes cles.", type: "convention" },
    { title: "Validation Zod + react-hook-form", description: "Tous les formulaires utilisent des schemas Zod (dans /src/lib/validators/) resolus par @hookform/resolvers/zod.", type: "convention" },
    { title: "UI en Francais", description: "Tout le texte utilisateur est en francais. Les labels, messages d'erreur, placeholders, breadcrumbs, etc.", type: "rule" },
    { title: "Prefix Matching Navigation", description: "La sidebar utilise isActiveMatch() avec prefix matching (startsWith) pour highlighter le bon item meme dans les sous-pages.", type: "pattern" },
    { title: "Breadcrumbs > Back Links", description: "Les breadcrumbs remplacent les boutons ArrowLeft pour la navigation retour. Chaque page definit ses items manuellement.", type: "convention" },
    { title: "PageLoading / PageError / PageEmpty", description: "Composants wrapper standardises qui remplacent les blocs loading/error/empty dupliques (~15 lignes chacun).", type: "convention" },
    { title: "Mutation Cascade", description: "Les mutations complexes (ex: useSaveRaceResults) gerent des operations multi-etapes : delete + insert + recompute + update status, le tout dans une seule mutation.", type: "pattern" },
    { title: "Auth Middleware", description: "Le middleware Supabase refresh le token a chaque requete. Les utilisateurs non-authentifies sont rediriges vers /login. Les authentifies sur /login sont rediriges vers /universe.", type: "rule" },
    { title: "Semantic Color Classes", description: "Utiliser text-primary, bg-secondary, border-brand, etc. Jamais de couleurs brutes comme text-gray-900 ou bg-blue-700.", type: "rule" },
];

const dataHooks = [
    { domain: "Univers", hooks: ["useUniverses", "useUniverse", "useCreateUniverse", "useUpdateUniverse", "useDeleteUniverse"] },
    { domain: "Saisons", hooks: ["useSeasons", "useSeason", "useCurrentSeason", "useCreateSeason"] },
    { domain: "Equipes", hooks: ["useTeams", "useTeam", "useCreateTeam", "useUpdateTeam", "useDeleteTeam"] },
    { domain: "Pilotes", hooks: ["useDrivers", "useDriver", "useCreateDriver", "useUpdateDriver", "useDeleteDriver"] },
    { domain: "Voitures", hooks: ["useCars", "useCar", "useCreateCar", "useUpdateCar"] },
    { domain: "Motoristes", hooks: ["useEngineSuppliers", "useCreateEngineSupplier", "useUpdateEngineSupplier", "useDeleteEngineSupplier"] },
    { domain: "Calendrier", hooks: ["useCalendar", "useAddRace", "useRemoveRace", "useReorderRaces"] },
    { domain: "Qualifications", hooks: ["useRace", "useQualifying", "useSaveQualifying"] },
    { domain: "Resultats", hooks: ["useRaceResults", "usePointsSystem", "useSaveRaceResults"] },
    { domain: "Classements", hooks: ["useDriverStandings", "useConstructorStandings"] },
    { domain: "Predictions", hooks: ["useDriverPredictions", "useConstructorPredictions", "useGeneratePredictions", "useLockPredictions"] },
    { domain: "Historique", hooks: ["useChampions", "useAllTimeStats", "useRaceWinDetails", "useArchivedSeason"] },
    { domain: "Statistiques", hooks: ["useCompletedSeasons", "useTeamsBySeason", "useTeammateH2H", "useCircuitStats"] },
    { domain: "Arcs Narratifs", hooks: ["useNarrativeArcs", "useAllNarrativeArcs", "useCreateArc", "useUpdateArc", "useDeleteArc"] },
    { domain: "News", hooks: ["useNews", "useCreateNews", "useUpdateNews", "useDeleteNews"] },
    { domain: "Backup", hooks: ["useExportUniverse", "useImportUniverse"] },
    { domain: "Profils", hooks: ["usePersonProfile", "usePersonSeasons", "usePersonRaceHistory", "useTeamProfile", "useTeamHistory", "useCircuitProfile"] },
    { domain: "Fin de Saison", hooks: ["useArchiveSeason"] },
];

const techStack = [
    { name: "Next.js 16.1", role: "Framework (App Router)", color: "gray" as const },
    { name: "React 19", role: "UI Library", color: "blue" as const },
    { name: "TypeScript", role: "Type Safety", color: "blue" as const },
    { name: "Tailwind CSS v4.1", role: "Styling", color: "indigo" as const },
    { name: "React Aria", role: "Accessibility", color: "purple" as const },
    { name: "Supabase", role: "Backend / Auth / DB", color: "success" as const },
    { name: "TanStack Query", role: "Data Fetching", color: "orange" as const },
    { name: "Zod", role: "Validation", color: "warning" as const },
    { name: "react-hook-form", role: "Formulaires", color: "pink" as const },
    { name: "next-themes", role: "Dark Mode", color: "gray" as const },
    { name: "sonner", role: "Toast Notifications", color: "gray" as const },
    { name: "date-fns", role: "Dates", color: "gray" as const },
];

// ─── Components ─────────────────────────────────────────────────────────────────

function RouteTree({ routes, depth = 0 }: { routes: RouteNode[]; depth?: number }) {
    return (
        <div className={depth > 0 ? "ml-5 border-l border-tertiary pl-4" : ""}>
            {routes.map((route) => (
                <RouteTreeItem key={route.path} route={route} depth={depth} />
            ))}
        </div>
    );
}

function RouteTreeItem({ route, depth }: { route: RouteNode; depth: number }) {
    const [open, setOpen] = useState(depth < 1);
    const hasChildren = route.children && route.children.length > 0;
    const isClickable = !route.dynamic;

    return (
        <div className="py-1">
            <div className="group flex items-start gap-2 rounded-lg px-3 py-2 transition duration-100 ease-linear hover:bg-secondary">
                {hasChildren ? (
                    <button
                        onClick={() => setOpen(!open)}
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-fg-quaternary transition duration-100 ease-linear hover:bg-tertiary hover:text-fg-secondary"
                    >
                        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>
                ) : (
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                        <span className="size-1.5 rounded-full bg-quaternary" />
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {isClickable ? (
                            <Link
                                href={route.path}
                                className="font-mono text-sm font-medium text-brand-secondary transition duration-100 ease-linear hover:underline"
                            >
                                {route.path}
                            </Link>
                        ) : (
                            <span className="font-mono text-sm font-medium text-primary">{route.path}</span>
                        )}
                        {route.dynamic && (
                            <Badge size="sm" color="warning" type="pill-color">
                                dynamic
                            </Badge>
                        )}
                        {isClickable && (
                            <ArrowUpRight className="size-3.5 text-fg-quaternary opacity-0 transition duration-100 ease-linear group-hover:opacity-100" />
                        )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-sm font-medium text-secondary">{route.label}</span>
                        <span className="text-sm text-tertiary">— {route.description}</span>
                    </div>
                </div>
            </div>
            {hasChildren && open && <RouteTree routes={route.children!} depth={depth + 1} />}
        </div>
    );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Globe02; title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary">
                <Icon className="size-5 text-fg-brand-primary" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-primary">{title}</h2>
                <p className="text-sm text-tertiary">{subtitle}</p>
            </div>
        </div>
    );
}

function RuleCard({ rule }: { rule: RuleItem }) {
    const typeConfig = {
        pattern: { label: "Pattern", color: "brand" as const, dot: "success" as const },
        rule: { label: "Regle", color: "error" as const, dot: "error" as const },
        convention: { label: "Convention", color: "blue" as const, dot: "blue" as const },
    };
    const config = typeConfig[rule.type];

    return (
        <div className="rounded-xl border border-secondary bg-primary p-4">
            <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-primary">{rule.title}</h4>
                <BadgeWithDot size="sm" color={config.color} type="pill-color">
                    {config.label}
                </BadgeWithDot>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-tertiary">{rule.description}</p>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [expandedHooks, setExpandedHooks] = useState<string | null>(null);

    const totalRoutes = countRoutes(siteRoutes);

    return (
        <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="border-b border-secondary pb-6">
                <div className="flex items-center gap-2">
                    <Badge size="sm" color="brand" type="pill-color">
                        Developer
                    </Badge>
                    <Badge size="sm" color="gray" type="pill-color">
                        Internal
                    </Badge>
                </div>
                <h1 className="mt-3 text-display-sm font-semibold text-primary">Architecture du Site</h1>
                <p className="mt-2 text-md text-tertiary">
                    Documentation technique du F1 Career Manager — structure, routes, regles et patterns.
                </p>

                {/* Quick stats */}
                <div className="mt-5 flex flex-wrap gap-3">
                    {[
                        { label: "Routes", value: `~${totalRoutes}` },
                        { label: "Hooks", value: "39+" },
                        { label: "Entites DB", value: "29" },
                        { label: "Vues DB", value: "14" },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border border-secondary bg-secondary px-3 py-1.5">
                            <span className="text-sm font-semibold text-primary">{stat.value}</span>{" "}
                            <span className="text-sm text-tertiary">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech Stack */}
            <section className="mt-8">
                <SectionHeader icon={LayersThree01} title="Stack Technique" subtitle="Technologies et librairies utilisees" />
                <div className="mt-4 flex flex-wrap gap-2">
                    {techStack.map((tech) => (
                        <div
                            key={tech.name}
                            className="flex items-center gap-2 rounded-lg border border-secondary bg-primary px-3 py-2"
                        >
                            <span className="text-sm font-medium text-primary">{tech.name}</span>
                            <span className="text-xs text-quaternary">·</span>
                            <span className="text-xs text-tertiary">{tech.role}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Concept */}
            <section className="mt-10">
                <SectionHeader icon={InfoCircle} title="Concept" subtitle="Le modele de donnees du F1 Career Manager" />
                <div className="mt-4 rounded-xl border border-secondary bg-primary p-5">
                    <div className="space-y-4 text-sm leading-relaxed text-secondary">
                        <p>
                            <strong className="text-primary">F1 Career Manager</strong> est une application de gestion de mode
                            carriere F1, permettant de suivre et simuler des campagnes sur plusieurs{" "}
                            <strong className="text-primary">univers paralleles</strong> (timelines alternatives).
                        </p>
                        <div className="flex items-start gap-3 rounded-lg bg-secondary p-4">
                            <Dataflow03 className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" />
                            <div>
                                <p className="font-semibold text-primary">Hierarchie des donnees</p>
                                <p className="mt-1 text-tertiary">
                                    <span className="font-mono text-brand-secondary">Universe</span> →{" "}
                                    <span className="font-mono text-brand-secondary">Season</span> →{" "}
                                    <span className="font-mono text-brand-secondary">Race</span> — Chaque univers contient
                                    plusieurs saisons. Chaque saison a ses equipes, pilotes, calendrier et classements. Chaque
                                    course a ses qualifications et resultats.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg bg-secondary p-4">
                            <PuzzlePiece01 className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" />
                            <div>
                                <p className="font-semibold text-primary">Identites persistantes</p>
                                <p className="mt-1 text-tertiary">
                                    Les <span className="font-mono text-brand-secondary">person_identities</span> et{" "}
                                    <span className="font-mono text-brand-secondary">team_identities</span> lient les entites
                                    entre saisons, permettant des profils de carriere complets dans l&apos;encyclopedie.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg bg-secondary p-4">
                            <Eye className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" />
                            <div>
                                <p className="font-semibold text-primary">Modules fonctionnels</p>
                                <p className="mt-1 text-tertiary">
                                    <strong>Palmares</strong> — historique, champions, records.{" "}
                                    <strong>Statistiques</strong> — analyses, duels, comparaisons.{" "}
                                    <strong>Encyclopedie</strong> — fiches pilotes, equipes, circuits, motoristes.{" "}
                                    <strong>Export</strong> — templates social media pre/post-course.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Site Map */}
            <section className="mt-10">
                <SectionHeader icon={GitBranch01} title="Plan du Site" subtitle={`${totalRoutes} routes dans le dashboard`} />

                {/* Auth routes */}
                <div className="mt-4 rounded-xl border border-secondary bg-primary p-5">
                    <div className="flex items-center gap-2">
                        <Shield01 className="size-4 text-fg-quaternary" />
                        <span className="text-sm font-semibold text-primary">Authentification</span>
                        <Badge size="sm" color="gray" type="pill-color">hors sidebar</Badge>
                    </div>
                    <div className="mt-3 ml-1">
                        <div className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary">
                            <span className="size-1.5 rounded-full bg-quaternary" />
                            <Link href="/login" className="font-mono text-sm font-medium text-brand-secondary hover:underline">
                                /login
                            </Link>
                            <span className="text-sm text-tertiary">— Connexion email/password (Zod + react-hook-form)</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard routes */}
                <div className="mt-3 rounded-xl border border-secondary bg-primary p-5">
                    <div className="flex items-center gap-2">
                        <LayersThree01 className="size-4 text-fg-quaternary" />
                        <span className="text-sm font-semibold text-primary">Dashboard</span>
                        <Badge size="sm" color="brand" type="pill-color">sidebar layout</Badge>
                    </div>

                    {/* Dashboard root */}
                    <div className="mt-3 ml-1">
                        <div className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary">
                            <span className="size-1.5 rounded-full bg-quaternary" />
                            <span className="font-mono text-sm font-medium text-primary">/</span>
                            <span className="text-sm text-tertiary">— Cette page (documentation architecture)</span>
                        </div>
                    </div>

                    <div className="mt-2">
                        <RouteTree routes={siteRoutes} />
                    </div>
                </div>
            </section>

            {/* Architecture Rules */}
            <section className="mt-10">
                <SectionHeader icon={Settings01} title="Regles & Patterns" subtitle="Conventions architecturales du projet" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {architectureRules.map((rule) => (
                        <RuleCard key={rule.title} rule={rule} />
                    ))}
                </div>
            </section>

            {/* Data Layer */}
            <section className="mt-10">
                <SectionHeader icon={Database01} title="Data Layer" subtitle="Hooks TanStack Query par domaine" />
                <div className="mt-4 space-y-2">
                    {dataHooks.map((group) => (
                        <div key={group.domain} className="rounded-xl border border-secondary bg-primary">
                            <button
                                onClick={() => setExpandedHooks(expandedHooks === group.domain ? null : group.domain)}
                                className="flex w-full items-center justify-between px-4 py-3 text-left transition duration-100 ease-linear hover:bg-secondary rounded-xl"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-primary">{group.domain}</span>
                                    <span className="text-xs text-quaternary">{group.hooks.length} hooks</span>
                                </div>
                                {expandedHooks === group.domain ? (
                                    <ChevronDown className="size-4 text-fg-quaternary" />
                                ) : (
                                    <ChevronRight className="size-4 text-fg-quaternary" />
                                )}
                            </button>
                            {expandedHooks === group.domain && (
                                <div className="border-t border-secondary px-4 py-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.hooks.map((hook) => {
                                            const isMutation = hook.startsWith("useCreate") || hook.startsWith("useUpdate") || hook.startsWith("useDelete") || hook.startsWith("useSave") || hook.startsWith("useGenerate") || hook.startsWith("useLock") || hook.startsWith("useArchive") || hook.startsWith("useAdd") || hook.startsWith("useRemove") || hook.startsWith("useReorder") || hook.startsWith("useExport") || hook.startsWith("useImport");
                                            return (
                                                <span
                                                    key={hook}
                                                    className={`rounded-md px-2 py-1 font-mono text-xs ${
                                                        isMutation
                                                            ? "bg-warning-secondary text-warning-primary"
                                                            : "bg-success-secondary text-success-primary"
                                                    }`}
                                                >
                                                    {hook}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-quaternary">
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block size-2 rounded-full bg-success-solid" /> Query
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block size-2 rounded-full bg-warning-solid" /> Mutation
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* File Structure */}
            <section className="mt-10">
                <SectionHeader icon={FileCode02} title="Structure des Fichiers" subtitle="Organisation du code source" />
                <div className="mt-4 rounded-xl border border-secondary bg-primary p-5">
                    <pre className="text-sm leading-relaxed text-secondary">
{`src/
├── app/
│   ├── (auth)/login/          # Auth (hors layout dashboard)
│   ├── (dashboard)/           # Layout principal avec sidebar
│   │   ├── universe/          # Gestion des univers
│   │   ├── season/            # Gestion des saisons & courses
│   │   ├── history/           # Palmares & archives
│   │   ├── stats/             # Statistiques & analyses
│   │   ├── profile/           # Encyclopedie (pilotes, equipes, circuits)
│   │   └── export/            # Export standalone
│   └── layout.tsx             # Root layout (providers)
├── components/
│   ├── base/                  # Composants UI (Button, Input, Select, Badge...)
│   ├── application/           # Composants complexes (Modal, Table, Sidebar...)
│   ├── foundations/           # Tokens design (FeaturedIcon, colors...)
│   └── shared-assets/        # Assets (illustrations)
├── hooks/                     # 39+ TanStack Query hooks
├── lib/
│   ├── auth/                  # Server actions (signIn, signOut)
│   ├── supabase/              # Client browser/server + types generes
│   ├── calculations/          # Points, predictions, stats
│   ├── export/                # Templates social media
│   ├── import/                # Import JSON schema + logique
│   ├── validators/            # Schemas Zod
│   └── constants/             # Nationalites, labels d'arcs
├── providers/                 # QueryProvider, RouteProvider, Theme
├── types/                     # Types derives de Supabase (29 entites, 14 vues)
└── styles/                    # globals.css, theme.css, typography.css`}
                    </pre>
                </div>
            </section>

            {/* Providers */}
            <section className="mt-10">
                <SectionHeader icon={Zap} title="Providers" subtitle="Contextes React qui wrappent l'application" />
                <div className="mt-4 space-y-3">
                    {[
                        {
                            name: "QueryProvider",
                            file: "/src/providers/query-provider.tsx",
                            desc: "TanStack React Query — staleTime 60s, gestion globale des erreurs mutations via sonner toast, Toaster dark theme.",
                        },
                        {
                            name: "RouteProvider",
                            file: "/src/providers/router-provider.tsx",
                            desc: "Bridge Next.js useRouter().push vers React Aria RouterProvider pour la navigation des composants.",
                        },
                        {
                            name: "Theme",
                            file: "/src/providers/theme.tsx",
                            desc: "next-themes ThemeProvider — strategie 'class', dark par defaut. light='light-mode', dark='dark-mode'.",
                        },
                    ].map((provider) => (
                        <div key={provider.name} className="rounded-xl border border-secondary bg-primary p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-primary">{provider.name}</span>
                                <span className="font-mono text-xs text-quaternary">{provider.file}</span>
                            </div>
                            <p className="mt-1 text-sm text-tertiary">{provider.desc}</p>
                        </div>
                    ))}
                    <div className="rounded-lg bg-secondary p-3">
                        <p className="text-xs text-tertiary">
                            <strong className="text-secondary">Ordre de wrapping :</strong>{" "}
                            <span className="font-mono">QueryProvider → RouteProvider → Theme → children</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Auth Flow */}
            <section className="mt-10 pb-12">
                <SectionHeader icon={Shield01} title="Auth Flow" subtitle="Flux d'authentification Supabase" />
                <div className="mt-4 rounded-xl border border-secondary bg-primary p-5">
                    <div className="space-y-3">
                        {[
                            { step: "1", label: "Middleware", desc: "Chaque requete passe par middleware.ts qui appelle updateSession() pour refresher le token Supabase." },
                            { step: "2", label: "Guard", desc: "Si non authentifie → redirect vers /login. Si authentifie sur /login → redirect vers /universe." },
                            { step: "3", label: "Server Actions", desc: "signIn(email, password) et signOut() sont des server actions dans /src/lib/auth/actions.ts." },
                            { step: "4", label: "Client Supabase", desc: "createBrowserClient() pour le client-side, createServerClient() pour le server-side. Variables env NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY." },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-3">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-semibold text-brand-secondary">
                                    {item.step}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-primary">{item.label}</p>
                                    <p className="text-sm text-tertiary">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function countRoutes(routes: RouteNode[]): number {
    return routes.reduce((count, route) => {
        return count + 1 + (route.children ? countRoutes(route.children) : 0);
    }, 0);
}

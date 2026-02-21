"use client";

import { useCallback, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    Edit05,
    Plus,
    Trash02,
    Upload01,
    Zap,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { NewsForm } from "@/components/forms/news-form";
import { ImportJsonDialog } from "@/components/forms/import-json-dialog";
import { useImportNews } from "@/hooks/use-import-news";
import { useNews, useDeleteNews } from "@/hooks/use-news";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useNewsMentionsByNewsIds } from "@/hooks/use-news-mentions";
import { usePersonIdentities, useTeamIdentities } from "@/hooks/use-staff";
import { useSeason } from "@/hooks/use-seasons";
import { newsImportSchema, type NewsImportValues } from "@/lib/validators/news-import";
import type { NewsFormValues } from "@/lib/validators";
import { newsTypeLabels, newsTypeBadgeColor } from "@/lib/constants/arc-labels";
import { cx } from "@/utils/cx";
import type { News } from "@/types";

// ─── CreateNewsDialog ───────────────────────────────────────────────────────

function CreateNewsDialog({
    seasonId,
    universeId,
}: {
    seasonId: string;
    universeId: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                Nouvelle news
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon
                                    icon={Plus}
                                    color="brand"
                                    theme="light"
                                    size="md"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">
                                        Nouvelle news
                                    </h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        Ajoutez une actualite a cette saison.
                                    </p>
                                </div>
                            </div>
                            <NewsForm
                                seasonId={seasonId}
                                universeId={universeId}
                                onSuccess={() => setIsOpen(false)}
                                onCancel={() => setIsOpen(false)}
                            />
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── EditNewsDialog ─────────────────────────────────────────────────────────

function EditNewsDialog({
    seasonId,
    universeId,
    news,
    onClose,
}: {
    seasonId: string;
    universeId: string;
    news: News;
    onClose: () => void;
}) {
    return (
        <ModalOverlay isOpen onOpenChange={(open) => { if (!open) onClose(); }}>
            <Modal className="max-w-lg">
                <Dialog>
                    <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                        <div className="mb-5 flex items-start gap-4">
                            <FeaturedIcon
                                icon={Edit05}
                                color="brand"
                                theme="light"
                                size="md"
                            />
                            <div>
                                <h2 className="text-lg font-semibold text-primary">
                                    Modifier la news
                                </h2>
                                <p className="mt-1 text-sm text-tertiary">
                                    Modifiez les details de cette actualite.
                                </p>
                            </div>
                        </div>
                        <NewsForm
                            seasonId={seasonId}
                            universeId={universeId}
                            news={news}
                            onSuccess={onClose}
                            onCancel={onClose}
                        />
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}

// ─── DeleteNewsDialog ───────────────────────────────────────────────────────

function DeleteNewsDialog({
    seasonId,
    news,
    onClose,
}: {
    seasonId: string;
    news: News;
    onClose: () => void;
}) {
    const deleteNews = useDeleteNews();

    const handleDelete = () => {
        deleteNews.mutate(
            { id: news.id, seasonId },
            { onSuccess: onClose },
        );
    };

    return (
        <ModalOverlay isOpen onOpenChange={(open) => { if (!open) onClose(); }}>
            <Modal className="max-w-md">
                <Dialog>
                    <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                        <div className="mb-5">
                            <FeaturedIcon
                                icon={AlertCircle}
                                color="error"
                                theme="light"
                                size="md"
                            />
                        </div>
                        <h2 className="text-lg font-semibold text-primary">
                            Supprimer la news
                        </h2>
                        <p className="mt-1 text-sm text-tertiary">
                            Etes-vous sur de vouloir supprimer{" "}
                            <span className="font-medium text-primary">
                                {news.headline}
                            </span>
                            ? Cette action est irreversible.
                        </p>

                        <div className="mt-8 flex justify-end gap-3">
                            <Button
                                size="md"
                                color="secondary"
                                onClick={onClose}
                            >
                                Annuler
                            </Button>
                            <Button
                                size="md"
                                color="primary-destructive"
                                onClick={handleDelete}
                                isLoading={deleteNews.isPending}
                            >
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}

// ─── Mention type ───────────────────────────────────────────────────────────

interface MentionInfo {
    name: string;
    entityType: string;
    entityId: string;
}

function getMentionHref(mention: MentionInfo): string {
    switch (mention.entityType) {
        case "driver":
            return `/profile/driver/${mention.entityId}`;
        case "team":
            return `/profile/team/${mention.entityId}`;
        case "staff":
            return `/profile/staff/${mention.entityId}`;
        default:
            return "#";
    }
}

// ─── Newspaper UI components ────────────────────────────────────────────────

function NewspaperMasthead({ year, total }: { year: number; total: number }) {
    return (
        <div className="mb-8">
            {/* Double red rule - top */}
            <div className="mb-3 flex flex-col gap-0.5">
                <div className="h-1 bg-brand-600" />
                <div className="h-px bg-brand-600" />
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <h1 className="font-serif text-display-md font-bold uppercase tracking-tight text-primary">
                        Paddock Tribune
                    </h1>
                    <p className="font-serif text-sm italic text-tertiary">
                        Le journal officiel du paddock
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-serif text-sm font-semibold text-secondary">
                        Saison {year}
                    </p>
                    <p className="text-xs text-tertiary">
                        {total} article{total !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Double red rule - bottom */}
            <div className="mt-3 flex flex-col gap-0.5">
                <div className="h-px bg-brand-600" />
                <div className="h-1 bg-brand-600" />
            </div>
        </div>
    );
}

function RoundEditionHeader({ round, gpCount }: { round: number | null; gpCount?: number | null }) {
    const label =
        round != null && round > 0
            ? gpCount != null && round >= gpCount
                ? "Post-saison"
                : `Edition Round ${round}`
            : "Pre-saison";

    return (
        <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-border-secondary" />
            <span className="font-serif text-xs font-semibold uppercase tracking-widest text-tertiary">
                — {label} —
            </span>
            <div className="h-px flex-1 bg-border-secondary" />
        </div>
    );
}

const importanceBarColor: Record<number, string> = {
    5: "bg-brand-600",
    4: "bg-brand-500",
    3: "bg-brand-400",
    2: "bg-brand-200",
    1: "bg-brand-100",
    0: "bg-brand-100",
};

// ─── NewsCard ───────────────────────────────────────────────────────────────

function NewsCard({
    news,
    arcName,
    seasonId,
    mentions,
    onEdit,
    onDelete,
}: {
    news: News;
    arcName: string | null;
    seasonId: string;
    mentions: MentionInfo[];
    onEdit: () => void;
    onDelete: () => void;
}) {
    const typeKey = news.news_type ?? "other";
    const importance = news.importance ?? 0;
    const isFlash = importance >= 5;

    return (
        <div className="flex">
            {/* Vertical importance bar */}
            <div
                className={cx(
                    "w-1 shrink-0 rounded-l-xl",
                    importanceBarColor[importance] ?? "bg-brand-100",
                )}
            />

            {/* Card body */}
            <div className="flex min-w-0 flex-1 items-start justify-between gap-3 rounded-r-xl border border-l-0 border-secondary bg-primary p-4 transition duration-100 ease-linear hover:bg-primary_hover">
                <a
                    href={`/season/${seasonId}/news/${news.id}`}
                    className="min-w-0 flex-1"
                >
                    {isFlash && (
                        <div className="mb-1 flex items-center gap-1">
                            <Zap className="size-3.5 text-brand-600" />
                            <span className="font-serif text-xs font-bold uppercase tracking-wider text-brand-600">
                                Flash Info
                            </span>
                        </div>
                    )}

                    <p
                        className={cx(
                            "font-serif text-primary",
                            isFlash
                                ? "text-lg font-bold"
                                : importance >= 3
                                  ? "text-md font-semibold"
                                  : "text-sm font-medium",
                        )}
                    >
                        {news.headline}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge
                            size="sm"
                            color={newsTypeBadgeColor[typeKey] ?? "gray"}
                            type="pill-color"
                        >
                            {newsTypeLabels[typeKey] ?? typeKey}
                        </Badge>
                        <span className="text-xs text-tertiary">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span
                                    key={i}
                                    className={
                                        i < importance
                                            ? "text-warning-primary"
                                            : "text-quaternary"
                                    }
                                >
                                    ★
                                </span>
                            ))}
                        </span>
                        {arcName && (
                            <Badge size="sm" color="brand" type="pill-color">
                                {arcName}
                            </Badge>
                        )}
                        {mentions.map((mention) => (
                            <Link
                                key={`${mention.entityType}-${mention.entityId}`}
                                href={getMentionHref(mention)}
                                onClick={(e) => e.stopPropagation()}
                                className="transition duration-100 ease-linear hover:opacity-80"
                            >
                                <Badge size="sm" color="blue" type="pill-color">
                                    {mention.name}
                                </Badge>
                            </Link>
                        ))}
                    </div>

                    {news.content && (
                        <p className="mt-2 line-clamp-2 text-sm text-tertiary">
                            {news.content}
                        </p>
                    )}
                </a>
                <Dropdown.Root>
                    <Dropdown.DotsButton />
                    <Dropdown.Popover>
                        <Dropdown.Menu
                            onAction={(key) => {
                                if (key === "edit") onEdit();
                                if (key === "delete") onDelete();
                            }}
                        >
                            <Dropdown.Item id="edit" icon={Edit05} label="Modifier" />
                            <Dropdown.Separator />
                            <Dropdown.Item id="delete" icon={Trash02} label="Supprimer" />
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown.Root>
            </div>
        </div>
    );
}

// ─── Import config ─────────────────────────────────────────────────────────

const newsExampleJson = JSON.stringify(
    [
        {
            headline: "Hamilton signe chez Ferrari",
            content: "Lewis Hamilton rejoint la Scuderia pour 2025",
            news_type: "transfer",
            importance: 5,
            after_round: 0,
            arc: "Rivalite Hamilton / Verstappen",
        },
    ],
    null,
    2,
);

function buildNewsFields(arcNames: string[]) {
    const arcDesc = arcNames.length > 0
        ? `Nom de l'arc narratif : ${arcNames.join(", ")}`
        : "Nom de l'arc narratif (aucun arc existant)";
    return [
        { name: "headline", required: true, description: "Titre de la news" },
        { name: "content", required: false, description: "Contenu detaille" },
        {
            name: "news_type",
            required: true,
            description:
                "Type : transfer, technical, sponsor, regulation, injury, retirement, on_track, business, world, feeder_series, personality, other",
        },
        { name: "importance", required: true, description: "1 (Mineur) a 5 (Majeur)" },
        { name: "after_round", required: false, description: "Apres quel round (0 = pre-saison)" },
        { name: "arc", required: false, description: arcDesc },
    ];
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NewsPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: season, isLoading: seasonLoading } = useSeason(seasonId);
    const { data: news, isLoading: newsLoading } = useNews(seasonId);
    const { data: arcs } = useNarrativeArcs(season?.universe_id ?? "");
    const importNews = useImportNews();

    // Load all mentions for this season's news
    const newsIds = useMemo(() => (news ?? []).map((n) => n.id), [news]);
    const { data: allMentions } = useNewsMentionsByNewsIds(newsIds);
    const { data: personIdentities } = usePersonIdentities(season?.universe_id ?? "");
    const { data: teamIdentities } = useTeamIdentities(season?.universe_id ?? "");

    // Build entity name maps
    const entityNameMap = useMemo(() => {
        const map = new Map<string, string>();
        (personIdentities ?? []).forEach((p) => {
            map.set(p.id, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim());
        });
        (teamIdentities ?? []).forEach((t) => {
            map.set(t.id, t.name ?? "");
        });
        return map;
    }, [personIdentities, teamIdentities]);

    // Build mentions-per-news map
    const mentionsPerNews = useMemo(() => {
        const map = new Map<string, MentionInfo[]>();
        (allMentions ?? []).forEach((m) => {
            const name = entityNameMap.get(m.entity_id);
            if (!name) return;
            if (!map.has(m.news_id)) map.set(m.news_id, []);
            map.get(m.news_id)!.push({
                name,
                entityType: m.entity_type,
                entityId: m.entity_id,
            });
        });
        return map;
    }, [allMentions, entityNameMap]);

    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [deletingNews, setDeletingNews] = useState<News | null>(null);

    const isLoading = seasonLoading || newsLoading;

    // Build arc name map
    const arcNameMap = useMemo(() => {
        const map = new Map<string, string>();
        (arcs ?? []).forEach((a) => {
            if (a.id && a.name) map.set(a.id, a.name);
        });
        return map;
    }, [arcs]);

    const newsFields = useMemo(
        () => buildNewsFields((arcs ?? []).map((a) => a.name)),
        [arcs],
    );

    const resolveNews = useCallback(
        (items: NewsImportValues[]) => {
            const nameToId = new Map(
                (arcs ?? []).map((a) => [a.name.toLowerCase(), a.id]),
            );
            const resolved: NewsFormValues[] = [];
            const errors: string[] = [];

            items.forEach((item, i) => {
                const { arc, ...rest } = item;
                if (arc) {
                    const id = nameToId.get(arc.trim().toLowerCase());
                    if (!id) {
                        errors.push(`Element ${i + 1} : arc "${arc}" introuvable`);
                        return;
                    }
                    resolved.push({ ...rest, arc_id: id });
                } else {
                    resolved.push({ ...rest, arc_id: null });
                }
            });

            return { resolved, errors };
        },
        [arcs],
    );

    // Group news by round
    const grouped = useMemo(() => {
        const groups = new Map<number | null, News[]>();
        (news ?? []).forEach((n) => {
            const round = n.after_round;
            if (!groups.has(round)) groups.set(round, []);
            groups.get(round)!.push(n);
        });

        // Sort groups: numeric rounds desc, then null at the end
        const sorted = [...groups.entries()].sort((a, b) => {
            if (a[0] === null && b[0] === null) return 0;
            if (a[0] === null) return 1;
            if (b[0] === null) return -1;
            return b[0] - a[0];
        });

        return sorted;
    }, [news]);

    if (isLoading) {
        return <PageLoading label="Chargement des news..." />;
    }

    if (!season) {
        return (
            <PageError
                title="Saison introuvable"
                description="Impossible de trouver cette saison."
                backHref="/"
                backLabel="Retour"
            />
        );
    }

    const total = news?.length ?? 0;

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs items={[
                    { label: "Saison", href: `/season/${seasonId}` },
                    { label: "News" },
                ]} />
            </div>

            {/* Masthead */}
            <NewspaperMasthead year={season.year} total={total} />

            {/* Action buttons */}
            <div className="mb-6 flex items-center justify-end gap-3">
                <ImportJsonDialog<NewsImportValues, NewsFormValues>
                    title="Importer des news"
                    description="Importez des actualites depuis un fichier JSON."
                    exampleData={newsExampleJson}
                    fields={newsFields}
                    schema={newsImportSchema}
                    resolve={resolveNews}
                    onImport={(items) => importNews.mutate({ seasonId, rows: items })}
                    isPending={importNews.isPending}
                    trigger={
                        <Button size="md" color="secondary" iconLeading={Upload01}>
                            Importer
                        </Button>
                    }
                />
                <CreateNewsDialog
                    seasonId={seasonId}
                    universeId={season.universe_id}
                />
            </div>

            {/* Content */}
            <div>
                {total === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Plus}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Aucune news</EmptyState.Title>
                                <EmptyState.Description>
                                    Creez votre premiere actualite pour cette saison.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <CreateNewsDialog
                                    seasonId={seasonId}
                                    universeId={season.universe_id}
                                />
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {grouped.map(([round, items]) => (
                            <div key={round ?? "off"}>
                                <RoundEditionHeader round={round} gpCount={season.gp_count} />
                                <div className="mt-3 flex flex-col gap-3">
                                    {items.map((n) => (
                                        <NewsCard
                                            key={n.id}
                                            news={n}
                                            seasonId={seasonId}
                                            arcName={
                                                n.arc_id
                                                    ? arcNameMap.get(n.arc_id) ?? null
                                                    : null
                                            }
                                            mentions={mentionsPerNews.get(n.id) ?? []}
                                            onEdit={() => setEditingNews(n)}
                                            onDelete={() => setDeletingNews(n)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit dialog */}
            {editingNews && (
                <EditNewsDialog
                    seasonId={seasonId}
                    universeId={season.universe_id}
                    news={editingNews}
                    onClose={() => setEditingNews(null)}
                />
            )}

            {/* Delete dialog */}
            {deletingNews && (
                <DeleteNewsDialog
                    seasonId={seasonId}
                    news={deletingNews}
                    onClose={() => setDeletingNews(null)}
                />
            )}
        </div>
    );
}

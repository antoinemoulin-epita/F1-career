"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Edit05, Trash02, Zap } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import {
    Dialog,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { NewsForm } from "@/components/forms/news-form";
import { useNews, useDeleteNews } from "@/hooks/use-news";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useNewsMentions } from "@/hooks/use-news-mentions";
import { usePersonIdentities, useTeamIdentities } from "@/hooks/use-staff";
import { useSeason } from "@/hooks/use-seasons";
import { newsTypeLabels, newsTypeBadgeColor } from "@/lib/constants/arc-labels";
import { cx } from "@/utils/cx";

export default function NewsDetailPage() {
    const params = useParams<{ id: string; newsId: string }>();
    const router = useRouter();
    const seasonId = params.id;
    const newsId = params.newsId;

    const { data: season, isLoading: seasonLoading } = useSeason(seasonId);
    const { data: allNews, isLoading: newsLoading } = useNews(seasonId);
    const { data: arcs } = useNarrativeArcs(season?.universe_id ?? "");
    const { data: mentions } = useNewsMentions(newsId);
    const { data: personIdentities } = usePersonIdentities(season?.universe_id ?? "");
    const { data: teamIdentities } = useTeamIdentities(season?.universe_id ?? "");
    const deleteNews = useDeleteNews();

    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const news = useMemo(
        () => allNews?.find((n) => n.id === newsId) ?? null,
        [allNews, newsId],
    );

    const arcName = useMemo(() => {
        if (!news?.arc_id || !arcs) return null;
        return arcs.find((a) => a.id === news.arc_id)?.name ?? null;
    }, [news, arcs]);

    // Resolve mention entity names and links
    const mentionEntities = useMemo(() => {
        if (!mentions || mentions.length === 0) return [];

        const personMap = new Map((personIdentities ?? []).map((p) => [p.id, p]));
        const teamMap = new Map((teamIdentities ?? []).map((t) => [t.id, t]));

        return mentions.map((m) => {
            if (m.entity_type === "driver") {
                const p = personMap.get(m.entity_id);
                return {
                    id: m.id,
                    type: "Pilote",
                    name: p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "Inconnu",
                    href: p ? `/profile/driver/${p.id}` : null,
                };
            }
            if (m.entity_type === "team") {
                const t = teamMap.get(m.entity_id);
                return {
                    id: m.id,
                    type: "Ecurie",
                    name: t?.name ?? "Inconnue",
                    href: t ? `/profile/team/${t.id}` : null,
                };
            }
            // staff
            const p = personMap.get(m.entity_id);
            return {
                id: m.id,
                type: "Staff",
                name: p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "Inconnu",
                href: p ? `/profile/staff/${p.id}` : null,
            };
        });
    }, [mentions, personIdentities, teamIdentities]);

    const isLoading = seasonLoading || newsLoading;

    if (isLoading) {
        return <PageLoading label="Chargement..." />;
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

    if (!news) {
        return (
            <PageError
                title="News introuvable"
                description="Cette actualite n'existe pas ou a ete supprimee."
                backHref={`/season/${seasonId}/news`}
                backLabel="Retour aux news"
            />
        );
    }

    const typeKey = news.news_type ?? "other";
    const importance = news.importance ?? 0;
    const isFlash = importance >= 5;

    const handleDelete = () => {
        deleteNews.mutate(
            { id: news.id, seasonId },
            {
                onSuccess: () => {
                    router.push(`/season/${seasonId}/news`);
                },
            },
        );
    };

    return (
        <div>
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: "Saison", href: `/season/${seasonId}` },
                        { label: "News", href: `/season/${seasonId}/news` },
                        { label: news.headline ?? "Detail" },
                    ]}
                />
            </div>

            {/* Article */}
            <article className="mx-auto max-w-2xl">
                {/* Double red rule - top */}
                <div className="mb-6 flex flex-col gap-0.5">
                    <div className="h-1 bg-brand-600" />
                    <div className="h-px bg-brand-600" />
                </div>

                {/* Flash badge */}
                {isFlash && (
                    <div className="mb-3 flex items-center gap-1.5">
                        <Zap className="size-4 text-brand-600" />
                        <span className="font-serif text-xs font-bold uppercase tracking-wider text-brand-600">
                            Flash Info
                        </span>
                    </div>
                )}

                {/* Title */}
                <h1
                    className={cx(
                        "font-serif font-bold text-primary",
                        isFlash
                            ? "text-display-md"
                            : importance >= 3
                              ? "text-display-sm"
                              : "text-display-xs",
                    )}
                >
                    {news.headline}
                </h1>

                {/* Byline metadata */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-secondary pb-4 text-sm text-tertiary">
                    <Badge
                        size="sm"
                        color={newsTypeBadgeColor[typeKey] ?? "gray"}
                        type="pill-color"
                    >
                        {newsTypeLabels[typeKey] ?? typeKey}
                    </Badge>
                    <span className="text-quaternary">|</span>
                    <span>
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
                    {news.after_round != null && (
                        <>
                            <span className="text-quaternary">|</span>
                            <span>Round {news.after_round}</span>
                        </>
                    )}
                    {arcName && (
                        <>
                            <span className="text-quaternary">|</span>
                            <Badge size="sm" color="brand" type="pill-color">
                                {arcName}
                            </Badge>
                        </>
                    )}
                </div>

                {/* Article content */}
                {news.content && (
                    <div className="mt-6 font-serif text-md leading-relaxed text-secondary first-letter:float-left first-letter:mr-2 first-letter:text-display-lg first-letter:font-bold first-letter:leading-none first-letter:text-brand-600">
                        {news.content}
                    </div>
                )}

                {/* Mentions / Personnes citees */}
                {mentionEntities.length > 0 && (
                    <div className="mt-8">
                        <div className="mb-3 border-t border-secondary pt-4">
                            <h2 className="font-serif text-xs font-semibold uppercase tracking-widest text-tertiary">
                                Personnes citees
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {mentionEntities.map((m) => (
                                <a
                                    key={m.id}
                                    href={m.href ?? "#"}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-secondary bg-primary px-3 py-1.5 text-sm transition duration-100 ease-linear hover:border-brand hover:bg-primary_hover"
                                >
                                    <span className="text-xs text-tertiary">{m.type}</span>
                                    <span className="font-medium text-primary">{m.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-8 border-t border-secondary pt-4">
                    <div className="flex justify-end gap-2">
                        <Button
                            size="md"
                            color="secondary"
                            iconLeading={Edit05}
                            onClick={() => setIsEditing(true)}
                        >
                            Modifier
                        </Button>
                        <Button
                            size="md"
                            color="secondary-destructive"
                            iconLeading={Trash02}
                            onClick={() => setIsDeleting(true)}
                        >
                            Supprimer
                        </Button>
                    </div>
                </div>

                {/* Double red rule - bottom */}
                <div className="mt-6 flex flex-col gap-0.5">
                    <div className="h-px bg-brand-600" />
                    <div className="h-1 bg-brand-600" />
                </div>
            </article>

            {/* Edit dialog */}
            {isEditing && (
                <ModalOverlay isOpen onOpenChange={(open) => { if (!open) setIsEditing(false); }}>
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
                                    universeId={season.universe_id}
                                    news={news}
                                    onSuccess={() => setIsEditing(false)}
                                    onCancel={() => setIsEditing(false)}
                                />
                            </div>
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Delete dialog */}
            {isDeleting && (
                <ModalOverlay isOpen onOpenChange={(open) => { if (!open) setIsDeleting(false); }}>
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
                                        onClick={() => setIsDeleting(false)}
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
            )}
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Edit05,
    Plus,
    Trash02,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { NewsForm } from "@/components/forms/news-form";
import { useNews, useDeleteNews } from "@/hooks/use-news";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { useSeason } from "@/hooks/use-seasons";
import { newsTypeLabels, newsTypeBadgeColor } from "@/lib/constants/arc-labels";
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
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    universeId: string;
    news: News;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <span className="hidden" />
            <ModalOverlay>
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
                                onSuccess={() => onOpenChange(false)}
                                onCancel={() => onOpenChange(false)}
                            />
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

// ─── DeleteNewsDialog ───────────────────────────────────────────────────────

function DeleteNewsDialog({
    seasonId,
    news,
    isOpen,
    onOpenChange,
}: {
    seasonId: string;
    news: News;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const deleteNews = useDeleteNews();

    const handleDelete = () => {
        deleteNews.mutate(
            { id: news.id, seasonId },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <span className="hidden" />
            <ModalOverlay>
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
                                    onClick={() => onOpenChange(false)}
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
        </DialogTrigger>
    );
}

// ─── NewsCard ───────────────────────────────────────────────────────────────

function NewsCard({
    news,
    arcName,
    onEdit,
    onDelete,
}: {
    news: News;
    arcName: string | null;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const typeKey = news.news_type ?? "other";
    const importance = news.importance ?? 0;

    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-secondary bg-primary p-4">
            <div className="min-w-0 flex-1">
                <p className="font-medium text-primary">{news.headline}</p>
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
                </div>
                {news.content && (
                    <p className="mt-2 line-clamp-2 text-sm text-tertiary">
                        {news.content}
                    </p>
                )}
            </div>
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
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NewsPage() {
    const params = useParams<{ id: string }>();
    const seasonId = params.id;

    const { data: season, isLoading: seasonLoading } = useSeason(seasonId);
    const { data: news, isLoading: newsLoading } = useNews(seasonId);
    const { data: arcs } = useNarrativeArcs(season?.universe_id ?? "");

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
        return (
            <div className="flex min-h-80 items-center justify-center">
                <LoadingIndicator size="md" label="Chargement des news..." />
            </div>
        );
    }

    if (!season) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <EmptyState size="lg">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon
                            icon={AlertCircle}
                            color="error"
                            theme="light"
                        />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Saison introuvable</EmptyState.Title>
                    </EmptyState.Content>
                    <EmptyState.Footer>
                        <Button href="/" size="md" color="secondary" iconLeading={ArrowLeft}>
                            Retour
                        </Button>
                    </EmptyState.Footer>
                </EmptyState>
            </div>
        );
    }

    const total = news?.length ?? 0;

    return (
        <div>
            {/* Back link */}
            <div className="mb-6">
                <Button
                    color="link-gray"
                    size="sm"
                    iconLeading={ArrowLeft}
                    href={`/season/${seasonId}`}
                >
                    Retour a la saison
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">
                        News
                    </h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {total} article{total !== 1 ? "s" : ""}
                    </p>
                </div>
                <CreateNewsDialog
                    seasonId={seasonId}
                    universeId={season.universe_id}
                />
            </div>

            {/* Content */}
            <div className="mt-6">
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
                                <h2 className="mb-3 text-sm font-semibold text-secondary">
                                    {round != null
                                        ? `Round ${round}`
                                        : "Hors-course"}
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {items.map((n) => (
                                        <NewsCard
                                            key={n.id}
                                            news={n}
                                            arcName={
                                                n.arc_id
                                                    ? arcNameMap.get(n.arc_id) ?? null
                                                    : null
                                            }
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
                    isOpen={!!editingNews}
                    onOpenChange={(open) => {
                        if (!open) setEditingNews(null);
                    }}
                />
            )}

            {/* Delete dialog */}
            {deletingNews && (
                <DeleteNewsDialog
                    seasonId={seasonId}
                    news={deletingNews}
                    isOpen={!!deletingNews}
                    onOpenChange={(open) => {
                        if (!open) setDeletingNews(null);
                    }}
                />
            )}
        </div>
    );
}

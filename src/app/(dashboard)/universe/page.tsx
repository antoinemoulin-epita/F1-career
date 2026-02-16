"use client";

import Link from "next/link";
import {
    ChevronRight,
    Globe02,
    Plus,
} from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { useUniverses } from "@/hooks/use-universes";
import type { Universe } from "@/types";

// ─── UniverseCard ────────────────────────────────────────────────────────────

function UniverseCard({ universe }: { universe: Universe }) {
    return (
        <Link
            href={`/universe/${universe.id}`}
            className="group flex items-center gap-4 rounded-xl border border-secondary bg-primary p-5 transition duration-100 ease-linear hover:bg-primary_hover"
        >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-secondary">
                <Globe02 className="size-6 text-fg-brand-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-md font-semibold text-primary">{universe.name}</p>
                {universe.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-tertiary">
                        {universe.description}
                    </p>
                )}
                <div className="mt-2">
                    <Badge size="sm" color="brand" type="pill-color">
                        Annee {universe.start_year}
                    </Badge>
                </div>
            </div>
            <ChevronRight className="size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-brand-primary" />
        </Link>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UniversesPage() {
    const { data: universes, isLoading, error } = useUniverses();

    if (isLoading) {
        return <PageLoading label="Chargement des univers..." />;
    }

    if (error) {
        return (
            <PageError
                title="Erreur de chargement"
                description="Impossible de charger vos univers."
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">Univers</h1>
                    <p className="mt-0.5 text-sm text-tertiary">
                        {universes?.length ?? 0} univers
                    </p>
                </div>
                <Button size="md" iconLeading={Plus} href="/universe/new">
                    Nouvel univers
                </Button>
            </div>

            {/* Content */}
            <div className="mt-6">
                {!universes || universes.length === 0 ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <EmptyState size="md">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon
                                    icon={Globe02}
                                    color="brand"
                                    theme="light"
                                />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Aucun univers</EmptyState.Title>
                                <EmptyState.Description>
                                    Creez votre premier univers pour commencer a gerer vos saisons F1.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <Button size="md" iconLeading={Plus} href="/universe/new">
                                    Nouvel univers
                                </Button>
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {universes.map((universe) => (
                            <UniverseCard key={universe.id} universe={universe} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

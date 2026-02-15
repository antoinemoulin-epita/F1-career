"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Globe02, ChevronRight, AlertCircle, Plus } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useUniverses } from "@/hooks/use-universes";
import type { Universe } from "@/types";

function UniverseCard({ universe }: { universe: Universe }) {
    return (
        <Link href={`/universe/${universe.id}`}>
            <div className="group rounded-xl border border-secondary bg-primary p-5 transition duration-100 ease-linear hover:border-brand hover:shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary">
                            <Globe02 className="size-5 text-fg-brand-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-md font-semibold text-primary transition duration-100 ease-linear group-hover:text-brand-secondary">
                                {universe.name}
                            </h3>
                            {universe.description && (
                                <p className="mt-0.5 line-clamp-1 text-sm text-tertiary">
                                    {universe.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:text-fg-brand-primary" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <Badge size="sm" color="brand" type="pill-color">
                        Year {universe.start_year}
                    </Badge>
                    {universe.created_at && (
                        <span className="text-xs text-quaternary">
                            Created {format(new Date(universe.created_at), "MMM d, yyyy")}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function DashboardPage() {
    const { data: universes, isLoading, error } = useUniverses();

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm font-semibold text-primary">My Universes</h1>
                    <p className="mt-1 text-md text-tertiary">
                        Manage your F1 career mode universes.
                    </p>
                </div>
                <Button href="/universe/new" size="md" iconLeading={Plus}>
                    New Universe
                </Button>
            </div>

            <div className="mt-8">
                {isLoading ? (
                    <div className="flex min-h-80 items-center justify-center">
                        <LoadingIndicator size="md" label="Loading universes..." />
                    </div>
                ) : error ? (
                    <div className="flex min-h-80 items-center justify-center">
                        <EmptyState size="lg">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon icon={AlertCircle} color="error" theme="light" />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Failed to load universes</EmptyState.Title>
                                <EmptyState.Description>
                                    Something went wrong while loading your universes. Please try again.
                                </EmptyState.Description>
                            </EmptyState.Content>
                        </EmptyState>
                    </div>
                ) : universes?.length === 0 ? (
                    <div className="flex min-h-80 items-center justify-center">
                        <EmptyState size="lg">
                            <EmptyState.Header>
                                <EmptyState.FeaturedIcon icon={Globe02} color="brand" theme="light" />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>No universes yet</EmptyState.Title>
                                <EmptyState.Description>
                                    Create your first F1 universe to start tracking your career mode seasons,
                                    teams, and drivers.
                                </EmptyState.Description>
                            </EmptyState.Content>
                            <EmptyState.Footer>
                                <Button href="/universe/new" size="md" iconLeading={Plus}>
                                    New Universe
                                </Button>
                            </EmptyState.Footer>
                        </EmptyState>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {universes?.map((universe) => (
                            <UniverseCard key={universe.id} universe={universe} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

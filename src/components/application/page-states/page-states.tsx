"use client";

import type { FC, ReactNode } from "react";
import { AlertCircle, ArrowLeft } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

export const PageLoading = ({ label = "Chargement..." }: { label?: string }) => (
    <div className="flex min-h-80 items-center justify-center">
        <LoadingIndicator size="md" label={label} />
    </div>
);

interface PageErrorProps {
    title?: string;
    description?: string;
    backHref?: string;
    backLabel?: string;
}

export const PageError = ({
    title = "Erreur",
    description = "Une erreur est survenue. Veuillez reessayer.",
    backHref,
    backLabel = "Retour",
}: PageErrorProps) => (
    <div className="flex min-h-80 items-center justify-center">
        <EmptyState size="lg">
            <EmptyState.Header>
                <EmptyState.FeaturedIcon icon={AlertCircle} color="error" theme="light" />
            </EmptyState.Header>
            <EmptyState.Content>
                <EmptyState.Title>{title}</EmptyState.Title>
                <EmptyState.Description>{description}</EmptyState.Description>
            </EmptyState.Content>
            {backHref && (
                <EmptyState.Footer>
                    <Button href={backHref} size="md" color="secondary" iconLeading={ArrowLeft}>
                        {backLabel}
                    </Button>
                </EmptyState.Footer>
            )}
        </EmptyState>
    </div>
);

interface PageEmptyProps {
    icon?: FC<{ className?: string }>;
    title: string;
    description?: string;
    action?: ReactNode;
}

export const PageEmpty = ({ icon, title, description, action }: PageEmptyProps) => (
    <div className="flex min-h-60 items-center justify-center">
        <EmptyState size="md">
            {icon && (
                <EmptyState.Header>
                    <EmptyState.FeaturedIcon icon={icon} color="brand" theme="light" />
                </EmptyState.Header>
            )}
            <EmptyState.Content>
                <EmptyState.Title>{title}</EmptyState.Title>
                {description && <EmptyState.Description>{description}</EmptyState.Description>}
            </EmptyState.Content>
            {action && <EmptyState.Footer>{action}</EmptyState.Footer>}
        </EmptyState>
    </div>
);

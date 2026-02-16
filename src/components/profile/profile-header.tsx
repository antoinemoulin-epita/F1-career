"use client";

import type { FC, ReactNode } from "react";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { cx } from "@/utils/cx";

// ─── Types ──────────────────────────────────────────────────────────────────

type BreadcrumbItem = { label: string; href?: string };

interface ProfileHeaderProps {
    breadcrumbs: BreadcrumbItem[];
    title: string;
    subtitle?: string;
    badges?: ReactNode;
    /** Hex color for the accent bar */
    accentColor?: string;
    /** Right side actions */
    actions?: ReactNode;
    children?: ReactNode;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ProfileHeader({
    breadcrumbs,
    title,
    subtitle,
    badges,
    accentColor,
    actions,
    children,
}: ProfileHeaderProps) {
    return (
        <div className="mb-8">
            <div className="mb-4">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            {accentColor && (
                <div
                    className="mb-4 h-2 w-full rounded-full"
                    style={{ backgroundColor: accentColor }}
                />
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-display-sm font-semibold text-primary">
                            {title}
                        </h1>
                        {badges && (
                            <div className="flex items-center gap-2">{badges}</div>
                        )}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-sm text-tertiary">{subtitle}</p>
                    )}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
            </div>

            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}

// ─── Status badges ──────────────────────────────────────────────────────────

export function RookieBadge() {
    return (
        <Badge size="sm" color="blue" type="pill-color">
            Rookie
        </Badge>
    );
}

export function RetiringBadge() {
    return (
        <Badge size="sm" color="orange" type="pill-color">
            Retraite
        </Badge>
    );
}

export function ChampionBadge({ count }: { count: number }) {
    return (
        <Badge size="sm" color="warning" type="pill-color">
            {count}x Champion
        </Badge>
    );
}

export function FactoryBadge() {
    return (
        <Badge size="sm" color="brand" type="pill-color">
            Factory
        </Badge>
    );
}

export function FirstDriverBadge() {
    return (
        <BadgeWithDot size="sm" color="success" type="pill-color">
            Pilote #1
        </BadgeWithDot>
    );
}

export function ContractBadge({ years }: { years: number }) {
    return (
        <Badge
            size="sm"
            color={years <= 1 ? "error" : "gray"}
            type="pill-color"
        >
            {years} an{years > 1 ? "s" : ""}
        </Badge>
    );
}

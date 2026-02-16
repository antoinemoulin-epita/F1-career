"use client";

import Link from "next/link";
import { cx } from "@/utils/cx";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EntityLinkProps {
    href: string;
    children: React.ReactNode;
    color?: string | null;
    className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function EntityLink({ href, children, color, className }: EntityLinkProps) {
    return (
        <Link
            href={href}
            className={cx(
                "inline-flex items-center gap-1.5 text-sm font-medium text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover hover:underline",
                className,
            )}
        >
            {color && (
                <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                />
            )}
            {children}
        </Link>
    );
}

// ─── Specific entity links ──────────────────────────────────────────────────

export function DriverLink({ personId, children, className }: { personId: string; children: React.ReactNode; className?: string }) {
    return (
        <EntityLink href={`/profile/driver/${personId}`} className={className}>
            {children}
        </EntityLink>
    );
}

export function TeamLink({ teamIdentityId, children, color, className }: { teamIdentityId: string; children: React.ReactNode; color?: string | null; className?: string }) {
    return (
        <EntityLink href={`/profile/team/${teamIdentityId}`} color={color} className={className}>
            {children}
        </EntityLink>
    );
}

export function CircuitLink({ circuitId, children, className }: { circuitId: string; children: React.ReactNode; className?: string }) {
    return (
        <EntityLink href={`/profile/circuit/${circuitId}`} className={className}>
            {children}
        </EntityLink>
    );
}

export function StaffLink({ personId, children, className }: { personId: string; children: React.ReactNode; className?: string }) {
    return (
        <EntityLink href={`/profile/staff/${personId}`} className={className}>
            {children}
        </EntityLink>
    );
}

export function EngineSupplierLink({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
    return (
        <EntityLink href={`/profile/engine-supplier/${id}`} className={className}>
            {children}
        </EntityLink>
    );
}

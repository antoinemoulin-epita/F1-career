"use client";

import { cx } from "@/utils/cx";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

interface StatGridProps {
    title?: string;
    stats: StatCardProps[];
    columns?: 3 | 4 | 5 | 6;
}

// ─── Components ─────────────────────────────────────────────────────────────

export function StatCard({ label, value, highlight }: StatCardProps) {
    return (
        <div className={cx(
            "rounded-xl border border-secondary p-4",
            highlight ? "bg-brand-section_subtle" : "bg-primary",
        )}>
            <p className="text-xs text-tertiary">{label}</p>
            <p className={cx(
                "mt-1 text-xl font-semibold tabular-nums",
                highlight ? "text-brand-primary" : "text-primary",
            )}>
                {value}
            </p>
        </div>
    );
}

const gridCols = {
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
} as const;

export function StatGrid({ title, stats, columns = 6 }: StatGridProps) {
    return (
        <div>
            {title && (
                <h2 className="mb-3 text-sm font-semibold text-secondary">{title}</h2>
            )}
            <div className={cx("grid gap-3", gridCols[columns])}>
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>
        </div>
    );
}

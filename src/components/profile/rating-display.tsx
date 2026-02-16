"use client";

import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RatingBarProps {
    label: string;
    value: number;
    max?: number;
    color?: string;
}

interface RatingDisplayProps {
    title?: string;
    ratings: RatingBarProps[];
}

interface NoteDisplayProps {
    label: string;
    note: number;
    max?: number;
}

// ─── Components ─────────────────────────────────────────────────────────────

export function RatingBar({ label, value, max = 10, color }: RatingBarProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-secondary">{label}</span>
                <span className="text-xs font-semibold text-primary tabular-nums">
                    {value}/{max}
                </span>
            </div>
            <ProgressBar
                value={value}
                max={max}
                progressClassName={color ? undefined : "bg-fg-brand-primary"}
            />
        </div>
    );
}

export function RatingDisplay({ title, ratings }: RatingDisplayProps) {
    return (
        <div>
            {title && (
                <h2 className="mb-3 text-sm font-semibold text-secondary">{title}</h2>
            )}
            <div className="space-y-3 rounded-xl border border-secondary bg-primary p-4">
                {ratings.map((r) => (
                    <RatingBar key={r.label} {...r} />
                ))}
            </div>
        </div>
    );
}

export function NoteDisplay({ label, note, max = 10 }: NoteDisplayProps) {
    const percentage = (note / max) * 100;
    const color =
        percentage >= 80 ? "text-success-primary" :
        percentage >= 60 ? "text-brand-primary" :
        percentage >= 40 ? "text-warning-primary" :
        "text-error-primary";

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-tertiary">{label}</span>
            <span className={cx("text-lg font-bold tabular-nums", color)}>
                {note}
            </span>
            <span className="text-xs text-quaternary">/{max}</span>
        </div>
    );
}

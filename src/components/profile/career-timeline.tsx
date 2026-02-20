"use client";

import { Badge } from "@/components/base/badges/badges";
import { TeamLink } from "./entity-link";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TimelineEntry {
    year: number;
    role: string | null;
    teamName: string;
    teamColor?: string | null;
    detail?: string;
    /** Optional link to team profile */
    teamIdentityId?: string | null;
}

interface CareerTimelineProps {
    title?: string;
    entries: TimelineEntry[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CareerTimeline({ title, entries }: CareerTimelineProps) {
    if (entries.length === 0) return null;

    return (
        <div>
            {title && (
                <h2 className="mb-3 text-sm font-semibold text-secondary">{title}</h2>
            )}
            <div className="relative space-y-0">
                {entries.map((entry, i) => (
                    <div key={`${entry.year}-${entry.role}`} className="flex gap-4">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                            <div
                                className="size-3 shrink-0 rounded-full border-2 border-primary"
                                style={{
                                    backgroundColor: entry.teamColor ?? "var(--color-bg-quaternary)",
                                }}
                            />
                            {i < entries.length - 1 && (
                                <div className="w-px flex-1 bg-tertiary" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="pb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-primary">
                                    {entry.year}
                                </span>
                                {entry.role && (
                                    <Badge size="sm" color="gray" type="pill-color">
                                        {entry.role}
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-0.5 text-sm text-secondary">
                                {entry.teamIdentityId ? (
                                    <TeamLink teamIdentityId={entry.teamIdentityId} color={entry.teamColor}>
                                        {entry.teamName}
                                    </TeamLink>
                                ) : (
                                    entry.teamName
                                )}
                            </p>
                            {entry.detail && (
                                <p className="mt-0.5 text-xs text-tertiary">
                                    {entry.detail}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

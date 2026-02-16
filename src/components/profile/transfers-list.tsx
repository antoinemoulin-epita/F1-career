"use client";

import { Badge } from "@/components/base/badges/badges";
import { DriverLink, TeamLink } from "./entity-link";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TransferItem {
    id: string;
    effective_year: number;
    transfer_type?: string | null;
    contract_years?: number | null;
    is_first_driver?: boolean | null;
    driver?: { first_name: string | null; last_name: string | null; person_id: string | null } | null;
    from_team?: { name: string | null; color_primary?: string | null } | null;
    to_team?: { name: string | null; color_primary?: string | null } | null;
    season?: { year: number } | null;
}

interface TransfersListProps {
    title?: string;
    transfers: TransferItem[];
    /** Hide driver name (when shown on a driver profile) */
    hideDriver?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TransfersList({ title, transfers, hideDriver }: TransfersListProps) {
    if (transfers.length === 0) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-tertiary">Aucun transfert.</p>
            </div>
        );
    }

    return (
        <div>
            {title && (
                <h2 className="mb-3 text-sm font-semibold text-secondary">{title}</h2>
            )}
            <div className="space-y-3">
                {transfers.map((t) => {
                    const driverName = t.driver
                        ? `${t.driver.first_name ?? ""} ${t.driver.last_name ?? ""}`.trim()
                        : null;

                    return (
                        <div
                            key={t.id}
                            className="flex items-center gap-4 rounded-xl border border-secondary bg-primary p-4"
                        >
                            {/* Year */}
                            <span className="text-sm font-semibold text-primary tabular-nums">
                                {t.effective_year}
                            </span>

                            {/* Type badge */}
                            <Badge
                                size="sm"
                                color={t.transfer_type === "confirmed" ? "success" : "warning"}
                                type="pill-color"
                            >
                                {t.transfer_type === "confirmed" ? "Confirme" : "Rumeur"}
                            </Badge>

                            {/* Driver */}
                            {!hideDriver && driverName && (
                                <span className="text-sm text-primary">
                                    {t.driver?.person_id ? (
                                        <DriverLink personId={t.driver.person_id}>
                                            {driverName}
                                        </DriverLink>
                                    ) : (
                                        driverName
                                    )}
                                </span>
                            )}

                            {/* From -> To */}
                            <div className="flex items-center gap-2 text-sm text-tertiary">
                                {t.from_team?.name ? (
                                    <span className="flex items-center gap-1.5">
                                        {t.from_team.color_primary && (
                                            <span
                                                className="size-2.5 rounded-full"
                                                style={{ backgroundColor: t.from_team.color_primary }}
                                            />
                                        )}
                                        {t.from_team.name}
                                    </span>
                                ) : (
                                    <span>—</span>
                                )}
                                <span className="text-quaternary">→</span>
                                {t.to_team?.name ? (
                                    <span className="flex items-center gap-1.5">
                                        {t.to_team.color_primary && (
                                            <span
                                                className="size-2.5 rounded-full"
                                                style={{ backgroundColor: t.to_team.color_primary }}
                                            />
                                        )}
                                        {t.to_team.name}
                                    </span>
                                ) : (
                                    <span>—</span>
                                )}
                            </div>

                            {/* Contract */}
                            {t.contract_years && (
                                <span className="text-xs text-tertiary">
                                    {t.contract_years} an{t.contract_years > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RelatedDriver {
    driverId: string;
    personId: string;
    firstName: string | null;
    lastName: string | null;
}

export interface RelatedTeam {
    teamId: string;
    teamIdentityId: string;
    name: string;
    colorPrimary: string | null;
}

export interface ArcRelatedEntities {
    drivers: Map<string, RelatedDriver>;
    teams: Map<string, RelatedTeam>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Resolves related_driver_ids and related_team_ids from narrative arcs
 * into displayable names and linkable identity IDs.
 *
 * Pass all unique driver/team IDs from all arcs being displayed.
 */
export function useArcRelatedEntities(
    driverIds: string[],
    teamIds: string[],
) {
    return useQuery({
        queryKey: ["arc-related-entities", driverIds, teamIds],
        queryFn: async () => {
            const result: ArcRelatedEntities = {
                drivers: new Map(),
                teams: new Map(),
            };

            // Fetch drivers with person_id
            if (driverIds.length > 0) {
                const { data: drivers } = await supabase
                    .from("drivers")
                    .select("id, person_id, first_name, last_name")
                    .in("id", driverIds);
                if (drivers) {
                    for (const d of drivers) {
                        if (d.person_id) {
                            result.drivers.set(d.id, {
                                driverId: d.id,
                                personId: d.person_id,
                                firstName: d.first_name,
                                lastName: d.last_name,
                            });
                        }
                    }
                }
            }

            // Fetch teams with team_identity_id
            if (teamIds.length > 0) {
                const { data: teams } = await supabase
                    .from("teams")
                    .select("id, team_identity_id, name, color_primary")
                    .in("id", teamIds);
                if (teams) {
                    for (const t of teams) {
                        if (t.team_identity_id) {
                            result.teams.set(t.id, {
                                teamId: t.id,
                                teamIdentityId: t.team_identity_id,
                                name: t.name,
                                colorPrimary: t.color_primary,
                            });
                        }
                    }
                }
            }

            return result;
        },
        enabled: driverIds.length > 0 || teamIds.length > 0,
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const teamProfileKeys = {
    full: (teamIdentityId: string) => ["team-identity-full", teamIdentityId] as const,
    history: (teamIdentityId: string) => ["team-identity-history", teamIdentityId] as const,
    drivers: (teamIdentityId: string) => ["team-identity-drivers", teamIdentityId] as const,
    transfers: (teamIdentityId: string) => ["team-identity-transfers", teamIdentityId] as const,
    arcs: (teamIdentityId: string) => ["team-identity-arcs", teamIdentityId] as const,
};

export function useTeamProfile(teamIdentityId: string) {
    return useQuery({
        queryKey: teamProfileKeys.full(teamIdentityId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_team_identity_full")
                .select("*")
                .eq("team_identity_id", teamIdentityId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!teamIdentityId,
    });
}

export function useTeamHistory(teamIdentityId: string) {
    return useQuery({
        queryKey: teamProfileKeys.history(teamIdentityId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_team_identity_history")
                .select("*")
                .eq("team_identity_id", teamIdentityId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!teamIdentityId,
    });
}

export function useTeamDrivers(teamIdentityId: string) {
    return useQuery({
        queryKey: teamProfileKeys.drivers(teamIdentityId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_person_seasons")
                .select("*")
                .eq("team_identity_id", teamIdentityId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!teamIdentityId,
    });
}

export function useTeamTransfers(teamIdentityId: string) {
    return useQuery({
        queryKey: teamProfileKeys.transfers(teamIdentityId),
        queryFn: async () => {
            // Get all seasonal team IDs for this identity
            const { data: teams } = await supabase
                .from("teams")
                .select("id")
                .eq("team_identity_id", teamIdentityId);
            if (!teams || teams.length === 0) return [];
            const teamIds = teams.map((t) => t.id);
            const { data, error } = await supabase
                .from("transfers")
                .select("*, season:seasons(year), driver:drivers(first_name, last_name, person_id), from_team:teams!transfers_from_team_id_fkey(name, color_primary), to_team:teams!transfers_to_team_id_fkey(name, color_primary)")
                .or(`from_team_id.in.(${teamIds.join(",")}),to_team_id.in.(${teamIds.join(",")})`)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!teamIdentityId,
    });
}

export function useTeamArcs(teamIdentityId: string) {
    return useQuery({
        queryKey: teamProfileKeys.arcs(teamIdentityId),
        queryFn: async () => {
            // Get all seasonal team IDs for this identity
            const { data: teams } = await supabase
                .from("teams")
                .select("id")
                .eq("team_identity_id", teamIdentityId);
            if (!teams || teams.length === 0) return [];
            const teamIds = teams.map((t) => t.id);
            const { data, error } = await supabase
                .from("narrative_arcs")
                .select("*, started_season:seasons!narrative_arcs_started_season_id_fkey(year)")
                .contains("related_team_ids", teamIds.slice(0, 1))
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!teamIdentityId,
    });
}

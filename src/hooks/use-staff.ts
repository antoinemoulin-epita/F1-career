"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { StaffFormValues } from "@/lib/validators/staff";

const supabase = createClient();

export const staffKeys = {
    all: ["staff"] as const,
    bySeason: (seasonId: string) => ["staff", { seasonId }] as const,
};

export const personIdentityKeys = {
    all: ["person-identities"] as const,
    byUniverse: (universeId: string) => ["person-identities", { universeId }] as const,
};

export function useStaff(seasonId: string) {
    return useQuery({
        queryKey: staffKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("staff_members")
                .select("*, person:person_identities(id, first_name, last_name, nationality)")
                .eq("season_id", seasonId)
                .order("team_id")
                .order("role");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function usePersonIdentities(universeId: string) {
    return useQuery({
        queryKey: personIdentityKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("person_identities")
                .select("*")
                .eq("universe_id", universeId)
                .order("last_name")
                .order("first_name");
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

export const teamIdentityKeys = {
    all: ["team-identities"] as const,
    byUniverse: (universeId: string) => ["team-identities", { universeId }] as const,
};

export function useTeamIdentities(universeId: string) {
    return useQuery({
        queryKey: teamIdentityKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("team_identities")
                .select("*")
                .eq("universe_id", universeId)
                .order("name");
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

export function useCreateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            form,
        }: {
            seasonId: string;
            form: StaffFormValues;
        }) => {
            const { data, error } = await supabase
                .from("staff_members")
                .insert({
                    season_id: seasonId,
                    person_id: form.person_id,
                    role: form.role,
                    team_id: form.team_id,
                    note: form.note,
                    potential_min: form.potential_min ?? null,
                    potential_max: form.potential_max ?? null,
                    potential_final: form.potential_final ?? null,
                    potential_revealed: form.potential_revealed ?? false,
                    birth_year: form.birth_year ?? null,
                    contract_years_remaining: form.contract_years_remaining ?? 1,
                    years_in_team: form.years_in_team ?? 1,
                    is_retiring: form.is_retiring ?? false,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: staffKeys.bySeason(variables.seasonId),
            });
        },
    });
}

export function useUpdateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            form,
        }: {
            id: string;
            seasonId: string;
            form: Partial<StaffFormValues>;
        }) => {
            const { data, error } = await supabase
                .from("staff_members")
                .update({
                    person_id: form.person_id,
                    role: form.role,
                    team_id: form.team_id,
                    note: form.note,
                    potential_min: form.potential_min ?? null,
                    potential_max: form.potential_max ?? null,
                    potential_final: form.potential_final ?? null,
                    potential_revealed: form.potential_revealed ?? false,
                    birth_year: form.birth_year ?? null,
                    contract_years_remaining: form.contract_years_remaining ?? undefined,
                    years_in_team: form.years_in_team ?? undefined,
                    is_retiring: form.is_retiring ?? false,
                })
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: staffKeys.bySeason(variables.seasonId),
            });
        },
    });
}

export function useDeleteStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; seasonId: string }) => {
            const { error } = await supabase
                .from("staff_members")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: staffKeys.bySeason(variables.seasonId),
            });
        },
    });
}

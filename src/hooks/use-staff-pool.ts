"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { staffKeys, personIdentityKeys } from "./use-staff";
import type { StaffPoolFormValues } from "@/lib/validators";
import type { StaffPool } from "@/types";

const supabase = createClient();

export const staffPoolKeys = {
    all: ["staff-pool"] as const,
    byUniverse: (universeId: string) => ["staff-pool", { universeId }] as const,
};

export function useStaffPool(universeId: string) {
    return useQuery({
        queryKey: staffPoolKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("staff_pool")
                .select("*")
                .eq("universe_id", universeId)
                .order("last_name");
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

function normalizeForm(form: StaffPoolFormValues) {
    return {
        first_name: form.first_name?.trim() || null,
        last_name: form.last_name.trim(),
        nationality: form.nationality?.trim() || null,
        birth_year: form.birth_year ?? null,
        role: form.role,
        note: form.note ?? null,
        potential_min: form.potential_min,
        potential_max: form.potential_max,
        available_from_year: form.available_from_year ?? null,
    };
}

export function useCreateStaffPoolEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ universeId, form }: { universeId: string; form: StaffPoolFormValues }) => {
            const { data, error } = await supabase
                .from("staff_pool")
                .insert({ universe_id: universeId, ...normalizeForm(form) })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: staffPoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useUpdateStaffPoolEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, universeId, form }: { id: string; universeId: string; form: StaffPoolFormValues }) => {
            const { data, error } = await supabase
                .from("staff_pool")
                .update(normalizeForm(form))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: staffPoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useDeleteStaffPoolEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; universeId: string }) => {
            const { error } = await supabase
                .from("staff_pool")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: staffPoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useDeleteStaffPoolEntries() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids }: { ids: string[]; universeId: string }) => {
            const { error } = await supabase
                .from("staff_pool")
                .delete()
                .in("id", ids);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: staffPoolKeys.byUniverse(variables.universeId) });
        },
    });
}

export function useDraftStaffPoolEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            entryId,
            seasonId,
            teamId,
            teamName,
            universeId,
            entry,
        }: {
            entryId: string;
            seasonId: string;
            teamId: string;
            teamName: string;
            universeId: string;
            entry: StaffPool;
        }) => {
            // 1. Create person_identity
            const { data: person, error: personError } = await supabase
                .from("person_identities")
                .insert({
                    universe_id: universeId,
                    first_name: entry.first_name,
                    last_name: entry.last_name,
                    nationality: entry.nationality,
                    birth_year: entry.birth_year,
                    role: entry.role,
                })
                .select()
                .single();
            if (personError) throw personError;

            // 2. Create staff_member in the target season
            const { error: staffError } = await supabase
                .from("staff_members")
                .insert({
                    person_id: person.id,
                    season_id: seasonId,
                    team_id: teamId,
                    role: entry.role,
                    note: entry.note ?? 3,
                    potential_min: entry.potential_min,
                    potential_max: entry.potential_max,
                    years_in_team: 1,
                    contract_years_remaining: 3,
                })
                .select()
                .single();
            if (staffError) throw staffError;

            // 3. Mark staff pool entry as drafted
            const { data, error: poolError } = await supabase
                .from("staff_pool")
                .update({
                    drafted: true,
                    drafted_season_id: seasonId,
                    drafted_team_name: teamName,
                })
                .eq("id", entryId)
                .select()
                .single();
            if (poolError) throw poolError;

            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: staffPoolKeys.byUniverse(variables.universeId) });
            queryClient.invalidateQueries({ queryKey: staffKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: personIdentityKeys.byUniverse(variables.universeId) });
        },
    });
}

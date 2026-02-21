"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { DriverFormValues } from "@/lib/validators";

const supabase = createClient();

export const driverKeys = {
    all: ["drivers"] as const,
    bySeason: (seasonId: string) => ["drivers", { seasonId }] as const,
    detail: (id: string) => ["drivers", id] as const,
};

export function useDrivers(seasonId: string) {
    return useQuery({
        queryKey: driverKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_drivers_with_effective")
                .select("*")
                .eq("season_id", seasonId)
                .order("team_id")
                .order("last_name");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useDriver(id: string) {
    return useQuery({
        queryKey: driverKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("drivers")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

function normalizeForm(form: DriverFormValues) {
    return {
        first_name: form.first_name?.trim() || null,
        last_name: form.last_name.trim(),
        nationality: form.nationality?.trim() || null,
        birth_year: form.birth_year ?? null,
        note: form.note,
        potential_min: form.potential_min ?? null,
        potential_max: form.potential_max ?? null,
        potential_revealed: form.potential_revealed ?? false,
        potential_final: form.potential_final ?? null,
        team_id: form.team_id ?? null,
        years_in_team: form.years_in_team ?? null,
        is_first_driver: form.is_first_driver ?? false,
        contract_years_remaining: form.contract_years_remaining ?? null,
        is_rookie: form.is_rookie ?? false,
        is_retiring: form.is_retiring ?? false,
        world_titles: form.world_titles ?? null,
        career_races: form.career_races ?? null,
        career_wins: form.career_wins ?? null,
        career_poles: form.career_poles ?? null,
        career_podiums: form.career_podiums ?? null,
        career_points: form.career_points ?? null,
        person_id: form.person_id ?? null,
    };
}

export function useCreateDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ seasonId, form }: { seasonId: string; form: DriverFormValues }) => {
            const { data, error } = await supabase
                .from("drivers")
                .insert({ season_id: seasonId, ...normalizeForm(form) })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: driverKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useUpdateDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, seasonId, form }: { id: string; seasonId: string; form: DriverFormValues }) => {
            const { data, error } = await supabase
                .from("drivers")
                .update(normalizeForm(form))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return { ...data, seasonId };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: driverKeys.bySeason(variables.seasonId) });
            queryClient.invalidateQueries({ queryKey: driverKeys.detail(variables.id) });
        },
    });
}

export function useDeleteDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; seasonId: string }) => {
            const { error } = await supabase
                .from("drivers")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: driverKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useDeleteDrivers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids }: { ids: string[]; seasonId: string }) => {
            const { error } = await supabase
                .from("drivers")
                .delete()
                .in("id", ids);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: driverKeys.bySeason(variables.seasonId) });
        },
    });
}

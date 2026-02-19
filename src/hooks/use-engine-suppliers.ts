"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { EngineSupplierFormValues } from "@/lib/validators";

const supabase = createClient();

export const engineSupplierKeys = {
    all: ["engine-suppliers"] as const,
    bySeason: (seasonId: string) => ["engine-suppliers", { seasonId }] as const,
};

export function useEngineSuppliers(seasonId: string) {
    return useQuery({
        queryKey: engineSupplierKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("engine_suppliers")
                .select("*")
                .eq("season_id", seasonId)
                .order("name");
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

function normalizeForm(form: EngineSupplierFormValues) {
    return {
        name: form.name.trim(),
        nationality: form.nationality?.trim() || null,
        note: form.note,
        investment_level: form.investment_level,
    };
}

export function useCreateEngineSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ seasonId, form }: { seasonId: string; form: EngineSupplierFormValues }) => {
            const { data, error } = await supabase
                .from("engine_suppliers")
                .insert({ season_id: seasonId, ...normalizeForm(form) })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: engineSupplierKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useUpdateEngineSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, seasonId, form }: { id: string; seasonId: string; form: EngineSupplierFormValues }) => {
            const { data, error } = await supabase
                .from("engine_suppliers")
                .update(normalizeForm(form))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return { ...data, seasonId };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: engineSupplierKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useDeleteEngineSupplier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; seasonId: string }) => {
            const { error } = await supabase
                .from("engine_suppliers")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: engineSupplierKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useDeleteEngineSuppliers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids }: { ids: string[]; seasonId: string }) => {
            const { error } = await supabase
                .from("engine_suppliers")
                .delete()
                .in("id", ids);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: engineSupplierKeys.bySeason(variables.seasonId) });
        },
    });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RegulationFormValues } from "@/lib/validators/regulation";

const supabase = createClient();

export const regulationKeys = {
    all: ["regulations"] as const,
    byUniverse: (universeId: string) => ["regulations", { universeId }] as const,
};

export function useRegulations(universeId: string) {
    return useQuery({
        queryKey: regulationKeys.byUniverse(universeId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("regulations")
                .select("*")
                .eq("universe_id", universeId)
                .order("effective_year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!universeId,
    });
}

export function useCreateRegulation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            universeId,
            form,
        }: {
            universeId: string;
            form: RegulationFormValues;
        }) => {
            const { data, error } = await supabase
                .from("regulations")
                .insert({
                    universe_id: universeId,
                    name: form.name.trim(),
                    description: form.description?.trim() || null,
                    effective_year: form.effective_year,
                    reset_type: form.reset_type,
                    affects_aero: form.affects_aero ?? false,
                    affects_chassis: form.affects_chassis ?? false,
                    affects_motor: form.affects_motor ?? false,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: regulationKeys.byUniverse(variables.universeId),
            });
        },
    });
}

export function useUpdateRegulation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            universeId,
            form,
        }: {
            id: string;
            universeId: string;
            form: Partial<RegulationFormValues>;
        }) => {
            const payload: Record<string, unknown> = {};
            if (form.name !== undefined) payload.name = form.name.trim();
            if (form.description !== undefined)
                payload.description = form.description?.trim() || null;
            if (form.effective_year !== undefined) payload.effective_year = form.effective_year;
            if (form.reset_type !== undefined) payload.reset_type = form.reset_type;
            if (form.affects_aero !== undefined) payload.affects_aero = form.affects_aero;
            if (form.affects_chassis !== undefined) payload.affects_chassis = form.affects_chassis;
            if (form.affects_motor !== undefined) payload.affects_motor = form.affects_motor;

            const { data, error } = await supabase
                .from("regulations")
                .update(payload)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: regulationKeys.byUniverse(variables.universeId),
            });
        },
    });
}

export function useDeleteRegulation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; universeId: string }) => {
            const { error } = await supabase
                .from("regulations")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: regulationKeys.byUniverse(variables.universeId),
            });
        },
    });
}

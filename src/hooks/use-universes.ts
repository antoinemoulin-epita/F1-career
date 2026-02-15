"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CreateUniverseInput } from "@/lib/validators";
import type { UniverseUpdate } from "@/types";

const supabase = createClient();

export const universeKeys = {
    all: ["universes"] as const,
    detail: (id: string) => ["universes", id] as const,
};

export function useUniverses() {
    return useQuery({
        queryKey: universeKeys.all,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("universes")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });
}

export function useUniverse(id: string) {
    return useQuery({
        queryKey: universeKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("universes")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateUniverse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (form: CreateUniverseInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("universes")
                .insert({
                    name: form.name,
                    description: form.description ?? null,
                    start_year: form.start_year,
                    user_id: user.id,
                })
                .select()
                .single();
            if (error) throw error;

            await supabase.rpc("fn_seed_default_points", { p_universe_id: data.id });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: universeKeys.all });
        },
    });
}

export function useUpdateUniverse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: UniverseUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from("universes")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: universeKeys.all });
            queryClient.invalidateQueries({ queryKey: universeKeys.detail(data.id) });
        },
    });
}

export function useDeleteUniverse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("universes")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: universeKeys.all });
        },
    });
}

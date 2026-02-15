"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { NewsFormValues } from "@/lib/validators";

const supabase = createClient();

export const newsKeys = {
    all: ["news"] as const,
    bySeason: (seasonId: string) => ["news", { seasonId }] as const,
};

export function useNews(seasonId: string) {
    return useQuery({
        queryKey: newsKeys.bySeason(seasonId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("news")
                .select("*")
                .eq("season_id", seasonId)
                .order("after_round", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useCreateNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            form,
        }: {
            seasonId: string;
            form: NewsFormValues;
        }) => {
            const { data, error } = await supabase
                .from("news")
                .insert({
                    season_id: seasonId,
                    headline: form.headline.trim(),
                    content: form.content?.trim() || null,
                    news_type: form.news_type,
                    importance: form.importance,
                    after_round: form.after_round ?? null,
                    arc_id: form.arc_id ?? null,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: newsKeys.bySeason(variables.seasonId),
            });
        },
    });
}

export function useUpdateNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            seasonId,
            form,
        }: {
            id: string;
            seasonId: string;
            form: NewsFormValues;
        }) => {
            const { data, error } = await supabase
                .from("news")
                .update({
                    headline: form.headline.trim(),
                    content: form.content?.trim() || null,
                    news_type: form.news_type,
                    importance: form.importance,
                    after_round: form.after_round ?? null,
                    arc_id: form.arc_id ?? null,
                })
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: newsKeys.bySeason(variables.seasonId),
            });
        },
    });
}

export function useDeleteNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }: { id: string; seasonId: string }) => {
            const { error } = await supabase
                .from("news")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: newsKeys.bySeason(variables.seasonId),
            });
        },
    });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { newsMentionKeys } from "./use-news-mentions";
import type { NewsFormValues } from "@/lib/validators";

const supabase = createClient();

export const newsKeys = {
    all: ["news"] as const,
    bySeason: (seasonId: string) => ["news", { seasonId }] as const,
    byArc: (arcId: string) => ["news", "by-arc", { arcId }] as const,
};

/** All news linked to a given narrative arc, with season info. */
export function useNewsByArc(arcId: string) {
    return useQuery({
        queryKey: newsKeys.byArc(arcId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("news")
                .select("*, season:seasons(id, year)")
                .eq("arc_id", arcId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!arcId,
    });
}

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

type MentionInput = { entity_type: string; entity_id: string };

async function upsertMentions(newsId: string, mentions: MentionInput[]) {
    if (mentions.length === 0) return;
    const payload = mentions.map((m) => ({
        news_id: newsId,
        entity_type: m.entity_type,
        entity_id: m.entity_id,
    }));
    const { error } = await supabase.from("news_mentions").insert(payload);
    if (error) throw error;
}

function buildMentions(form: NewsFormValues): MentionInput[] {
    const mentions: MentionInput[] = [];
    form.mentioned_drivers?.forEach((id) => mentions.push({ entity_type: "driver", entity_id: id }));
    form.mentioned_teams?.forEach((id) => mentions.push({ entity_type: "team", entity_id: id }));
    form.mentioned_staff?.forEach((id) => mentions.push({ entity_type: "staff", entity_id: id }));
    return mentions;
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

            // Insert mentions
            const mentions = buildMentions(form);
            await upsertMentions(data.id, mentions);

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

            // Replace mentions: delete old, insert new
            const { error: delError } = await supabase
                .from("news_mentions")
                .delete()
                .eq("news_id", id);
            if (delError) throw delError;

            const mentions = buildMentions(form);
            await upsertMentions(id, mentions);

            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: newsKeys.bySeason(variables.seasonId),
            });
            queryClient.invalidateQueries({
                queryKey: newsMentionKeys.byNews(variables.id),
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

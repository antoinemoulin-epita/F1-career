"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const newsMentionKeys = {
    byNews: (newsId: string) => ["news-mentions", { newsId }] as const,
    byEntity: (entityType: string, entityId: string) =>
        ["news-mentions", { entityType, entityId }] as const,
};

export function useNewsMentions(newsId: string) {
    return useQuery({
        queryKey: newsMentionKeys.byNews(newsId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("news_mentions")
                .select("*")
                .eq("news_id", newsId);
            if (error) throw error;
            return data;
        },
        enabled: !!newsId,
    });
}

export function useNewsMentionsByNewsIds(newsIds: string[]) {
    return useQuery({
        queryKey: ["news-mentions", "bulk", newsIds],
        queryFn: async () => {
            if (newsIds.length === 0) return [];
            const { data, error } = await supabase
                .from("news_mentions")
                .select("*")
                .in("news_id", newsIds);
            if (error) throw error;
            return data;
        },
        enabled: newsIds.length > 0,
    });
}

export function useNewsByEntity(entityType: string, entityId: string) {
    return useQuery({
        queryKey: newsMentionKeys.byEntity(entityType, entityId),
        queryFn: async () => {
            // First get matching news_ids
            const { data: mentions, error: mentionsError } = await supabase
                .from("news_mentions")
                .select("news_id")
                .eq("entity_type", entityType)
                .eq("entity_id", entityId);
            if (mentionsError) throw mentionsError;
            if (!mentions || mentions.length === 0) return [];

            const newsIds = mentions.map((m) => m.news_id);
            const { data: news, error: newsError } = await supabase
                .from("news")
                .select("*")
                .in("id", newsIds)
                .order("created_at", { ascending: false });
            if (newsError) throw newsError;
            return news;
        },
        enabled: !!entityType && !!entityId,
    });
}

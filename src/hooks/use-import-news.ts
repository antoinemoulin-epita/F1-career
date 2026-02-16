"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { newsKeys } from "./use-news";
import type { NewsFormValues } from "@/lib/validators";

const supabase = createClient();

export function useImportNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            rows,
        }: {
            seasonId: string;
            rows: NewsFormValues[];
        }) => {
            const payload = rows.map((form) => ({
                season_id: seasonId,
                headline: form.headline.trim(),
                content: form.content?.trim() || null,
                news_type: form.news_type,
                importance: form.importance,
                after_round: form.after_round ?? null,
                arc_id: form.arc_id ?? null,
            }));

            const { data, error } = await supabase
                .from("news")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: newsKeys.bySeason(variables.seasonId),
            });
            toast.success(`${data.length} news importee${data.length > 1 ? "s" : ""}`);
        },
    });
}

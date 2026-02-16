"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { rookiePoolKeys } from "./use-rookie-pool";
import type { RookiePoolFormValues } from "@/lib/validators";

const supabase = createClient();

export function useImportRookies() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            universeId,
            rows,
        }: {
            universeId: string;
            rows: RookiePoolFormValues[];
        }) => {
            const payload = rows.map((form) => ({
                universe_id: universeId,
                first_name: form.first_name?.trim() || null,
                last_name: form.last_name.trim(),
                nationality: form.nationality?.trim() || null,
                birth_year: form.birth_year ?? null,
                potential_min: form.potential_min,
                potential_max: form.potential_max,
                available_from_year: form.available_from_year ?? null,
            }));

            const { data, error } = await supabase
                .from("rookie_pool")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: rookiePoolKeys.byUniverse(variables.universeId),
            });
            toast.success(`${data.length} rookie${data.length > 1 ? "s" : ""} importe${data.length > 1 ? "s" : ""}`);
        },
    });
}

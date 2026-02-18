"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { regulationKeys } from "./use-regulations";
import type { RegulationFormValues } from "@/lib/validators/regulation";

const supabase = createClient();

export function useImportRegulations() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            universeId,
            rows,
        }: {
            universeId: string;
            rows: RegulationFormValues[];
        }) => {
            const payload = rows.map((form) => ({
                universe_id: universeId,
                name: form.name.trim(),
                description: form.description?.trim() || null,
                effective_year: form.effective_year,
                reset_type: form.reset_type,
                affects_aero: form.affects_aero ?? false,
                affects_chassis: form.affects_chassis ?? false,
                affects_motor: form.affects_motor ?? false,
            }));

            const { data, error } = await supabase
                .from("regulations")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: regulationKeys.byUniverse(variables.universeId),
            });
            toast.success(`${data.length} reglementation${data.length > 1 ? "s" : ""} importee${data.length > 1 ? "s" : ""}`);
        },
    });
}

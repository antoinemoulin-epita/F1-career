"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { engineSupplierKeys } from "./use-engine-suppliers";
import type { EngineSupplierFormValues } from "@/lib/validators";

const supabase = createClient();

export function useImportEngineSuppliers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            rows,
        }: {
            seasonId: string;
            rows: EngineSupplierFormValues[];
        }) => {
            const payload = rows.map((form) => ({
                season_id: seasonId,
                name: form.name.trim(),
                nationality: form.nationality?.trim() || null,
                note: form.note,
                investment_level: form.investment_level,
            }));

            const { data, error } = await supabase
                .from("engine_suppliers")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: engineSupplierKeys.bySeason(variables.seasonId),
            });
            toast.success(`${data.length} motoriste${data.length > 1 ? "s" : ""} importe${data.length > 1 ? "s" : ""}`);
        },
    });
}

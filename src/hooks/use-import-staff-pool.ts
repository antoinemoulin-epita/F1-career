"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staffPoolKeys } from "./use-staff-pool";
import type { StaffPoolFormValues } from "@/lib/validators";

const supabase = createClient();

export function useImportStaffPool() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            universeId,
            rows,
        }: {
            universeId: string;
            rows: StaffPoolFormValues[];
        }) => {
            const payload = rows.map((form) => ({
                universe_id: universeId,
                first_name: form.first_name?.trim() || null,
                last_name: form.last_name.trim(),
                nationality: form.nationality?.trim() || null,
                birth_year: form.birth_year ?? null,
                role: form.role,
                note: form.note ?? null,
                potential_min: form.potential_min,
                potential_max: form.potential_max,
                available_from_year: form.available_from_year ?? null,
            }));

            const { data, error } = await supabase
                .from("staff_pool")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: staffPoolKeys.byUniverse(variables.universeId),
            });
            toast.success(`${data.length} staff importe${data.length > 1 ? "s" : ""}`);
        },
    });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { carKeys } from "./use-cars";
import type { CarFormValues } from "@/lib/validators";

const supabase = createClient();

export function useImportCars() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            rows,
        }: {
            seasonId: string;
            rows: (CarFormValues & { team_id: string })[];
        }) => {
            const payload = rows.map((form) => ({
                team_id: form.team_id,
                motor: form.motor,
                aero: form.aero,
                chassis: form.chassis,
                engine_change_penalty: form.engine_change_penalty ?? false,
            }));

            const { data, error } = await supabase
                .from("cars")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: carKeys.bySeason(variables.seasonId),
            });
            toast.success(`${data.length} voiture${data.length > 1 ? "s" : ""} importee${data.length > 1 ? "s" : ""}`);
        },
    });
}

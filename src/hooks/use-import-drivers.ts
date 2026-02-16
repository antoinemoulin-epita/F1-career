"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { driverKeys } from "./use-drivers";
import type { DriverFormValues } from "@/lib/validators";

const supabase = createClient();

export function useImportDrivers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            rows,
        }: {
            seasonId: string;
            rows: DriverFormValues[];
        }) => {
            const payload = rows.map((form) => ({
                season_id: seasonId,
                first_name: form.first_name?.trim() || null,
                last_name: form.last_name.trim(),
                nationality: form.nationality?.trim() || null,
                birth_year: form.birth_year ?? null,
                note: form.note,
                potential_min: form.potential_min ?? null,
                potential_max: form.potential_max ?? null,
                potential_revealed: form.potential_revealed ?? false,
                potential_final: form.potential_final ?? null,
                team_id: form.team_id ?? null,
                years_in_team: form.years_in_team ?? null,
                is_first_driver: form.is_first_driver ?? false,
                contract_years_remaining: form.contract_years_remaining ?? null,
                is_rookie: form.is_rookie ?? false,
                is_retiring: form.is_retiring ?? false,
                world_titles: form.world_titles ?? null,
                career_races: form.career_races ?? null,
                career_wins: form.career_wins ?? null,
                career_poles: form.career_poles ?? null,
                career_podiums: form.career_podiums ?? null,
                career_points: form.career_points ?? null,
            }));

            const { data, error } = await supabase
                .from("drivers")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: driverKeys.bySeason(variables.seasonId),
            });
            toast.success(`${data.length} pilote${data.length > 1 ? "s" : ""} importe${data.length > 1 ? "s" : ""}`);
        },
    });
}

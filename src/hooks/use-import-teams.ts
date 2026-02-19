"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { teamKeys } from "./use-teams";
import type { TeamImportResolved } from "@/lib/validators/team-import";

const supabase = createClient();

export function useImportTeams() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            rows,
        }: {
            seasonId: string;
            rows: TeamImportResolved[];
        }) => {
            const payload = rows.map((form) => ({
                season_id: seasonId,
                name: form.name.trim(),
                short_name: form.short_name?.trim() || null,
                nationality: form.nationality?.trim() || null,
                color_primary: form.color_primary?.trim() || null,
                color_secondary: form.color_secondary?.trim() || null,
                team_principal: form.team_principal?.trim() || null,
                technical_director: form.technical_director?.trim() || null,
                engineer_level: form.engineer_level ?? null,
                engine_supplier_id: form.engine_supplier_id ?? null,
                is_factory_team: form.is_factory_team ?? false,
                shareholders: form.shareholders?.trim() || null,
                owner_investment: form.owner_investment ?? null,
                sponsor_investment: form.sponsor_investment ?? null,
                surperformance_bonus: form.surperformance_bonus ?? null,
                title_sponsor: form.title_sponsor?.trim() || null,
                sponsor_duration: form.sponsor_duration ?? null,
                sponsor_objective: form.sponsor_objective?.trim() || null,
            }));

            const { data, error } = await supabase
                .from("teams")
                .insert(payload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: teamKeys.bySeason(variables.seasonId),
            });
            toast.success(`${data.length} equipe${data.length > 1 ? "s" : ""} importee${data.length > 1 ? "s" : ""}`);
        },
    });
}

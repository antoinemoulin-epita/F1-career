"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { staffKeys, personIdentityKeys } from "./use-staff";
import type { StaffImportResolved } from "@/lib/validators/staff-import";

const supabase = createClient();

export function useImportStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            seasonId,
            universeId,
            rows,
        }: {
            seasonId: string;
            universeId: string;
            rows: StaffImportResolved[];
        }) => {
            // 1. Fetch existing person_identities for this universe
            const { data: existingPersons, error: pErr } = await supabase
                .from("person_identities")
                .select("id, first_name, last_name")
                .eq("universe_id", universeId);
            if (pErr) throw pErr;

            const personMap = new Map<string, string>();
            for (const p of existingPersons ?? []) {
                const key = `${p.first_name.toLowerCase()}|${p.last_name.toLowerCase()}`;
                personMap.set(key, p.id);
            }

            // 2. Find persons to create
            const toCreate: { first_name: string; last_name: string; nationality: string | null; birth_year: number | null; role: string }[] = [];
            for (const row of rows) {
                const key = `${row.first_name.trim().toLowerCase()}|${row.last_name.trim().toLowerCase()}`;
                if (!personMap.has(key)) {
                    toCreate.push({
                        first_name: row.first_name.trim(),
                        last_name: row.last_name.trim(),
                        nationality: row.nationality?.trim() || null,
                        birth_year: row.birth_year ?? null,
                        role: row.role,
                    });
                    // Mark as pending to avoid duplicates within the same import
                    personMap.set(key, "__pending__");
                }
            }

            // 3. Batch create missing person_identities
            if (toCreate.length > 0) {
                const payload = toCreate.map((p) => ({
                    universe_id: universeId,
                    first_name: p.first_name,
                    last_name: p.last_name,
                    nationality: p.nationality,
                    birth_year: p.birth_year,
                    role: p.role,
                }));

                const { data: created, error: cErr } = await supabase
                    .from("person_identities")
                    .insert(payload)
                    .select("id, first_name, last_name");
                if (cErr) throw cErr;

                for (const p of created ?? []) {
                    const key = `${p.first_name.toLowerCase()}|${p.last_name.toLowerCase()}`;
                    personMap.set(key, p.id);
                }
            }

            // 4. Build staff_members payload
            const staffPayload = rows.map((row) => {
                const key = `${row.first_name.trim().toLowerCase()}|${row.last_name.trim().toLowerCase()}`;
                const personId = personMap.get(key);
                if (!personId || personId === "__pending__") {
                    throw new Error(`Personne introuvable : ${row.first_name} ${row.last_name}`);
                }

                return {
                    season_id: seasonId,
                    person_id: personId,
                    team_id: row.team_id,
                    role: row.role,
                    note: row.note,
                    potential_min: row.potential_min ?? null,
                    potential_max: row.potential_max ?? null,
                    potential_revealed: false,
                    birth_year: row.birth_year ?? null,
                    contract_years_remaining: row.contract_years_remaining ?? 1,
                    years_in_team: row.years_in_team ?? 1,
                    is_retiring: false,
                };
            });

            const { data, error } = await supabase
                .from("staff_members")
                .insert(staffPayload)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: staffKeys.bySeason(variables.seasonId),
            });
            queryClient.invalidateQueries({
                queryKey: personIdentityKeys.byUniverse(variables.universeId),
            });
            toast.success(`${data.length} membre${data.length > 1 ? "s" : ""} du staff importe${data.length > 1 ? "s" : ""}`);
        },
    });
}

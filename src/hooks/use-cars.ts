"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CarFormValues } from "@/lib/validators";

const supabase = createClient();

export const carKeys = {
    all: ["cars"] as const,
    bySeason: (seasonId: string) => ["cars", { seasonId }] as const,
    byTeam: (teamId: string) => ["cars", { teamId }] as const,
};

export function useCars(seasonId: string) {
    return useQuery({
        queryKey: carKeys.bySeason(seasonId),
        queryFn: async () => {
            // 1) Fetch team IDs for this season
            const { data: teams, error: teamsError } = await supabase
                .from("teams")
                .select("id")
                .eq("season_id", seasonId);
            if (teamsError) throw teamsError;

            const teamIds = teams.map((t) => t.id);
            if (teamIds.length === 0) return [];

            // 2) Fetch cars from the view filtered by team IDs
            const { data, error } = await supabase
                .from("v_cars_with_stats")
                .select("*")
                .in("team_id", teamIds)
                .order("total", { ascending: false, nullsFirst: false });
            if (error) throw error;
            return data;
        },
        enabled: !!seasonId,
    });
}

export function useCar(teamId: string) {
    return useQuery({
        queryKey: carKeys.byTeam(teamId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("cars")
                .select("*")
                .eq("team_id", teamId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!teamId,
    });
}

function normalizeForm(form: CarFormValues) {
    return {
        motor: form.motor,
        aero: form.aero,
        chassis: form.chassis,
        engine_change_penalty: form.engine_change_penalty ?? false,
    };
}

export function useCreateCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            teamId,
            form,
        }: {
            teamId: string;
            seasonId: string;
            form: CarFormValues;
        }) => {
            const { data, error } = await supabase
                .from("cars")
                .insert({ team_id: teamId, ...normalizeForm(form) })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: carKeys.bySeason(variables.seasonId) });
        },
    });
}

export function useUpdateCar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            form,
        }: {
            id: string;
            seasonId: string;
            form: CarFormValues;
        }) => {
            const { data, error } = await supabase
                .from("cars")
                .update(normalizeForm(form))
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: carKeys.bySeason(variables.seasonId) });
        },
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const staffProfileKeys = {
    identity: (personId: string) => ["staff-identity", personId] as const,
    career: (personId: string) => ["staff-career", personId] as const,
};

export function useStaffIdentity(personId: string) {
    return useQuery({
        queryKey: staffProfileKeys.identity(personId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("person_identities")
                .select("*")
                .eq("id", personId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!personId,
    });
}

export function useStaffCareer(personId: string) {
    return useQuery({
        queryKey: staffProfileKeys.career(personId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_staff_career")
                .select("*")
                .eq("person_id", personId)
                .order("year", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!personId,
    });
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: { email: string; password: string }) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect("/universe");
}

export async function signOut() {
    const supabase = await createClient();
    // Ignore errors - always redirect to login regardless
    await supabase.auth.signOut().catch(() => {});
    redirect("/login");
}

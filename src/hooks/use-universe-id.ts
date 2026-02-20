"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useUniverses } from "./use-universes";

/**
 * Resolves the active universe ID from the `?u=` search param,
 * or auto-selects the first universe if there is only one.
 */
export function useUniverseId() {
    const searchParams = useSearchParams();
    const paramId = searchParams.get("u") ?? "";
    const { data: universes, isLoading } = useUniverses();

    const universeId = useMemo(() => {
        if (paramId) return paramId;
        if (universes && universes.length === 1) return universes[0].id;
        return "";
    }, [paramId, universes]);

    return { universeId, isLoading };
}

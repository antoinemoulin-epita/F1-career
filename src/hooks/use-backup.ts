"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exportUniverse } from "@/lib/export/json-export";
import { universeExportSchema } from "@/lib/import/json-schema";
import { importUniverse } from "@/lib/import/json-import";
import { universeKeys } from "@/hooks/use-universes";
import type { UniverseExportData } from "@/lib/import/json-schema";
import type { ImportResult } from "@/lib/import/json-import";

// ─── Export hook ─────────────────────────────────────────────────────────────

export function useExportUniverse() {
    return useMutation({
        mutationFn: async ({ universeId, universeName }: { universeId: string; universeName: string }) => {
            const data = await exportUniverse(universeId);
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${universeName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_backup.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return data;
        },
    });
}

// ─── Import hook ─────────────────────────────────────────────────────────────

export function useImportUniverse() {
    const queryClient = useQueryClient();

    return useMutation<ImportResult, Error, UniverseExportData>({
        mutationFn: async (data) => {
            return importUniverse(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: universeKeys.all });
        },
    });
}

// ─── Parse & validate file helper ────────────────────────────────────────────

export async function parseBackupFile(file: File): Promise<UniverseExportData> {
    const text = await file.text();
    const json = JSON.parse(text);
    const result = universeExportSchema.safeParse(json);
    if (!result.success) {
        const firstError = result.error.issues[0];
        throw new Error(
            `Invalid backup file: ${firstError.path.join(".")} — ${firstError.message}`,
        );
    }
    return result.data;
}

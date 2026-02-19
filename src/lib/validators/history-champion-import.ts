import { z } from "zod";

export const historyChampionImportSchema = z.object({
    year: z.number().int().min(1950).max(2100),
    driver_name: z.string().min(1, "Le nom du pilote est requis"),
    driver_team: z.string().optional().or(z.literal("")),
    driver_points: z.number().optional(),
    team_name: z.string().optional().or(z.literal("")),
    team_points: z.number().optional(),
    summary: z.string().optional().or(z.literal("")),
});

export type HistoryChampionImportValues = z.infer<typeof historyChampionImportSchema>;

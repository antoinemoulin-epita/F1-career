import { z } from "zod";

export const historyChampionSchema = z.object({
    year: z.number().int().min(1950, "L'annee doit etre >= 1950").max(2100, "L'annee doit etre <= 2100"),
    champion_driver_name: z.string().min(1, "Le nom du pilote est requis"),
    champion_driver_team: z.string().optional().or(z.literal("")),
    champion_driver_points: z.number().nullable().optional(),
    champion_team_name: z.string().optional().or(z.literal("")),
    champion_team_points: z.number().nullable().optional(),
    season_summary: z.string().optional().or(z.literal("")),
});

export type HistoryChampionFormValues = z.infer<typeof historyChampionSchema>;

export const historyChampionFormDefaults: HistoryChampionFormValues = {
    year: 2024,
    champion_driver_name: "",
    champion_driver_team: "",
    champion_driver_points: null,
    champion_team_name: "",
    champion_team_points: null,
    season_summary: "",
};

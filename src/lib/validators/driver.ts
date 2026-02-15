import { z } from "zod";

export const driverSchema = z.object({
    // Identite
    first_name: z.string().optional().or(z.literal("")),
    last_name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
    nationality: z.string().optional().or(z.literal("")),
    birth_year: z.number().int().min(1950).max(2015).nullable().optional(),
    // Stats
    note: z.number().min(0).max(10),
    potential_min: z.number().min(0).max(10).nullable().optional(),
    potential_max: z.number().min(0).max(10).nullable().optional(),
    potential_revealed: z.boolean().optional(),
    potential_final: z.number().min(0).max(10).nullable().optional(),
    // Equipe
    team_id: z.string().nullable().optional(),
    years_in_team: z.number().int().min(0).nullable().optional(),
    is_first_driver: z.boolean().optional(),
    contract_years_remaining: z.number().int().min(0).nullable().optional(),
    // Status
    is_rookie: z.boolean().optional(),
    is_retiring: z.boolean().optional(),
    // Carriere
    world_titles: z.number().int().min(0).nullable().optional(),
    career_races: z.number().int().min(0).nullable().optional(),
    career_wins: z.number().int().min(0).nullable().optional(),
    career_poles: z.number().int().min(0).nullable().optional(),
    career_podiums: z.number().int().min(0).nullable().optional(),
    career_points: z.number().min(0).nullable().optional(),
});

export type DriverFormValues = z.infer<typeof driverSchema>;

export const driverFormDefaults: DriverFormValues = {
    first_name: "",
    last_name: "",
    nationality: "",
    birth_year: null,
    note: 5,
    potential_min: null,
    potential_max: null,
    potential_revealed: false,
    potential_final: null,
    team_id: null,
    years_in_team: 1,
    is_first_driver: false,
    contract_years_remaining: null,
    is_rookie: false,
    is_retiring: false,
    world_titles: null,
    career_races: null,
    career_wins: null,
    career_poles: null,
    career_podiums: null,
    career_points: null,
};

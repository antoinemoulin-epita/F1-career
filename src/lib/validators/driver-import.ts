import { z } from "zod";
import { validNationalityCodes } from "@/lib/constants/nationalities";

export const driverImportSchema = z.object({
    // Identite
    first_name: z.string().optional().or(z.literal("")),
    last_name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
    nationality: z.enum(validNationalityCodes as [string, ...string[]]).or(z.literal("")).optional(),
    birth_year: z.number().int().min(1940).max(2015).nullable().optional(),
    // Stats
    note: z.number().int().min(0).max(10),
    potential_min: z.number().int().min(0).max(10).nullable().optional(),
    potential_max: z.number().int().min(0).max(10).nullable().optional(),
    potential_revealed: z.boolean().optional(),
    potential_final: z.number().int().min(0).max(10).nullable().optional(),
    // Equipe — nom au lieu d'UUID
    team: z.string().optional().or(z.literal("")),
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
    career_points: z.number().int().min(0).nullable().optional(),
});

export type DriverImportValues = z.infer<typeof driverImportSchema>;

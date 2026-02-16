import { z } from "zod";
import { validNationalityCodes } from "@/lib/constants/nationalities";

export const teamImportSchema = z.object({
    // Identite
    name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
    short_name: z.string().max(5, "5 caracteres max").optional().or(z.literal("")),
    nationality: z.enum(validNationalityCodes as [string, ...string[]]).or(z.literal("")).optional(),
    color_primary: z.string().optional().or(z.literal("")),
    color_secondary: z.string().optional().or(z.literal("")),
    // Staff
    team_principal: z.string().optional().or(z.literal("")),
    technical_director: z.string().optional().or(z.literal("")),
    engineer_level: z.number().int().min(1).max(3).nullable().optional(),
    // Moteur — nom au lieu d'UUID
    engine_supplier: z.string().optional().or(z.literal("")),
    is_factory_team: z.boolean().optional(),
    // Budget & Sponsor
    shareholders: z.string().optional().or(z.literal("")),
    owner_investment: z.number().int().min(0).max(2).nullable().optional(),
    sponsor_investment: z.number().int().min(0).max(2).nullable().optional(),
    surperformance_bonus: z.number().min(0).nullable().optional(),
    title_sponsor: z.string().optional().or(z.literal("")),
    sponsor_duration: z.number().int().min(1).nullable().optional(),
    sponsor_objective: z.string().optional().or(z.literal("")),
});

export type TeamImportValues = z.infer<typeof teamImportSchema>;

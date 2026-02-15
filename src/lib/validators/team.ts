import { z } from "zod";

export const teamSchema = z.object({
    // Identite
    name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
    short_name: z.string().max(5, "5 caracteres max").optional().or(z.literal("")),
    nationality: z.string().optional().or(z.literal("")),
    color_primary: z.string().optional().or(z.literal("")),
    color_secondary: z.string().optional().or(z.literal("")),
    // Staff
    team_principal: z.string().optional().or(z.literal("")),
    technical_director: z.string().optional().or(z.literal("")),
    engineer_level: z.number().int().min(1).max(3).nullable().optional(),
    // Moteur
    engine_supplier_id: z.string().nullable().optional(),
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

export type TeamFormValues = z.infer<typeof teamSchema>;

export const teamFormDefaults: TeamFormValues = {
    name: "",
    short_name: "",
    nationality: "",
    color_primary: "",
    color_secondary: "",
    team_principal: "",
    technical_director: "",
    engineer_level: 2,
    engine_supplier_id: null,
    is_factory_team: false,
    shareholders: "",
    owner_investment: 1,
    sponsor_investment: 1,
    surperformance_bonus: null,
    title_sponsor: "",
    sponsor_duration: null,
    sponsor_objective: "",
};

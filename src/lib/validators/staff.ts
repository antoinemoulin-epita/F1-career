import { z } from "zod";

const starRating = z
    .number()
    .min(1, "Minimum 1")
    .max(5, "Maximum 5")
    .refine((v) => v * 2 === Math.floor(v * 2), "Demi-pas uniquement (1, 1.5, 2, ...)");

const starRatingOptional = starRating.nullable().optional();

export const staffSchema = z.object({
    person_id: z.string().min(1, "La personne est requise"),
    role: z.enum(["principal", "technical_director", "sporting_director", "chief_engineer"]),
    team_id: z.string().min(1, "L'equipe est requise"),
    note: starRating,
    potential_min: starRatingOptional,
    potential_max: starRatingOptional,
    potential_final: starRatingOptional,
    potential_revealed: z.boolean().optional(),
    birth_year: z
        .number()
        .int()
        .min(1950, "Minimum 1950")
        .max(2015, "Maximum 2015")
        .nullable()
        .optional(),
    contract_years_remaining: z.number().int().min(0, "Minimum 0").nullable().optional(),
    years_in_team: z.number().int().min(1, "Minimum 1").nullable().optional(),
    is_retiring: z.boolean().optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;

export const staffFormDefaults: StaffFormValues = {
    person_id: "",
    role: "principal",
    team_id: "",
    note: 3,
    potential_min: null,
    potential_max: null,
    potential_final: null,
    potential_revealed: false,
    birth_year: null,
    contract_years_remaining: 1,
    years_in_team: 1,
    is_retiring: false,
};

export const staffRoleLabels: Record<string, string> = {
    principal: "Team Principal",
    technical_director: "Directeur Technique",
    sporting_director: "Directeur Sportif",
    chief_engineer: "Ingenieur en Chef",
};

export const staffRoleItems = Object.entries(staffRoleLabels).map(([id, label]) => ({
    id,
    label,
}));

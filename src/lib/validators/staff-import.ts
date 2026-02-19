import { z } from "zod";

const starRating = z
    .number()
    .min(1, "Minimum 1")
    .max(5, "Maximum 5")
    .refine((v) => v * 2 === Math.floor(v * 2), "Demi-pas uniquement (1, 1.5, 2, ...)");

export const staffImportSchema = z.object({
    first_name: z.string().min(1, "Le prenom est requis"),
    last_name: z.string().min(1, "Le nom est requis"),
    nationality: z.string().optional().or(z.literal("")),
    birth_year: z.number().int().min(1900).max(2015).optional(),
    team: z.string().min(1, "L'equipe est requise"),
    role: z.enum(["principal", "technical_director", "sporting_director", "chief_engineer"]),
    note: starRating,
    potential_min: starRating.optional(),
    potential_max: starRating.optional(),
    contract_years_remaining: z.number().int().min(0).optional(),
    years_in_team: z.number().int().min(1).optional(),
});

export type StaffImportValues = z.infer<typeof staffImportSchema>;

export type StaffImportResolved = Omit<StaffImportValues, "team"> & {
    team_id: string;
};

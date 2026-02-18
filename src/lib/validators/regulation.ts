import { z } from "zod";

export const regulationSchema = z.object({
    name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
    description: z.string().optional().or(z.literal("")),
    effective_year: z.number().int().min(1950, "L'annee doit etre >= 1950").max(2100),
    reset_type: z.enum(["critical", "important", "partial"]),
    affects_aero: z.boolean().optional(),
    affects_chassis: z.boolean().optional(),
    affects_motor: z.boolean().optional(),
});

export type RegulationFormValues = z.infer<typeof regulationSchema>;

export const regulationFormDefaults: RegulationFormValues = {
    name: "",
    description: "",
    effective_year: 2025,
    reset_type: "partial",
    affects_aero: false,
    affects_chassis: false,
    affects_motor: false,
};

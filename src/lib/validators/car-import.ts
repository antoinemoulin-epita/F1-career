import { z } from "zod";

export const carImportSchema = z.object({
    team: z.string().min(1, "Le nom de l'equipe est requis"),
    motor: z.number().min(0).max(10),
    aero: z.number().min(0).max(10),
    chassis: z.number().min(0).max(10),
    engine_change_penalty: z.boolean().optional(),
});

export type CarImportValues = z.infer<typeof carImportSchema>;

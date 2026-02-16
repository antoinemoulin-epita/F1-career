import { z } from "zod";

export const createUniverseSchema = z.object({
    name: z.string().min(3, "Le nom doit faire au moins 3 caracteres"),
    description: z.string().optional(),
    start_year: z.number().int().min(1950, "L'annee doit etre >= 1950").max(2030, "L'annee doit etre <= 2030"),
});

export type CreateUniverseInput = z.infer<typeof createUniverseSchema>;

export { teamSchema, teamFormDefaults, type TeamFormValues } from "./team";
export { driverSchema, driverFormDefaults, type DriverFormValues } from "./driver";
export { carSchema, carFormDefaults, type CarFormValues } from "./car";
export { rookiePoolSchema, rookiePoolFormDefaults, type RookiePoolFormValues } from "./rookie-pool";
export { narrativeArcSchema, narrativeArcFormDefaults, type NarrativeArcFormValues } from "./narrative-arc";
export { newsSchema, newsFormDefaults, type NewsFormValues } from "./news";
export { engineSupplierSchema, engineSupplierFormDefaults, type EngineSupplierFormValues } from "./engine-supplier";

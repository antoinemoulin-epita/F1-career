import { z } from "zod";
import { validNationalityCodes } from "@/lib/constants/nationalities";

export const engineSupplierSchema = z.object({
    name: z.string().min(2, "Le nom doit faire au moins 2 caracteres").max(100),
    nationality: z.enum(validNationalityCodes as [string, ...string[]]).or(z.literal("")).optional(),
    note: z.number().int().min(0, "Note entre 0 et 10").max(10, "Note entre 0 et 10"),
    investment_level: z.number().int().min(1, "Niveau entre 1 et 3").max(3, "Niveau entre 1 et 3"),
});

export type EngineSupplierFormValues = z.infer<typeof engineSupplierSchema>;

export const engineSupplierFormDefaults: EngineSupplierFormValues = {
    name: "",
    nationality: "",
    note: 5,
    investment_level: 2,
};

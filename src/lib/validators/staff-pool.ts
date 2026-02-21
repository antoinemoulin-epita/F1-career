import { z } from "zod";
import { validNationalityCodes } from "@/lib/constants/nationalities";

export const staffPoolSchema = z.object({
    first_name: z.string().optional().or(z.literal("")),
    last_name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
    nationality: z.enum(validNationalityCodes as [string, ...string[]]).or(z.literal("")).optional(),
    birth_year: z.number().int().min(1850).max(2015).nullable().optional(),
    role: z.enum(["principal", "technical_director", "sporting_director", "chief_engineer"]),
    note: z.number().min(1).max(5).nullable().optional(),
    available_from_year: z.number().int().min(1950).max(2100).nullable().optional(),
});

export type StaffPoolFormValues = z.infer<typeof staffPoolSchema>;

export const staffPoolFormDefaults: StaffPoolFormValues = {
    first_name: "",
    last_name: "",
    nationality: "",
    birth_year: null,
    role: "principal",
    note: null,
    available_from_year: null,
};

import { z } from "zod";
import { validNationalityCodes } from "@/lib/constants/nationalities";

export const rookiePoolSchema = z
    .object({
        first_name: z.string().optional().or(z.literal("")),
        last_name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
        nationality: z.enum(validNationalityCodes as [string, ...string[]]).or(z.literal("")).optional(),
        birth_year: z.number().int().min(1940).max(2015).nullable().optional(),
        potential_min: z.number().int().min(0).max(10),
        potential_max: z.number().int().min(0).max(10),
        available_from_year: z.number().int().min(1950).max(2100).nullable().optional(),
    })
    .refine((d) => d.potential_min <= d.potential_max, {
        message: "Le potentiel min doit etre <= au potentiel max",
        path: ["potential_min"],
    });

export type RookiePoolFormValues = z.infer<typeof rookiePoolSchema>;

export const rookiePoolFormDefaults: RookiePoolFormValues = {
    first_name: "",
    last_name: "",
    nationality: "",
    birth_year: null,
    potential_min: 3,
    potential_max: 7,
    available_from_year: null,
};

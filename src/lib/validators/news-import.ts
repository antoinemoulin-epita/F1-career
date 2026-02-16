import { z } from "zod";

export const newsImportSchema = z.object({
    headline: z.string().min(2, "Le titre doit faire au moins 2 caracteres"),
    content: z.string().optional().or(z.literal("")),
    news_type: z.enum([
        "transfer",
        "technical",
        "sponsor",
        "regulation",
        "injury",
        "retirement",
        "other",
    ]),
    importance: z.number().int().min(1).max(5),
    after_round: z.number().int().min(0).nullable().optional(),
    // Arc — nom au lieu d'UUID
    arc: z.string().optional().or(z.literal("")),
});

export type NewsImportValues = z.infer<typeof newsImportSchema>;

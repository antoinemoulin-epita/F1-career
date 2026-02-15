import { z } from "zod";

export const newsSchema = z.object({
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
    arc_id: z.string().nullable().optional(),
});

export type NewsFormValues = z.infer<typeof newsSchema>;

export const newsFormDefaults: NewsFormValues = {
    headline: "",
    content: "",
    news_type: "other",
    importance: 2,
    after_round: null,
    arc_id: null,
};

import { z } from "zod";

export const narrativeArcSchema = z.object({
    name: z.string().min(2, "Le nom doit faire au moins 2 caracteres"),
    description: z.string().optional().or(z.literal("")),
    arc_type: z.enum([
        "transfer",
        "rivalry",
        "technical",
        "sponsor",
        "entry_exit",
        "drama",
        "regulation",
        "other",
    ]),
    status: z.enum(["signal", "developing", "confirmed", "resolved"]),
    importance: z.number().int().min(1).max(5),
    related_driver_ids: z.array(z.string()).optional(),
    related_team_ids: z.array(z.string()).optional(),
    started_season_id: z.string().nullable().optional(),
    started_round: z.number().int().min(0).nullable().optional(),
    resolved_season_id: z.string().nullable().optional(),
    resolved_round: z.number().int().min(0).nullable().optional(),
    resolution_summary: z.string().optional().or(z.literal("")),
    has_branches: z.boolean().optional(),
});

export type NarrativeArcFormValues = z.infer<typeof narrativeArcSchema>;

export const narrativeArcFormDefaults: NarrativeArcFormValues = {
    name: "",
    description: "",
    arc_type: "other",
    status: "signal",
    importance: 2,
    related_driver_ids: [],
    related_team_ids: [],
    started_season_id: null,
    started_round: null,
    resolved_season_id: null,
    resolved_round: null,
    resolution_summary: "",
    has_branches: false,
};

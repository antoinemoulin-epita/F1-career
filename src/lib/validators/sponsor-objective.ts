import { z } from "zod";

export const sponsorObjectiveSchema = z.object({
    objective_type: z.enum([
        "constructor_position",
        "driver_position",
        "wins",
        "podiums",
        "points_minimum",
        "beat_team",
        "beat_driver",
        "race_win_at_circuit",
        "custom",
    ]),
    target_value: z.number().nullable().optional(),
    target_entity_id: z.string().nullable().optional(),
    description: z.string().optional().or(z.literal("")),
});

export type SponsorObjectiveFormValues = z.infer<typeof sponsorObjectiveSchema>;

export const sponsorObjectiveFormDefaults: SponsorObjectiveFormValues = {
    objective_type: "constructor_position",
    target_value: null,
    target_entity_id: null,
    description: "",
};

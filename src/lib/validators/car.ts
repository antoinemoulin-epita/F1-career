import { z } from "zod";

export const carSchema = z.object({
    motor: z.number().min(0).max(10),
    aero: z.number().min(0).max(10),
    chassis: z.number().min(0).max(10),
    engine_change_penalty: z.boolean().optional(),
});

export type CarFormValues = z.infer<typeof carSchema>;

export const carFormDefaults: CarFormValues = {
    motor: 5,
    aero: 5,
    chassis: 5,
    engine_change_penalty: false,
};

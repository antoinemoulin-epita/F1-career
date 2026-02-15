"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { calculateDerivedStats } from "@/lib/calculations/car-stats";
import { useCreateCar, useUpdateCar } from "@/hooks/use-cars";
import { carSchema, carFormDefaults, type CarFormValues } from "@/lib/validators";
import type { Car } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFNumberInput({
    name,
    control,
    label,
    placeholder,
    hint,
}: {
    name: keyof CarFormValues;
    control: Control<CarFormValues>;
    label: string;
    placeholder?: string;
    hint?: string;
}) {
    const { field, fieldState } = useController({ name, control });
    return (
        <Input
            label={label}
            placeholder={placeholder}
            value={field.value != null ? String(field.value) : ""}
            onChange={(v) => {
                const n = parseFloat(v);
                field.onChange(v === "" ? null : isNaN(n) ? null : n);
            }}
            isInvalid={!!fieldState.error}
            hint={fieldState.error?.message ?? hint}
        />
    );
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-secondary">{title}</h3>
            {children}
        </div>
    );
}

// ─── CarForm ────────────────────────────────────────────────────────────────

interface CarFormProps {
    seasonId: string;
    teamId: string;
    car?: Car;
    suggestedMotor?: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CarForm({ seasonId, teamId, car, suggestedMotor, onSuccess, onCancel }: CarFormProps) {
    const createCar = useCreateCar();
    const updateCar = useUpdateCar();

    const isEdit = !!car;

    const form = useForm<CarFormValues>({
        resolver: zodResolver(carSchema),
        defaultValues: car
            ? {
                  motor: car.motor,
                  aero: car.aero,
                  chassis: car.chassis,
                  engine_change_penalty: car.engine_change_penalty ?? false,
              }
            : carFormDefaults,
    });

    const isPending = createCar.isPending || updateCar.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateCar.mutate(
                { id: car.id, seasonId, form: values },
                { onSuccess },
            );
        } else {
            createCar.mutate(
                { teamId, seasonId, form: values },
                { onSuccess },
            );
        }
    });

    // Derived stats (real-time)
    const motor = form.watch("motor") ?? 0;
    const aero = form.watch("aero") ?? 0;
    const chassis = form.watch("chassis") ?? 0;
    const engineChangePenalty = form.watch("engine_change_penalty") ?? false;

    const stats = calculateDerivedStats(motor, aero, chassis, engineChangePenalty);

    // RHF controller for Checkbox
    const engineChangePenaltyField = useController({ name: "engine_change_penalty", control: form.control });

    const motorHint = suggestedMotor != null ? `Suggere : ${suggestedMotor} d'apres le motoriste` : undefined;

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Moteur */}
                <Section title="Moteur">
                    <RHFNumberInput
                        name="motor"
                        control={form.control}
                        label="Moteur"
                        placeholder="5"
                        hint={motorHint}
                    />
                </Section>

                {/* Performance */}
                <Section title="Performance">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput name="aero" control={form.control} label="Aero" placeholder="5" />
                        <RHFNumberInput name="chassis" control={form.control} label="Chassis" placeholder="5" />
                    </div>
                </Section>

                {/* Penalite */}
                <Section title="Penalite">
                    <Checkbox
                        label="Changement de moteur"
                        hint="Applique -1 au chassis"
                        isSelected={engineChangePenaltyField.field.value ?? false}
                        onChange={engineChangePenaltyField.field.onChange}
                    />
                </Section>

                {/* Stats derivees */}
                <div className="rounded-lg bg-secondary p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary">Total</span>
                        <span className="text-lg font-semibold text-primary">{stats.total}</span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-xs text-tertiary">
                        <div className="flex justify-between">
                            <span>Vitesse</span>
                            <span>{stats.speed}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Grip</span>
                            <span>{stats.grip}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Acceleration</span>
                            <span>{stats.acceleration}</span>
                        </div>
                        {engineChangePenalty && (
                            <div className="flex justify-between">
                                <span>Chassis effectif</span>
                                <span>{stats.effectiveChassis}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end gap-3">
                <Button size="md" color="secondary" type="button" onClick={onCancel}>
                    Annuler
                </Button>
                <Button size="md" type="submit" isLoading={isPending}>
                    {isEdit ? "Enregistrer" : "Creer"}
                </Button>
            </div>
        </form>
    );
}

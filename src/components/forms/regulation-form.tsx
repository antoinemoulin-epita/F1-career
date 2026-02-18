"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { useCreateRegulation, useUpdateRegulation } from "@/hooks/use-regulations";
import {
    regulationSchema,
    regulationFormDefaults,
    type RegulationFormValues,
} from "@/lib/validators/regulation";
import type { Regulation } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof RegulationFormValues;
    control: Control<RegulationFormValues>;
    label: string;
    placeholder?: string;
    isRequired?: boolean;
}) {
    const { field, fieldState } = useController({ name, control });
    return (
        <Input
            label={label}
            placeholder={placeholder}
            isRequired={isRequired}
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            isInvalid={!!fieldState.error}
            hint={fieldState.error?.message}
        />
    );
}

function RHFNumberInput({
    name,
    control,
    label,
    placeholder,
}: {
    name: keyof RegulationFormValues;
    control: Control<RegulationFormValues>;
    label: string;
    placeholder?: string;
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
            hint={fieldState.error?.message}
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

// ─── Select items ───────────────────────────────────────────────────────────

const resetTypeItems = [
    { id: "critical", label: "Critique (0–3)" },
    { id: "important", label: "Important (2–5)" },
    { id: "partial", label: "Partiel (4–7)" },
];

// ─── RegulationForm ─────────────────────────────────────────────────────────

interface RegulationFormProps {
    universeId: string;
    regulation?: Regulation;
    onSuccess: () => void;
    onCancel: () => void;
}

export function RegulationForm({ universeId, regulation, onSuccess, onCancel }: RegulationFormProps) {
    const createRegulation = useCreateRegulation();
    const updateRegulation = useUpdateRegulation();

    const isEdit = !!regulation;

    const form = useForm<RegulationFormValues>({
        resolver: zodResolver(regulationSchema),
        defaultValues: regulation
            ? {
                  name: regulation.name ?? "",
                  description: regulation.description ?? "",
                  effective_year: regulation.effective_year,
                  reset_type: regulation.reset_type ?? "partial",
                  affects_aero: regulation.affects_aero ?? false,
                  affects_chassis: regulation.affects_chassis ?? false,
                  affects_motor: regulation.affects_motor ?? false,
              }
            : regulationFormDefaults,
    });

    const isPending = createRegulation.isPending || updateRegulation.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateRegulation.mutate(
                { id: regulation.id, universeId, form: values },
                { onSuccess },
            );
        } else {
            createRegulation.mutate(
                { universeId, form: values },
                { onSuccess },
            );
        }
    });

    // RHF controllers
    const resetTypeField = useController({ name: "reset_type", control: form.control });
    const descriptionField = useController({ name: "description", control: form.control });
    const affectsAeroField = useController({ name: "affects_aero", control: form.control });
    const affectsChassisField = useController({ name: "affects_chassis", control: form.control });
    const affectsMotorField = useController({ name: "affects_motor", control: form.control });

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Informations */}
                <Section title="Informations">
                    <RHFInput
                        name="name"
                        control={form.control}
                        label="Nom"
                        placeholder="Changement reglementation moteur"
                        isRequired
                    />
                    <TextArea
                        label="Description"
                        placeholder="Details de la reglementation..."
                        value={(descriptionField.field.value as string) ?? ""}
                        onChange={descriptionField.field.onChange}
                        rows={3}
                    />
                    <RHFNumberInput
                        name="effective_year"
                        control={form.control}
                        label="Annee d'entree en vigueur"
                        placeholder="2026"
                    />
                </Section>

                {/* Type de reset */}
                <Section title="Reset">
                    <Select
                        label="Type de reset"
                        placeholder="Selectionner"
                        items={resetTypeItems}
                        selectedKey={resetTypeField.field.value}
                        onSelectionChange={(key) => resetTypeField.field.onChange(key as string)}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                {/* Domaines affectes */}
                <Section title="Domaines affectes">
                    <Checkbox
                        label="Aerodynamique"
                        isSelected={affectsAeroField.field.value ?? false}
                        onChange={affectsAeroField.field.onChange}
                    />
                    <Checkbox
                        label="Chassis"
                        isSelected={affectsChassisField.field.value ?? false}
                        onChange={affectsChassisField.field.onChange}
                    />
                    <Checkbox
                        label="Moteur"
                        isSelected={affectsMotorField.field.value ?? false}
                        onChange={affectsMotorField.field.onChange}
                    />
                </Section>
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

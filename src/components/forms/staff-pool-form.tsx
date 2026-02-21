"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { StarRating } from "@/components/base/star-rating/star-rating";
import { useCreateStaffPoolEntry, useUpdateStaffPoolEntry } from "@/hooks/use-staff-pool";
import { staffPoolSchema, staffPoolFormDefaults, type StaffPoolFormValues } from "@/lib/validators";
import { nationalityItems } from "@/lib/constants/nationalities";
import { staffRoleItems } from "@/lib/validators/staff";
import type { StaffPool } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof StaffPoolFormValues;
    control: Control<StaffPoolFormValues>;
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
    name: keyof StaffPoolFormValues;
    control: Control<StaffPoolFormValues>;
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

function RHFStarRating({
    name,
    control,
    label,
}: {
    name: keyof StaffPoolFormValues;
    control: Control<StaffPoolFormValues>;
    label: string;
}) {
    const { field, fieldState } = useController({ name, control });
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-secondary">{label}</span>
            <StarRating
                value={field.value as number | null}
                onChange={(v) => field.onChange(v)}
                size="md"
                showValue
            />
            {fieldState.error && (
                <span className="text-xs text-error-primary">{fieldState.error.message}</span>
            )}
        </div>
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

// ─── StaffPoolForm ─────────────────────────────────────────────────────────

interface StaffPoolFormProps {
    universeId: string;
    entry?: StaffPool;
    onSuccess: () => void;
    onCancel: () => void;
}

export function StaffPoolForm({ universeId, entry, onSuccess, onCancel }: StaffPoolFormProps) {
    const createEntry = useCreateStaffPoolEntry();
    const updateEntry = useUpdateStaffPoolEntry();

    const isEdit = !!entry;

    const form = useForm<StaffPoolFormValues>({
        resolver: zodResolver(staffPoolSchema),
        defaultValues: entry
            ? {
                  first_name: entry.first_name ?? "",
                  last_name: entry.last_name,
                  nationality: entry.nationality ?? "",
                  birth_year: entry.birth_year ?? null,
                  role: entry.role as StaffPoolFormValues["role"],
                  note: entry.note != null ? Number(entry.note) : null,
                  available_from_year: entry.available_from_year ?? null,
              }
            : staffPoolFormDefaults,
    });

    const isPending = createEntry.isPending || updateEntry.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateEntry.mutate(
                { id: entry.id, universeId, form: values },
                { onSuccess },
            );
        } else {
            createEntry.mutate(
                { universeId, form: values },
                { onSuccess },
            );
        }
    });

    const nationalityField = useController({ name: "nationality", control: form.control });
    const roleField = useController({ name: "role", control: form.control });

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Identite */}
                <Section title="Identite">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput name="first_name" control={form.control} label="Prenom" placeholder="Adrian" />
                        <RHFInput name="last_name" control={form.control} label="Nom" placeholder="Newey" isRequired />
                    </div>
                    <Select.ComboBox
                        label="Nationalite"
                        placeholder="Rechercher..."
                        items={nationalityItems}
                        selectedKey={nationalityField.field.value || null}
                        onSelectionChange={(key) => nationalityField.field.onChange(key as string ?? "")}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select.ComboBox>
                    <RHFNumberInput name="birth_year" control={form.control} label="Annee de naissance" placeholder="1958" />
                </Section>

                {/* Role */}
                <Section title="Role">
                    <Select
                        label="Role"
                        placeholder="Selectionner un role"
                        items={staffRoleItems}
                        selectedKey={roleField.field.value}
                        onSelectionChange={(key) => roleField.field.onChange(key as string)}
                        isRequired
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                {/* Note */}
                <Section title="Note">
                    <RHFStarRating name="note" control={form.control} label="Note" />
                </Section>

                {/* Disponibilite */}
                <Section title="Disponibilite">
                    <RHFNumberInput name="available_from_year" control={form.control} label="Disponible a partir de" placeholder="2026" />
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

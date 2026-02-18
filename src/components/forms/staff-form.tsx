"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { StarRating } from "@/components/base/star-rating/star-rating";
import { useCreateStaff, useUpdateStaff } from "@/hooks/use-staff";
import {
    staffSchema,
    staffFormDefaults,
    staffRoleItems,
    type StaffFormValues,
} from "@/lib/validators/staff";
import type { PersonIdentity, StaffMember } from "@/types";

// ─── RHF helpers ────────────────────────────────────────────────────────────

function RHFNumberInput({
    name,
    control,
    label,
    placeholder,
}: {
    name: keyof StaffFormValues;
    control: Control<StaffFormValues>;
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
    isRequired,
    showValue,
}: {
    name: keyof StaffFormValues;
    control: Control<StaffFormValues>;
    label: string;
    isRequired?: boolean;
    showValue?: boolean;
}) {
    const { field, fieldState } = useController({ name, control });
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-secondary">
                {label}
                {isRequired && <span className="text-error-primary"> *</span>}
            </span>
            <StarRating
                value={field.value as number | null}
                onChange={(v) => field.onChange(v)}
                size="md"
                showValue={showValue}
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

// ─── StaffForm ──────────────────────────────────────────────────────────────

interface StaffFormProps {
    seasonId: string;
    persons: PersonIdentity[];
    teams: Array<{ id: string; name: string }>;
    staff?: StaffMember;
    onSuccess: () => void;
    onCancel: () => void;
}

export function StaffForm({
    seasonId,
    persons,
    teams,
    staff,
    onSuccess,
    onCancel,
}: StaffFormProps) {
    const createStaff = useCreateStaff();
    const updateStaff = useUpdateStaff();

    const isEdit = !!staff;

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: staff
            ? {
                  person_id: staff.person_id,
                  role: staff.role as StaffFormValues["role"],
                  team_id: staff.team_id,
                  note: staff.note ?? 3,
                  potential_min: staff.potential_min ?? null,
                  potential_max: staff.potential_max ?? null,
                  potential_final: staff.potential_final ?? null,
                  potential_revealed: staff.potential_revealed ?? false,
                  birth_year: staff.birth_year ?? null,
                  contract_years_remaining: staff.contract_years_remaining ?? 1,
                  years_in_team: staff.years_in_team ?? 1,
                  is_retiring: staff.is_retiring ?? false,
              }
            : staffFormDefaults,
    });

    const isPending = createStaff.isPending || updateStaff.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateStaff.mutate(
                { id: staff.id, seasonId, form: values },
                { onSuccess },
            );
        } else {
            createStaff.mutate(
                { seasonId, form: values },
                { onSuccess },
            );
        }
    });

    const personIdField = useController({ name: "person_id", control: form.control });
    const roleField = useController({ name: "role", control: form.control });
    const teamIdField = useController({ name: "team_id", control: form.control });
    const potentialRevealedField = useController({ name: "potential_revealed", control: form.control });
    const isRetiringField = useController({ name: "is_retiring", control: form.control });

    const personItems = persons.map((p) => ({
        id: p.id,
        label: `${p.first_name} ${p.last_name}`,
    }));

    const teamItems = teams.map((t) => ({
        id: t.id,
        label: t.name,
    }));

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                <Section title="Personne">
                    <Select.ComboBox
                        label="Personne"
                        placeholder="Rechercher..."
                        items={personItems}
                        selectedKey={personIdField.field.value || null}
                        onSelectionChange={(key) => personIdField.field.onChange(key as string ?? "")}
                        isInvalid={!!personIdField.fieldState.error}
                        hint={personIdField.fieldState.error?.message}
                        isRequired
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select.ComboBox>
                </Section>

                <Section title="Role">
                    <Select
                        label="Role"
                        placeholder="Selectionner un role"
                        items={staffRoleItems}
                        selectedKey={roleField.field.value}
                        onSelectionChange={(key) => roleField.field.onChange(key as string)}
                        isInvalid={!!roleField.fieldState.error}
                        hint={roleField.fieldState.error?.message}
                        isRequired
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                <Section title="Equipe">
                    <Select
                        label="Equipe"
                        placeholder="Selectionner une equipe"
                        items={teamItems}
                        selectedKey={teamIdField.field.value || null}
                        onSelectionChange={(key) => teamIdField.field.onChange(key as string ?? "")}
                        isInvalid={!!teamIdField.fieldState.error}
                        hint={teamIdField.fieldState.error?.message}
                        isRequired
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                <Section title="Competences">
                    <RHFStarRating
                        name="note"
                        control={form.control}
                        label="Note"
                        isRequired
                        showValue
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <RHFStarRating
                            name="potential_min"
                            control={form.control}
                            label="Potentiel min"
                        />
                        <RHFStarRating
                            name="potential_max"
                            control={form.control}
                            label="Potentiel max"
                        />
                    </div>
                    <Checkbox
                        label="Potentiel revele"
                        isSelected={potentialRevealedField.field.value ?? false}
                        onChange={(v) => potentialRevealedField.field.onChange(v)}
                    />
                    {potentialRevealedField.field.value && (
                        <RHFStarRating
                            name="potential_final"
                            control={form.control}
                            label="Potentiel final"
                            showValue
                        />
                    )}
                </Section>

                <Section title="Contrat & Carriere">
                    <RHFNumberInput
                        name="birth_year"
                        control={form.control}
                        label="Annee de naissance"
                        placeholder="1975"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput
                            name="contract_years_remaining"
                            control={form.control}
                            label="Annees de contrat"
                        />
                        <RHFNumberInput
                            name="years_in_team"
                            control={form.control}
                            label="Annees dans l'equipe"
                        />
                    </div>
                    <Checkbox
                        label="Prend sa retraite"
                        isSelected={isRetiringField.field.value ?? false}
                        onChange={(v) => isRetiringField.field.onChange(v)}
                    />
                </Section>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <Button size="md" color="secondary" type="button" onClick={onCancel}>
                    Annuler
                </Button>
                <Button size="md" type="submit" isLoading={isPending}>
                    {isEdit ? "Enregistrer" : "Ajouter"}
                </Button>
            </div>
        </form>
    );
}

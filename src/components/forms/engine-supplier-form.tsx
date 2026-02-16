"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { useCreateEngineSupplier, useUpdateEngineSupplier } from "@/hooks/use-engine-suppliers";
import {
    engineSupplierSchema,
    engineSupplierFormDefaults,
    type EngineSupplierFormValues,
} from "@/lib/validators";
import { nationalityItems } from "@/lib/constants/nationalities";
import type { EngineSupplier } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof EngineSupplierFormValues;
    control: Control<EngineSupplierFormValues>;
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
    name: keyof EngineSupplierFormValues;
    control: Control<EngineSupplierFormValues>;
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

// ─── Select items ───────────────────────────────────────────────────────────

const investmentLevelItems = [
    { id: "1", label: "★" },
    { id: "2", label: "★★" },
    { id: "3", label: "★★★" },
];

// ─── EngineSupplierForm ─────────────────────────────────────────────────────

interface EngineSupplierFormProps {
    seasonId: string;
    supplier?: EngineSupplier;
    onSuccess: () => void;
    onCancel: () => void;
}

export function EngineSupplierForm({ seasonId, supplier, onSuccess, onCancel }: EngineSupplierFormProps) {
    const createSupplier = useCreateEngineSupplier();
    const updateSupplier = useUpdateEngineSupplier();

    const isEdit = !!supplier;

    const form = useForm<EngineSupplierFormValues>({
        resolver: zodResolver(engineSupplierSchema),
        defaultValues: supplier
            ? {
                  name: supplier.name,
                  nationality: supplier.nationality ?? "",
                  note: supplier.note,
                  investment_level: supplier.investment_level ?? 2,
              }
            : engineSupplierFormDefaults,
    });

    const isPending = createSupplier.isPending || updateSupplier.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateSupplier.mutate(
                { id: supplier.id, seasonId, form: values },
                { onSuccess },
            );
        } else {
            createSupplier.mutate(
                { seasonId, form: values },
                { onSuccess },
            );
        }
    });

    const nationalityField = useController({ name: "nationality", control: form.control });
    const investmentLevelField = useController({ name: "investment_level", control: form.control });

    return (
        <form onSubmit={onSubmit}>
            <div className="space-y-4">
                <RHFInput name="name" control={form.control} label="Nom" placeholder="Mercedes HPP" isRequired />
                <Select.ComboBox
                    label="Nationalite"
                    placeholder="Rechercher..."
                    items={nationalityItems}
                    selectedKey={nationalityField.field.value || null}
                    onSelectionChange={(key) => nationalityField.field.onChange(key as string ?? "")}
                >
                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select.ComboBox>
                <div className="grid grid-cols-2 gap-4">
                    <RHFNumberInput name="note" control={form.control} label="Note (0-10)" placeholder="7" />
                    <Select
                        label="Investissement"
                        placeholder="Selectionner"
                        items={investmentLevelItems}
                        selectedKey={investmentLevelField.field.value != null ? String(investmentLevelField.field.value) : null}
                        onSelectionChange={(key) => investmentLevelField.field.onChange(key ? Number(key) : null)}
                        isInvalid={!!investmentLevelField.fieldState.error}
                        hint={investmentLevelField.fieldState.error?.message}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
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

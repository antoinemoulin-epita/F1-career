"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useCreateRookie, useUpdateRookie } from "@/hooks/use-rookie-pool";
import { rookiePoolSchema, rookiePoolFormDefaults, type RookiePoolFormValues } from "@/lib/validators";
import type { RookiePool } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof RookiePoolFormValues;
    control: Control<RookiePoolFormValues>;
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
    name: keyof RookiePoolFormValues;
    control: Control<RookiePoolFormValues>;
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

// ─── RookiePoolForm ─────────────────────────────────────────────────────────

interface RookiePoolFormProps {
    universeId: string;
    rookie?: RookiePool;
    onSuccess: () => void;
    onCancel: () => void;
}

export function RookiePoolForm({ universeId, rookie, onSuccess, onCancel }: RookiePoolFormProps) {
    const createRookie = useCreateRookie();
    const updateRookie = useUpdateRookie();

    const isEdit = !!rookie;

    const form = useForm<RookiePoolFormValues>({
        resolver: zodResolver(rookiePoolSchema),
        defaultValues: rookie
            ? {
                  first_name: rookie.first_name ?? "",
                  last_name: rookie.last_name,
                  nationality: rookie.nationality ?? "",
                  birth_year: rookie.birth_year ?? null,
                  potential_min: rookie.potential_min,
                  potential_max: rookie.potential_max,
                  available_from_year: rookie.available_from_year ?? null,
              }
            : rookiePoolFormDefaults,
    });

    const isPending = createRookie.isPending || updateRookie.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateRookie.mutate(
                { id: rookie.id, universeId, form: values },
                { onSuccess },
            );
        } else {
            createRookie.mutate(
                { universeId, form: values },
                { onSuccess },
            );
        }
    });

    const potentialMin = form.watch("potential_min");
    const potentialMax = form.watch("potential_max");

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Identite */}
                <Section title="Identite">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput name="first_name" control={form.control} label="Prenom" placeholder="Jean" />
                        <RHFInput name="last_name" control={form.control} label="Nom" placeholder="Dupont" isRequired />
                    </div>
                    <RHFInput name="nationality" control={form.control} label="Nationalite" placeholder="FRA" />
                    <RHFNumberInput name="birth_year" control={form.control} label="Annee de naissance" placeholder="2005" />
                </Section>

                {/* Potentiel */}
                <Section title="Potentiel">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput name="potential_min" control={form.control} label="Potentiel min" placeholder="3" />
                        <RHFNumberInput name="potential_max" control={form.control} label="Potentiel max" placeholder="7" />
                    </div>
                    <div className="rounded-lg bg-secondary p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-secondary">Fourchette</span>
                            <span className="text-lg font-semibold text-primary">
                                {potentialMin}–{potentialMax}
                            </span>
                        </div>
                    </div>
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

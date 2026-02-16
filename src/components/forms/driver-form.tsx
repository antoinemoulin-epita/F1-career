"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { useCreateDriver, useUpdateDriver } from "@/hooks/use-drivers";
import { driverSchema, driverFormDefaults, type DriverFormValues } from "@/lib/validators";
import { nationalityItems } from "@/lib/constants/nationalities";
import type { Driver, TeamWithBudget } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof DriverFormValues;
    control: Control<DriverFormValues>;
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
    name: keyof DriverFormValues;
    control: Control<DriverFormValues>;
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

// ─── DriverForm ─────────────────────────────────────────────────────────────

interface DriverFormProps {
    seasonId: string;
    driver?: Driver;
    teams: TeamWithBudget[];
    onSuccess: () => void;
    onCancel: () => void;
}

export function DriverForm({ seasonId, driver, teams, onSuccess, onCancel }: DriverFormProps) {
    const createDriver = useCreateDriver();
    const updateDriver = useUpdateDriver();

    const isEdit = !!driver;

    const form = useForm<DriverFormValues>({
        resolver: zodResolver(driverSchema),
        defaultValues: driver
            ? {
                  first_name: driver.first_name ?? "",
                  last_name: driver.last_name,
                  nationality: driver.nationality ?? "",
                  birth_year: driver.birth_year ?? null,
                  note: driver.note,
                  potential_min: driver.potential_min ?? null,
                  potential_max: driver.potential_max ?? null,
                  potential_revealed: driver.potential_revealed ?? false,
                  potential_final: driver.potential_final ?? null,
                  team_id: driver.team_id ?? null,
                  years_in_team: driver.years_in_team ?? 1,
                  is_first_driver: driver.is_first_driver ?? false,
                  contract_years_remaining: driver.contract_years_remaining ?? null,
                  is_rookie: driver.is_rookie ?? false,
                  is_retiring: driver.is_retiring ?? false,
                  world_titles: driver.world_titles ?? null,
                  career_races: driver.career_races ?? null,
                  career_wins: driver.career_wins ?? null,
                  career_poles: driver.career_poles ?? null,
                  career_podiums: driver.career_podiums ?? null,
                  career_points: driver.career_points ?? null,
              }
            : driverFormDefaults,
    });

    const isPending = createDriver.isPending || updateDriver.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateDriver.mutate(
                { id: driver.id, seasonId, form: values },
                { onSuccess },
            );
        } else {
            createDriver.mutate(
                { seasonId, form: values },
                { onSuccess },
            );
        }
    });

    // Effective note computation
    const note = form.watch("note") ?? 0;
    const yearsInTeam = form.watch("years_in_team") ?? 0;
    const potentialMax = form.watch("potential_max");
    const potentialRevealed = form.watch("potential_revealed");
    const potentialFinal = form.watch("potential_final");

    const acclimatation = yearsInTeam === 1 ? -1 : yearsInTeam === 2 ? 0 : yearsInTeam >= 3 ? 1 : 0;
    const potentialCap =
        potentialRevealed && potentialFinal != null
            ? potentialFinal + 1
            : potentialMax != null
              ? potentialMax + 1
              : 11;
    const effectiveNote = Math.min(note + acclimatation, potentialCap, 10);

    // Team select items
    const teamItems = [
        { id: "__none__", label: "Aucune equipe" },
        ...(teams ?? []).map((t) => ({
            id: t.id!,
            label: t.name!,
        })),
    ];

    // RHF controllers for Select and Checkbox
    const teamIdField = useController({ name: "team_id", control: form.control });
    const nationalityField = useController({ name: "nationality", control: form.control });
    const isFirstDriverField = useController({ name: "is_first_driver", control: form.control });
    const potentialRevealedField = useController({ name: "potential_revealed", control: form.control });
    const isRookieField = useController({ name: "is_rookie", control: form.control });
    const isRetiringField = useController({ name: "is_retiring", control: form.control });

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Identite */}
                <Section title="Identite">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput name="first_name" control={form.control} label="Prenom" placeholder="Max" />
                        <RHFInput name="last_name" control={form.control} label="Nom" placeholder="Verstappen" isRequired />
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
                    <RHFNumberInput name="birth_year" control={form.control} label="Annee de naissance" placeholder="1997" />
                </Section>

                {/* Stats */}
                <Section title="Stats">
                    <RHFNumberInput name="note" control={form.control} label="Note" placeholder="5" />
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput name="potential_min" control={form.control} label="Potentiel min" placeholder="7" />
                        <RHFNumberInput name="potential_max" control={form.control} label="Potentiel max" placeholder="9" />
                    </div>
                    <Checkbox
                        label="Potentiel revele"
                        isSelected={potentialRevealedField.field.value ?? false}
                        onChange={potentialRevealedField.field.onChange}
                    />
                    {potentialRevealed && (
                        <RHFNumberInput name="potential_final" control={form.control} label="Potentiel final" placeholder="8" />
                    )}

                    {/* Effective note recap */}
                    <div className="rounded-lg bg-secondary p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-secondary">Note effective</span>
                            <span className="text-lg font-semibold text-primary">{effectiveNote}</span>
                        </div>
                        <div className="mt-2 flex flex-col gap-1 text-xs text-tertiary">
                            <div className="flex justify-between">
                                <span>Note de base</span>
                                <span>{note}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Acclimatation</span>
                                <span>{acclimatation >= 0 ? `+${acclimatation}` : acclimatation}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Plafond potentiel</span>
                                <span>{potentialCap >= 11 ? "—" : potentialCap}</span>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Equipe & Contrat */}
                <Section title="Equipe & Contrat">
                    <Select
                        label="Equipe"
                        placeholder="Selectionner"
                        items={teamItems}
                        selectedKey={teamIdField.field.value ?? "__none__"}
                        onSelectionChange={(key) =>
                            teamIdField.field.onChange(key === "__none__" ? null : (key as string))
                        }
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                    <Checkbox
                        label="Premier pilote"
                        isSelected={isFirstDriverField.field.value ?? false}
                        onChange={isFirstDriverField.field.onChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput name="years_in_team" control={form.control} label="Annees dans l'equipe" placeholder="1" />
                        <RHFNumberInput name="contract_years_remaining" control={form.control} label="Annees de contrat" placeholder="2" />
                    </div>
                </Section>

                {/* Status */}
                <Section title="Status">
                    <Checkbox
                        label="Rookie"
                        isSelected={isRookieField.field.value ?? false}
                        onChange={isRookieField.field.onChange}
                    />
                    <Checkbox
                        label="En retraite"
                        isSelected={isRetiringField.field.value ?? false}
                        onChange={isRetiringField.field.onChange}
                    />
                </Section>

                {/* Carriere */}
                <Section title="Carriere">
                    <RHFNumberInput name="world_titles" control={form.control} label="Titres mondiaux" placeholder="0" />
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput name="career_races" control={form.control} label="Courses" placeholder="0" />
                        <RHFNumberInput name="career_wins" control={form.control} label="Victoires" placeholder="0" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput name="career_poles" control={form.control} label="Poles" placeholder="0" />
                        <RHFNumberInput name="career_podiums" control={form.control} label="Podiums" placeholder="0" />
                    </div>
                    <RHFNumberInput name="career_points" control={form.control} label="Points en carriere" placeholder="0" />
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

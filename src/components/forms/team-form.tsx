"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Toggle } from "@/components/base/toggle/toggle";
import { useEngineSuppliers } from "@/hooks/use-engine-suppliers";
import { useCreateTeam, useUpdateTeam } from "@/hooks/use-teams";
import { teamSchema, teamFormDefaults, type TeamFormValues } from "@/lib/validators";
import { nationalityItems } from "@/lib/constants/nationalities";
import type { Team } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof TeamFormValues;
    control: Control<TeamFormValues>;
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
    name: keyof TeamFormValues;
    control: Control<TeamFormValues>;
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

const engineerLevelItems = [
    { id: "1", label: "★" },
    { id: "2", label: "★★" },
    { id: "3", label: "★★★" },
];

const investmentItems = [
    { id: "0", label: "0" },
    { id: "1", label: "1" },
    { id: "2", label: "2" },
];

// ─── TeamForm ───────────────────────────────────────────────────────────────

interface TeamFormProps {
    seasonId: string;
    team?: Team;
    onSuccess: () => void;
    onCancel: () => void;
}

export function TeamForm({ seasonId, team, onSuccess, onCancel }: TeamFormProps) {
    const createTeam = useCreateTeam();
    const updateTeam = useUpdateTeam();
    const { data: suppliers } = useEngineSuppliers(seasonId);

    const isEdit = !!team;

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamSchema),
        defaultValues: team
            ? {
                  name: team.name,
                  short_name: team.short_name ?? "",
                  nationality: team.nationality ?? "",
                  color_primary: team.color_primary ?? "",
                  color_secondary: team.color_secondary ?? "",
                  engineer_level: team.engineer_level ?? 2,
                  engine_supplier_id: team.engine_supplier_id ?? null,
                  is_factory_team: team.is_factory_team ?? false,
                  shareholders: team.shareholders ?? "",
                  owner_investment: team.owner_investment ?? 1,
                  sponsor_investment: team.sponsor_investment ?? 1,
                  surperformance_bonus: team.surperformance_bonus ?? null,
                  title_sponsor: team.title_sponsor ?? "",
                  sponsor_duration: team.sponsor_duration ?? null,
                  sponsor_objective: team.sponsor_objective ?? "",
              }
            : teamFormDefaults,
    });

    const isPending = createTeam.isPending || updateTeam.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateTeam.mutate(
                { id: team.id, seasonId, form: values },
                { onSuccess },
            );
        } else {
            createTeam.mutate(
                { seasonId, form: values },
                { onSuccess },
            );
        }
    });

    // Budget recap
    const ownerInvestment = form.watch("owner_investment") ?? 0;
    const sponsorInvestment = form.watch("sponsor_investment") ?? 0;
    const bonus = form.watch("surperformance_bonus") ?? 0;
    const budgetTotal = ownerInvestment + sponsorInvestment + bonus;

    // Engine supplier select items
    const supplierItems = (suppliers ?? []).map((s) => ({
        id: s.id,
        label: s.name,
    }));

    // RHF controllers for Select and Toggle
    const nationalityField = useController({ name: "nationality", control: form.control });
    const engineSupplierField = useController({ name: "engine_supplier_id", control: form.control });
    const isFactoryField = useController({ name: "is_factory_team", control: form.control });
    const engineerLevelField = useController({ name: "engineer_level", control: form.control });
    const ownerInvestmentField = useController({ name: "owner_investment", control: form.control });
    const sponsorInvestmentField = useController({ name: "sponsor_investment", control: form.control });

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Identite */}
                <Section title="Identite">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput name="name" control={form.control} label="Nom" placeholder="Red Bull Racing" isRequired />
                        <RHFInput name="short_name" control={form.control} label="Abreviation" placeholder="RBR" />
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
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput name="color_primary" control={form.control} label="Couleur primaire" placeholder="#1E41FF" />
                        <RHFInput name="color_secondary" control={form.control} label="Couleur secondaire" placeholder="#FFB800" />
                    </div>
                </Section>

                {/* Ingenieurs */}
                <Section title="Ingenieurs">
                    <Select
                        label="Niveau ingenieurs"
                        placeholder="Selectionner"
                        items={engineerLevelItems}
                        selectedKey={engineerLevelField.field.value != null ? String(engineerLevelField.field.value) : null}
                        onSelectionChange={(key) => engineerLevelField.field.onChange(key ? Number(key) : null)}
                        isInvalid={!!engineerLevelField.fieldState.error}
                        hint={engineerLevelField.fieldState.error?.message}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                {/* Moteur */}
                <Section title="Moteur">
                    <Select
                        label="Fournisseur moteur"
                        placeholder="Selectionner"
                        items={supplierItems}
                        selectedKey={engineSupplierField.field.value ?? null}
                        onSelectionChange={(key) => engineSupplierField.field.onChange(key as string)}
                        isInvalid={!!engineSupplierField.fieldState.error}
                        hint={engineSupplierField.fieldState.error?.message}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                    <Toggle
                        label="Equipe usine"
                        hint="L'equipe fabrique son propre moteur"
                        isSelected={isFactoryField.field.value ?? false}
                        onChange={isFactoryField.field.onChange}
                    />
                </Section>

                {/* Budget & Sponsor */}
                <Section title="Budget & Sponsor">
                    <RHFInput name="shareholders" control={form.control} label="Actionnaires" placeholder="Red Bull GmbH" />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Investissement proprietaire"
                            placeholder="Selectionner"
                            items={investmentItems}
                            selectedKey={ownerInvestmentField.field.value != null ? String(ownerInvestmentField.field.value) : null}
                            onSelectionChange={(key) => ownerInvestmentField.field.onChange(key != null ? Number(key) : null)}
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                        <Select
                            label="Investissement sponsor"
                            placeholder="Selectionner"
                            items={investmentItems}
                            selectedKey={sponsorInvestmentField.field.value != null ? String(sponsorInvestmentField.field.value) : null}
                            onSelectionChange={(key) => sponsorInvestmentField.field.onChange(key != null ? Number(key) : null)}
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                    </div>
                    <RHFInput name="title_sponsor" control={form.control} label="Sponsor titre" placeholder="Oracle" />
                    <div className="grid grid-cols-2 gap-4">
                        <RHFNumberInput name="sponsor_duration" control={form.control} label="Duree sponsor (ans)" placeholder="3" />
                        <RHFNumberInput name="surperformance_bonus" control={form.control} label="Bonus surperformance" placeholder="0.5" />
                    </div>
                    <RHFInput name="sponsor_objective" control={form.control} label="Objectif sponsor" placeholder="Top 3 constructeurs" />

                    {/* Budget recap */}
                    <div className="rounded-lg bg-secondary p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-secondary">Budget total</span>
                            <span className="text-lg font-semibold text-primary">{budgetTotal}</span>
                        </div>
                        <div className="mt-2 flex flex-col gap-1 text-xs text-tertiary">
                            <div className="flex justify-between">
                                <span>Proprietaire</span>
                                <span>{ownerInvestment}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sponsor</span>
                                <span>{sponsorInvestment}</span>
                            </div>
                            {bonus > 0 && (
                                <div className="flex justify-between">
                                    <span>Bonus</span>
                                    <span>{bonus}</span>
                                </div>
                            )}
                        </div>
                    </div>
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

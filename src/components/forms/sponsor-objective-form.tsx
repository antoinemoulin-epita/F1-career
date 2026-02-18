"use client";

import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { useCreateSponsorObjective } from "@/hooks/use-sponsor-objectives";
import {
    sponsorObjectiveSchema,
    sponsorObjectiveFormDefaults,
    type SponsorObjectiveFormValues,
} from "@/lib/validators/sponsor-objective";
import { objectiveTypeLabels } from "@/lib/constants/arc-labels";
import type { DriverWithEffective, Team, Circuit } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const objectiveTypeItems = Object.entries(objectiveTypeLabels).map(([id, label]) => ({
    id,
    label,
}));

function needsTargetValue(type: string): boolean {
    return [
        "constructor_position",
        "driver_position",
        "wins",
        "podiums",
        "points_minimum",
    ].includes(type);
}

function needsDriverEntity(type: string): boolean {
    return ["driver_position", "beat_driver"].includes(type);
}

function needsTeamEntity(type: string): boolean {
    return type === "beat_team";
}

function needsCircuitEntity(type: string): boolean {
    return type === "race_win_at_circuit";
}

function needsDescription(type: string): boolean {
    return type === "custom";
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

// ─── SponsorObjectiveForm ───────────────────────────────────────────────────

interface SponsorObjectiveFormProps {
    teamId: string;
    seasonId: string;
    drivers: DriverWithEffective[];
    teams: Array<{ id: string; name: string }>;
    circuits: Array<{ id: string; name: string }>;
    onSuccess: () => void;
    onCancel: () => void;
}

export function SponsorObjectiveForm({
    teamId,
    seasonId,
    drivers,
    teams,
    circuits,
    onSuccess,
    onCancel,
}: SponsorObjectiveFormProps) {
    const createObjective = useCreateSponsorObjective();

    const form = useForm<SponsorObjectiveFormValues>({
        resolver: zodResolver(sponsorObjectiveSchema),
        defaultValues: sponsorObjectiveFormDefaults,
    });

    const objectiveTypeField = useController({ name: "objective_type", control: form.control });
    const targetValueField = useController({ name: "target_value", control: form.control });
    const targetEntityIdField = useController({ name: "target_entity_id", control: form.control });
    const descriptionField = useController({ name: "description", control: form.control });

    const currentType = objectiveTypeField.field.value;

    const onSubmit = form.handleSubmit((values) => {
        createObjective.mutate(
            { teamId, seasonId, form: values },
            { onSuccess },
        );
    });

    const driverItems = drivers
        .filter((d) => d.id != null)
        .map((d) => ({
            id: d.id!,
            label: d.full_name ?? `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim(),
        }));

    const teamItems = teams
        .filter((t) => t.id !== teamId)
        .map((t) => ({ id: t.id, label: t.name }));

    const circuitItems = circuits.map((c) => ({
        id: c.id,
        label: c.name,
    }));

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                <Section title="Type d'objectif">
                    <Select
                        label="Objectif"
                        placeholder="Selectionner un type"
                        items={objectiveTypeItems}
                        selectedKey={currentType}
                        onSelectionChange={(key) => {
                            objectiveTypeField.field.onChange(key as string);
                            targetValueField.field.onChange(null);
                            targetEntityIdField.field.onChange(null);
                            descriptionField.field.onChange("");
                        }}
                        isRequired
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                {needsTargetValue(currentType) && (
                    <Section title="Valeur cible">
                        <Input
                            label={
                                currentType === "constructor_position" || currentType === "driver_position"
                                    ? "Position maximum"
                                    : currentType === "points_minimum"
                                      ? "Points minimum"
                                      : "Nombre minimum"
                            }
                            placeholder="ex: 3"
                            value={targetValueField.field.value != null ? String(targetValueField.field.value) : ""}
                            onChange={(v) => {
                                const n = parseFloat(v);
                                targetValueField.field.onChange(v === "" ? null : isNaN(n) ? null : n);
                            }}
                            isInvalid={!!targetValueField.fieldState.error}
                            hint={targetValueField.fieldState.error?.message}
                        />
                    </Section>
                )}

                {needsDriverEntity(currentType) && (
                    <Section title="Pilote cible">
                        <Select
                            label="Pilote"
                            placeholder="Selectionner un pilote"
                            items={driverItems}
                            selectedKey={targetEntityIdField.field.value ?? undefined}
                            onSelectionChange={(key) => targetEntityIdField.field.onChange(key as string)}
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                    </Section>
                )}

                {needsTeamEntity(currentType) && (
                    <Section title="Equipe rivale">
                        <Select
                            label="Equipe"
                            placeholder="Selectionner une equipe"
                            items={teamItems}
                            selectedKey={targetEntityIdField.field.value ?? undefined}
                            onSelectionChange={(key) => targetEntityIdField.field.onChange(key as string)}
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                    </Section>
                )}

                {needsCircuitEntity(currentType) && (
                    <Section title="Circuit">
                        <Select
                            label="Circuit"
                            placeholder="Selectionner un circuit"
                            items={circuitItems}
                            selectedKey={targetEntityIdField.field.value ?? undefined}
                            onSelectionChange={(key) => targetEntityIdField.field.onChange(key as string)}
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                    </Section>
                )}

                {needsDescription(currentType) && (
                    <Section title="Description">
                        <TextArea
                            label="Description de l'objectif"
                            placeholder="Decrire l'objectif personnalise..."
                            value={(descriptionField.field.value as string) ?? ""}
                            onChange={descriptionField.field.onChange}
                            rows={3}
                        />
                    </Section>
                )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <Button size="md" color="secondary" type="button" onClick={onCancel}>
                    Annuler
                </Button>
                <Button size="md" type="submit" isLoading={createObjective.isPending}>
                    Ajouter
                </Button>
            </div>
        </form>
    );
}

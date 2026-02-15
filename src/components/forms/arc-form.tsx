"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { useCreateArc, useUpdateArc } from "@/hooks/use-narrative-arcs";
import { useSeasons } from "@/hooks/use-seasons";
import {
    narrativeArcSchema,
    narrativeArcFormDefaults,
    type NarrativeArcFormValues,
} from "@/lib/validators";
import { arcTypeLabels, arcStatusLabels } from "@/lib/constants/arc-labels";
import type { NarrativeArc } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof NarrativeArcFormValues;
    control: Control<NarrativeArcFormValues>;
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
    name: keyof NarrativeArcFormValues;
    control: Control<NarrativeArcFormValues>;
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

// ─── ArcForm ────────────────────────────────────────────────────────────────

interface ArcFormProps {
    universeId: string;
    arc?: NarrativeArc;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ArcForm({ universeId, arc, onSuccess, onCancel }: ArcFormProps) {
    const createArc = useCreateArc();
    const updateArc = useUpdateArc();
    const { data: seasons } = useSeasons(universeId);

    const isEdit = !!arc;

    const form = useForm<NarrativeArcFormValues>({
        resolver: zodResolver(narrativeArcSchema),
        defaultValues: arc
            ? {
                  name: arc.name ?? "",
                  description: arc.description ?? "",
                  arc_type: arc.arc_type ?? "other",
                  status: arc.status ?? "signal",
                  importance: arc.importance ?? 2,
                  related_driver_ids: arc.related_driver_ids ?? [],
                  related_team_ids: arc.related_team_ids ?? [],
                  started_season_id: arc.started_season_id ?? null,
                  started_round: arc.started_round ?? null,
                  resolved_season_id: arc.resolved_season_id ?? null,
                  resolved_round: arc.resolved_round ?? null,
                  resolution_summary: arc.resolution_summary ?? "",
              }
            : narrativeArcFormDefaults,
    });

    const isPending = createArc.isPending || updateArc.isPending;
    const status = form.watch("status");

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateArc.mutate(
                { id: arc.id, universeId, form: values },
                { onSuccess },
            );
        } else {
            createArc.mutate(
                { universeId, form: values },
                { onSuccess },
            );
        }
    });

    // Select items
    const arcTypeItems = Object.entries(arcTypeLabels).map(([id, label]) => ({ id, label }));
    const arcStatusItems = Object.entries(arcStatusLabels).map(([id, label]) => ({ id, label }));
    const seasonItems = [
        { id: "__none__", label: "Aucune" },
        ...(seasons ?? []).map((s) => ({ id: s.id, label: `Saison ${s.year}` })),
    ];

    // RHF controllers for Selects
    const arcTypeField = useController({ name: "arc_type", control: form.control });
    const statusField = useController({ name: "status", control: form.control });
    const startedSeasonField = useController({ name: "started_season_id", control: form.control });
    const resolvedSeasonField = useController({ name: "resolved_season_id", control: form.control });
    const descriptionField = useController({ name: "description", control: form.control });
    const resolutionSummaryField = useController({ name: "resolution_summary", control: form.control });

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Informations */}
                <Section title="Informations">
                    <RHFInput
                        name="name"
                        control={form.control}
                        label="Nom"
                        placeholder="Rivalite Hamilton / Verstappen"
                        isRequired
                    />
                    <TextArea
                        label="Description"
                        placeholder="Decrivez cet arc narratif..."
                        value={(descriptionField.field.value as string) ?? ""}
                        onChange={descriptionField.field.onChange}
                        rows={3}
                    />
                </Section>

                {/* Classification */}
                <Section title="Classification">
                    <Select
                        label="Type"
                        placeholder="Selectionner"
                        items={arcTypeItems}
                        selectedKey={arcTypeField.field.value}
                        onSelectionChange={(key) => arcTypeField.field.onChange(key as string)}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                    <RHFNumberInput
                        name="importance"
                        control={form.control}
                        label="Importance (1-5)"
                        placeholder="2"
                    />
                    <Select
                        label="Statut"
                        placeholder="Selectionner"
                        items={arcStatusItems}
                        selectedKey={statusField.field.value}
                        onSelectionChange={(key) => statusField.field.onChange(key as string)}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                {/* Contexte */}
                <Section title="Contexte">
                    <Select
                        label="Saison de debut"
                        placeholder="Selectionner"
                        items={seasonItems}
                        selectedKey={startedSeasonField.field.value ?? "__none__"}
                        onSelectionChange={(key) =>
                            startedSeasonField.field.onChange(
                                key === "__none__" ? null : (key as string),
                            )
                        }
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                    <RHFNumberInput
                        name="started_round"
                        control={form.control}
                        label="Round de debut"
                        placeholder="1"
                    />
                </Section>

                {/* Resolution (only if status === "resolved") */}
                {status === "resolved" && (
                    <Section title="Resolution">
                        <Select
                            label="Saison de resolution"
                            placeholder="Selectionner"
                            items={seasonItems}
                            selectedKey={resolvedSeasonField.field.value ?? "__none__"}
                            onSelectionChange={(key) =>
                                resolvedSeasonField.field.onChange(
                                    key === "__none__" ? null : (key as string),
                                )
                            }
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                        <RHFNumberInput
                            name="resolved_round"
                            control={form.control}
                            label="Round de resolution"
                            placeholder="5"
                        />
                        <TextArea
                            label="Resume de la resolution"
                            placeholder="Comment cet arc s'est resolu..."
                            value={(resolutionSummaryField.field.value as string) ?? ""}
                            onChange={resolutionSummaryField.field.onChange}
                            rows={3}
                        />
                    </Section>
                )}
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

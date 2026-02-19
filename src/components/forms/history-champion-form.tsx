"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { useCreateChampion, useUpdateChampion } from "@/hooks/use-history-champions";
import { historyChampionSchema, historyChampionFormDefaults, type HistoryChampionFormValues } from "@/lib/validators";
import type { HistoryChampion } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof HistoryChampionFormValues;
    control: Control<HistoryChampionFormValues>;
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
    isRequired,
}: {
    name: keyof HistoryChampionFormValues;
    control: Control<HistoryChampionFormValues>;
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

// ─── HistoryChampionForm ────────────────────────────────────────────────────

interface HistoryChampionFormProps {
    universeId: string;
    champion?: HistoryChampion;
    onSuccess: () => void;
    onCancel: () => void;
}

export function HistoryChampionForm({ universeId, champion, onSuccess, onCancel }: HistoryChampionFormProps) {
    const createChampion = useCreateChampion();
    const updateChampion = useUpdateChampion();

    const isEdit = !!champion;

    const form = useForm<HistoryChampionFormValues>({
        resolver: zodResolver(historyChampionSchema),
        defaultValues: champion
            ? {
                  year: champion.year,
                  champion_driver_name: champion.champion_driver_name ?? "",
                  champion_driver_team: champion.champion_driver_team ?? "",
                  champion_driver_points: champion.champion_driver_points ?? null,
                  champion_team_name: champion.champion_team_name ?? "",
                  champion_team_points: champion.champion_team_points ?? null,
                  season_summary: champion.season_summary ?? "",
              }
            : historyChampionFormDefaults,
    });

    const isPending = createChampion.isPending || updateChampion.isPending;

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateChampion.mutate(
                { id: champion.id, universeId, form: values },
                { onSuccess },
            );
        } else {
            createChampion.mutate(
                { universeId, form: values },
                { onSuccess },
            );
        }
    });

    const summaryField = useController({ name: "season_summary", control: form.control });

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Saison */}
                <Section title="Saison">
                    <RHFNumberInput name="year" control={form.control} label="Annee" placeholder="2023" isRequired />
                </Section>

                {/* Champion pilote */}
                <Section title="Champion pilote">
                    <RHFInput name="champion_driver_name" control={form.control} label="Nom du pilote" placeholder="Max Verstappen" isRequired />
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput name="champion_driver_team" control={form.control} label="Ecurie" placeholder="Red Bull" />
                        <RHFNumberInput name="champion_driver_points" control={form.control} label="Points" placeholder="575" />
                    </div>
                </Section>

                {/* Champion constructeur */}
                <Section title="Champion constructeur">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput name="champion_team_name" control={form.control} label="Ecurie" placeholder="Red Bull" />
                        <RHFNumberInput name="champion_team_points" control={form.control} label="Points" placeholder="860" />
                    </div>
                </Section>

                {/* Resume */}
                <Section title="Resume de la saison">
                    <TextArea
                        label="Resume"
                        placeholder="Domination totale de Verstappen..."
                        value={(summaryField.field.value as string) ?? ""}
                        onChange={summaryField.field.onChange}
                        rows={3}
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

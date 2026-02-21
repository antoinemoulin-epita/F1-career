"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useListData } from "react-stately";
import type { Key } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { MultiSelect } from "@/components/base/select/multi-select";
import { useCreateNews, useUpdateNews } from "@/hooks/use-news";
import { useCreateArc, useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { usePersonIdentities, useTeamIdentities } from "@/hooks/use-staff";
import { useNewsMentions } from "@/hooks/use-news-mentions";
import { newsSchema, newsFormDefaults, narrativeArcFormDefaults, type NewsFormValues } from "@/lib/validators";
import { newsTypeLabels } from "@/lib/constants/arc-labels";
import { importanceItems } from "@/lib/constants/nationalities";
import type { News } from "@/types";

// ─── RHF field helpers ──────────────────────────────────────────────────────

function RHFInput({
    name,
    control,
    label,
    placeholder,
    isRequired,
}: {
    name: keyof NewsFormValues;
    control: Control<NewsFormValues>;
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
    name: keyof NewsFormValues;
    control: Control<NewsFormValues>;
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

// ─── MentionMultiSelect ────────────────────────────────────────────────────

function MentionMultiSelect({
    label,
    placeholder,
    allItems,
    initialIds,
    onChange,
}: {
    label: string;
    placeholder: string;
    allItems: SelectItemType[];
    initialIds: string[];
    onChange: (ids: string[]) => void;
}) {
    const initialItems = useMemo(
        () => allItems.filter((item) => initialIds.includes(item.id)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [], // Only compute initial items once
    );

    const selectedItems = useListData<SelectItemType>({
        initialItems,
    });

    return (
        <MultiSelect
            label={label}
            placeholder={placeholder}
            items={allItems}
            selectedItems={selectedItems}
            onItemInserted={() => {
                onChange(selectedItems.items.map((i) => i.id));
            }}
            onItemCleared={() => {
                // Use setTimeout to read after the state update
                setTimeout(() => {
                    onChange(selectedItems.items.map((i) => i.id));
                }, 0);
            }}
        >
            {(item) => <MultiSelect.Item id={item.id}>{item.label}</MultiSelect.Item>}
        </MultiSelect>
    );
}

// ─── NewsForm ───────────────────────────────────────────────────────────────

interface NewsFormProps {
    seasonId: string;
    universeId: string;
    news?: News;
    defaultAfterRound?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function NewsForm({ seasonId, universeId, news, defaultAfterRound, onSuccess, onCancel }: NewsFormProps) {
    const createNews = useCreateNews();
    const updateNews = useUpdateNews();
    const createArc = useCreateArc();
    const { data: arcs } = useNarrativeArcs(universeId);
    const { data: personIdentities } = usePersonIdentities(universeId);
    const { data: teamIdentities } = useTeamIdentities(universeId);

    // Load existing mentions for edit mode
    const { data: existingMentions } = useNewsMentions(news?.id ?? "");

    const isEdit = !!news;

    // Pre-compute default mention IDs from existing data
    const defaultMentions = useMemo(() => {
        if (!existingMentions) return { drivers: [] as string[], teams: [] as string[], staff: [] as string[] };
        return {
            drivers: existingMentions.filter((m) => m.entity_type === "driver").map((m) => m.entity_id),
            teams: existingMentions.filter((m) => m.entity_type === "team").map((m) => m.entity_id),
            staff: existingMentions.filter((m) => m.entity_type === "staff").map((m) => m.entity_id),
        };
    }, [existingMentions]);

    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsSchema),
        defaultValues: news
            ? {
                  headline: news.headline ?? "",
                  content: news.content ?? "",
                  news_type: news.news_type ?? "other",
                  importance: news.importance ?? 2,
                  after_round: news.after_round ?? null,
                  arc_id: news.arc_id ?? null,
                  mentioned_drivers: defaultMentions.drivers,
                  mentioned_teams: defaultMentions.teams,
                  mentioned_staff: defaultMentions.staff,
              }
            : { ...newsFormDefaults, ...(defaultAfterRound != null ? { after_round: defaultAfterRound } : {}) },
    });

    const isPending = createNews.isPending || updateNews.isPending;

    // ─── Arc ComboBox state ─────────────────────────────────────────────
    const [arcInputValue, setArcInputValue] = useState("");

    // Initialize input for edit mode when arcs load
    const initialArcName = useMemo(() => {
        if (!news?.arc_id || !arcs) return null;
        return arcs.find((a) => a.id === news.arc_id)?.name ?? null;
    }, [news?.arc_id, arcs]);

    useEffect(() => {
        if (initialArcName && !arcInputValue) {
            setArcInputValue(initialArcName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialArcName]);

    const onSubmit = form.handleSubmit((values) => {
        if (isEdit) {
            updateNews.mutate(
                { id: news.id, seasonId, form: values },
                { onSuccess },
            );
        } else {
            createNews.mutate(
                { seasonId, form: values },
                { onSuccess },
            );
        }
    });

    // Select items
    const newsTypeItems = Object.entries(newsTypeLabels).map(([id, label]) => ({ id, label }));
    // Filtered arc items + inline create option
    const arcComboItems = useMemo(() => {
        const result: SelectItemType[] = [];
        const query = arcInputValue.trim().toLowerCase();
        const existing = (arcs ?? []).map((a) => ({ id: a.id, label: a.name ?? "Sans nom" }));

        if (!query || "aucun".includes(query)) {
            result.push({ id: "__none__", label: "Aucun" });
        }

        if (query) {
            result.push(...existing.filter((a) => (a.label ?? "").toLowerCase().includes(query)));
        } else {
            result.push(...existing);
        }

        // Show "+ Creer" if ≥2 chars and no exact match
        if (query.length >= 2) {
            const exactMatch = existing.some((a) => (a.label ?? "").toLowerCase() === query);
            if (!exactMatch) {
                result.push({
                    id: "__create__",
                    label: `+ Creer « ${arcInputValue.trim()} »`,
                });
            }
        }

        return result;
    }, [arcs, arcInputValue]);

    // Entity items for mentions
    const driverItems = useMemo(
        () => (personIdentities ?? [])
            .filter((p) => p.role === "driver")
            .map((p) => ({ id: p.id, label: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() })),
        [personIdentities],
    );

    const teamItems = useMemo(
        () => (teamIdentities ?? []).map((t) => ({ id: t.id, label: t.name ?? "" })),
        [teamIdentities],
    );

    const staffItems = useMemo(
        () => (personIdentities ?? [])
            .filter((p) => p.role && p.role !== "driver")
            .map((p) => ({ id: p.id, label: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() })),
        [personIdentities],
    );

    // RHF controllers for Selects / TextArea
    const importanceField = useController({ name: "importance", control: form.control });
    const newsTypeField = useController({ name: "news_type", control: form.control });
    const arcIdField = useController({ name: "arc_id", control: form.control });
    const contentField = useController({ name: "content", control: form.control });

    // Handle arc selection including inline creation
    const handleArcSelection = (key: Key | null) => {
        if (key === "__create__") {
            const name = arcInputValue.trim();
            if (name.length >= 2) {
                createArc.mutate(
                    {
                        universeId,
                        form: { ...narrativeArcFormDefaults, name },
                    },
                    {
                        onSuccess: (data) => {
                            arcIdField.field.onChange(data.id);
                            setArcInputValue(data.name);
                        },
                    },
                );
            }
        } else if (key === "__none__" || key === null) {
            arcIdField.field.onChange(null);
            setArcInputValue("");
        } else {
            arcIdField.field.onChange(key as string);
            const arc = (arcs ?? []).find((a) => a.id === key);
            if (arc) setArcInputValue(arc.name);
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
                {/* Contenu */}
                <Section title="Contenu">
                    <RHFInput
                        name="headline"
                        control={form.control}
                        label="Titre"
                        placeholder="Hamilton signe chez Ferrari"
                        isRequired
                    />
                    <TextArea
                        label="Contenu"
                        placeholder="Details de la news..."
                        value={(contentField.field.value as string) ?? ""}
                        onChange={contentField.field.onChange}
                        rows={3}
                    />
                </Section>

                {/* Classification */}
                <Section title="Classification">
                    <Select
                        label="Type"
                        placeholder="Selectionner"
                        items={newsTypeItems}
                        selectedKey={newsTypeField.field.value}
                        onSelectionChange={(key) => newsTypeField.field.onChange(key as string)}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                    <Select
                        label="Importance"
                        placeholder="Selectionner"
                        items={importanceItems}
                        selectedKey={importanceField.field.value != null ? String(importanceField.field.value) : null}
                        onSelectionChange={(key) => importanceField.field.onChange(key ? Number(key) : null)}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                </Section>

                {/* Contexte */}
                <Section title="Contexte">
                    <RHFNumberInput
                        name="after_round"
                        control={form.control}
                        label="Apres le round"
                        placeholder="5"
                    />
                    <Select.ComboBox
                        label="Arc narratif"
                        placeholder="Rechercher ou creer..."
                        items={arcComboItems}
                        inputValue={arcInputValue}
                        onInputChange={setArcInputValue}
                        selectedKey={arcIdField.field.value ?? "__none__"}
                        onSelectionChange={handleArcSelection}
                        shortcut={false}
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select.ComboBox>
                </Section>

                {/* Mentions */}
                {(driverItems.length > 0 || teamItems.length > 0 || staffItems.length > 0) && (
                    <Section title="Mentions">
                        {driverItems.length > 0 && (
                            <MentionMultiSelect
                                label="Pilotes mentionnes"
                                placeholder="Rechercher un pilote..."
                                allItems={driverItems}
                                initialIds={defaultMentions.drivers}
                                onChange={(ids) => form.setValue("mentioned_drivers", ids)}
                            />
                        )}
                        {teamItems.length > 0 && (
                            <MentionMultiSelect
                                label="Ecuries mentionnees"
                                placeholder="Rechercher une ecurie..."
                                allItems={teamItems}
                                initialIds={defaultMentions.teams}
                                onChange={(ids) => form.setValue("mentioned_teams", ids)}
                            />
                        )}
                        {staffItems.length > 0 && (
                            <MentionMultiSelect
                                label="Staff mentionne"
                                placeholder="Rechercher un staff..."
                                allItems={staffItems}
                                initialIds={defaultMentions.staff}
                                onChange={(ids) => form.setValue("mentioned_staff", ids)}
                            />
                        )}
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

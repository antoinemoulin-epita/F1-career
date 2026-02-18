"use client";

import { useForm, useController, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { useCreateNews, useUpdateNews } from "@/hooks/use-news";
import { useNarrativeArcs } from "@/hooks/use-narrative-arcs";
import { newsSchema, newsFormDefaults, type NewsFormValues } from "@/lib/validators";
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
    const { data: arcs } = useNarrativeArcs(universeId);

    const isEdit = !!news;

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
              }
            : { ...newsFormDefaults, ...(defaultAfterRound != null ? { after_round: defaultAfterRound } : {}) },
    });

    const isPending = createNews.isPending || updateNews.isPending;

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
    const arcItems = [
        { id: "__none__", label: "Aucun" },
        ...(arcs ?? []).map((a) => ({ id: a.id, label: a.name ?? "Sans nom" })),
    ];

    // RHF controllers for Selects / TextArea
    const importanceField = useController({ name: "importance", control: form.control });
    const newsTypeField = useController({ name: "news_type", control: form.control });
    const arcIdField = useController({ name: "arc_id", control: form.control });
    const contentField = useController({ name: "content", control: form.control });

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
                    <Select
                        label="Arc narratif"
                        placeholder="Selectionner"
                        items={arcItems}
                        selectedKey={arcIdField.field.value ?? "__none__"}
                        onSelectionChange={(key) =>
                            arcIdField.field.onChange(
                                key === "__none__" ? null : (key as string),
                            )
                        }
                    >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
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

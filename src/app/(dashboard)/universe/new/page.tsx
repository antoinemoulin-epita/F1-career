"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Breadcrumbs } from "@/components/application/breadcrumbs/breadcrumbs";
import { useCreateUniverse } from "@/hooks/use-universes";
import { createUniverseSchema } from "@/lib/validators";

export default function NewUniversePage() {
    const router = useRouter();
    const createUniverse = useCreateUniverse();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startYear, setStartYear] = useState("2024");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const year = parseInt(startYear, 10);

        const result = createUniverseSchema.safeParse({
            name: name.trim(),
            description: description.trim() || undefined,
            start_year: isNaN(year) ? undefined : year,
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        createUniverse.mutate(result.data, {
            onSuccess: (data) => {
                router.push(`/universe/${data.id}`);
            },
        });
    };

    return (
        <div>
            <Breadcrumbs
                items={[
                    { label: "Univers", href: "/universe" },
                    { label: "Nouvel univers" },
                ]}
            />

            <div className="mx-auto mt-6 max-w-lg">
                <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs">
                    <div className="mb-6 flex items-start gap-4">
                        <FeaturedIcon icon={Globe02} color="brand" theme="light" size="md" />
                        <div>
                            <h1 className="text-lg font-semibold text-primary">Nouvel univers</h1>
                            <p className="mt-1 text-sm text-tertiary">
                                Creez un nouvel univers pour gerer vos saisons F1.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Input
                            label="Nom"
                            placeholder="Ma carriere F1"
                            isRequired
                            value={name}
                            onChange={setName}
                            isInvalid={!!errors.name}
                            hint={errors.name}
                        />
                        <TextArea
                            label="Description"
                            placeholder="Une breve description de votre univers..."
                            value={description}
                            onChange={setDescription}
                            rows={3}
                        />
                        <Input
                            label="Annee de depart"
                            placeholder="2024"
                            isRequired
                            value={startYear}
                            onChange={setStartYear}
                            isInvalid={!!errors.start_year}
                            hint={errors.start_year}
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button size="md" color="secondary" href="/universe">
                            Annuler
                        </Button>
                        <Button
                            size="md"
                            onClick={handleSubmit}
                            isLoading={createUniverse.isPending}
                            isDisabled={!name.trim() || !startYear}
                        >
                            Creer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

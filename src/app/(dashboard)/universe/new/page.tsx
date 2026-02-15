"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
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
        <div className="mx-auto max-w-lg">
            <div className="mb-6">
                <Button
                    color="link-gray"
                    size="sm"
                    iconLeading={ArrowLeft}
                    href="/"
                >
                    Back to universes
                </Button>
            </div>

            <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs">
                <div className="mb-6 flex items-start gap-4">
                    <FeaturedIcon icon={Globe02} color="brand" theme="light" size="md" />
                    <div>
                        <h1 className="text-lg font-semibold text-primary">Create Universe</h1>
                        <p className="mt-1 text-sm text-tertiary">
                            Set up a new F1 career mode universe to track your seasons.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Input
                        label="Name"
                        placeholder="My F1 Career"
                        isRequired
                        value={name}
                        onChange={setName}
                        isInvalid={!!errors.name}
                        hint={errors.name}
                    />
                    <TextArea
                        label="Description"
                        placeholder="A brief description of your universe..."
                        value={description}
                        onChange={setDescription}
                        rows={3}
                    />
                    <Input
                        label="Start Year"
                        placeholder="2024"
                        isRequired
                        value={startYear}
                        onChange={setStartYear}
                        isInvalid={!!errors.start_year}
                        hint={errors.start_year}
                    />
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button size="md" color="secondary" href="/">
                        Cancel
                    </Button>
                    <Button
                        size="md"
                        onClick={handleSubmit}
                        isLoading={createUniverse.isPending}
                        isDisabled={!name.trim() || !startYear}
                    >
                        Create
                    </Button>
                </div>
            </div>
        </div>
    );
}

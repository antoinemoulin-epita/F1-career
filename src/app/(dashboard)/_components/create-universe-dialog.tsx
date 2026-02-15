"use client";

import { useState } from "react";
import { Globe02, Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { useCreateUniverse } from "@/hooks/use-universes";

export function CreateUniverseDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const createUniverse = useCreateUniverse();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startYear, setStartYear] = useState("2024");

    const resetForm = () => {
        setName("");
        setDescription("");
        setStartYear("2024");
    };

    const handleSubmit = () => {
        const year = parseInt(startYear, 10);
        if (!name.trim() || isNaN(year)) return;

        createUniverse.mutate(
            {
                name: name.trim(),
                description: description.trim() || undefined,
                start_year: year,
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            },
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="md" iconLeading={Plus}>
                New Universe
            </Button>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5 flex items-start gap-4">
                                <FeaturedIcon icon={Globe02} color="brand" theme="light" size="md" />
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">Create Universe</h2>
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
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button size="md" color="secondary" onClick={() => setIsOpen(false)}>
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
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

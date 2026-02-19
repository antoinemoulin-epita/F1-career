"use client";

import { AlertCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

interface BulkDeleteDialogProps {
    /** Number of items to delete. */
    count: number;
    /** Singular entity label in French (e.g. "pilote"). */
    entityLabel: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
}

export function BulkDeleteDialog({
    count,
    entityLabel,
    isOpen,
    onOpenChange,
    onConfirm,
    isPending,
}: BulkDeleteDialogProps) {
    const plural = count !== 1 ? "s" : "";

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-md">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            <div className="mb-5">
                                <FeaturedIcon
                                    icon={AlertCircle}
                                    color="error"
                                    theme="light"
                                    size="md"
                                />
                            </div>
                            <h2 className="text-lg font-semibold text-primary">
                                Supprimer {count} {entityLabel}{plural}
                            </h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Etes-vous sur de vouloir supprimer{" "}
                                <span className="font-medium text-primary">
                                    {count} {entityLabel}{plural}
                                </span>
                                ? Cette action est irreversible.
                            </p>
                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    size="md"
                                    color="secondary"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="md"
                                    color="primary-destructive"
                                    onClick={onConfirm}
                                    isLoading={isPending}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

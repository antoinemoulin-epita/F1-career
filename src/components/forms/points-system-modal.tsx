"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, RefreshCw05 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import {
    DialogTrigger,
    ModalOverlay,
    Modal,
    Dialog,
} from "@/components/application/modals/modal";
import {
    usePointsSystemForSeason,
    useSaveSeasonPointsSystem,
    useResetSeasonPointsSystem,
} from "@/hooks/use-race-results";
import { POINTS_PRESETS } from "@/lib/constants/points-presets";

type PointsSystemModalProps = {
    seasonId: string;
    universeId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PointsSystemModal({
    seasonId,
    universeId,
    isOpen,
    onOpenChange,
}: PointsSystemModalProps) {
    const { data: pointsData } = usePointsSystemForSeason(seasonId, universeId);
    const saveMutation = useSaveSeasonPointsSystem();
    const resetMutation = useResetSeasonPointsSystem();

    const [localRows, setLocalRows] = useState<{ position: number; points: number }[]>([]);
    const [initialized, setInitialized] = useState(false);

    // Initialize local state from fetched data
    useEffect(() => {
        if (pointsData && !initialized) {
            setLocalRows(
                pointsData.rows.map((r) => ({ position: r.position, points: r.points })),
            );
            setInitialized(true);
        }
    }, [pointsData, initialized]);

    // Reset initialization when modal reopens
    useEffect(() => {
        if (isOpen) {
            setInitialized(false);
        }
    }, [isOpen]);

    const handleApplyPreset = (presetId: string) => {
        const preset = POINTS_PRESETS.find((p) => p.id === presetId);
        if (preset) {
            setLocalRows(preset.rows.map((r) => ({ ...r })));
        }
    };

    const handlePointsChange = (position: number, value: string) => {
        const numValue = parseFloat(value);
        setLocalRows((prev) =>
            prev.map((r) =>
                r.position === position
                    ? { ...r, points: isNaN(numValue) ? 0 : numValue }
                    : r,
            ),
        );
    };

    const handleAddPosition = () => {
        const maxPos = localRows.length > 0 ? Math.max(...localRows.map((r) => r.position)) : 0;
        setLocalRows((prev) => [...prev, { position: maxPos + 1, points: 0 }]);
    };

    const handleRemovePosition = () => {
        if (localRows.length <= 1) return;
        setLocalRows((prev) => prev.slice(0, -1));
    };

    const handleSave = () => {
        saveMutation.mutate(
            { seasonId, universeId, rows: localRows },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    const handleReset = () => {
        resetMutation.mutate(
            { seasonId, universeId },
            {
                onSuccess: () => {
                    setInitialized(false);
                    onOpenChange(false);
                },
            },
        );
    };

    const isSeasonSource = pointsData?.source === "season";

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl">
                            {/* Header */}
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-primary">
                                    Bareme de points
                                </h2>
                                <p className="mt-1 text-sm text-tertiary">
                                    Configurez le bareme de points pour cette saison.
                                    {!isSeasonSource && " Les valeurs par defaut de l'univers sont affichees."}
                                </p>
                            </div>

                            {/* Presets */}
                            <div className="mb-4">
                                <p className="mb-2 text-xs font-medium text-secondary">
                                    Presets historiques
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {POINTS_PRESETS.map((preset) => (
                                        <Button
                                            key={preset.id}
                                            size="sm"
                                            color="secondary"
                                            onClick={() => handleApplyPreset(preset.id)}
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Editable table */}
                            <div className="mb-4 max-h-80 overflow-y-auto rounded-lg border border-secondary">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-secondary bg-secondary">
                                            <th className="px-4 py-2 text-left text-xs font-medium text-secondary">
                                                Position
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-secondary">
                                                Points
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {localRows.map((row) => (
                                            <tr
                                                key={row.position}
                                                className="border-b border-secondary last:border-b-0"
                                            >
                                                <td className="px-4 py-1.5">
                                                    <span className="text-sm font-medium text-primary">
                                                        P{row.position}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-1.5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        value={row.points}
                                                        onChange={(e) =>
                                                            handlePointsChange(
                                                                row.position,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-20 rounded-md border border-primary bg-primary px-2 py-1 text-sm text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add / Remove position */}
                            <div className="mb-5 flex gap-2">
                                <Button
                                    size="sm"
                                    color="secondary"
                                    iconLeading={Plus}
                                    onClick={handleAddPosition}
                                >
                                    Ajouter
                                </Button>
                                <Button
                                    size="sm"
                                    color="secondary"
                                    iconLeading={Minus}
                                    onClick={handleRemovePosition}
                                    isDisabled={localRows.length <= 1}
                                >
                                    Retirer
                                </Button>
                            </div>

                            {/* Footer buttons */}
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    {isSeasonSource && (
                                        <Button
                                            size="sm"
                                            color="tertiary"
                                            iconLeading={RefreshCw05}
                                            onClick={handleReset}
                                            isLoading={resetMutation.isPending}
                                        >
                                            Reinitialiser
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        size="sm"
                                        color="primary"
                                        onClick={handleSave}
                                        isLoading={saveMutation.isPending}
                                    >
                                        Enregistrer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

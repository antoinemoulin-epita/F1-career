"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import type { Circuit, CircuitType } from "@/types";

const circuitTypeLabels: Record<string, string> = {
    high_speed: "Grande vitesse",
    technical: "Technique",
    balanced: "Equilibre",
    street: "Urbain",
};

const typeFilterItems = [
    { id: "__all__", label: "Tous les types" },
    { id: "high_speed", label: "Grande vitesse" },
    { id: "technical", label: "Technique" },
    { id: "balanced", label: "Equilibre" },
    { id: "street", label: "Urbain" },
];

interface CircuitSelectorProps {
    circuits: Circuit[];
    onSelect: (circuit: Circuit) => void;
    onCancel: () => void;
}

export function CircuitSelector({ circuits, onSelect, onCancel }: CircuitSelectorProps) {
    const [typeFilter, setTypeFilter] = useState<string>("__all__");
    const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null);

    const filteredCircuits = useMemo(() => {
        if (typeFilter === "__all__") return circuits;
        return circuits.filter((c) => c.circuit_type === typeFilter);
    }, [circuits, typeFilter]);

    const comboItems = useMemo(
        () =>
            filteredCircuits.map((c) => ({
                id: c.id,
                label: `${c.flag_emoji ?? ""} ${c.name}`.trim(),
                supportingText: [
                    c.country,
                    circuitTypeLabels[c.circuit_type ?? ""] ?? c.circuit_type,
                    `Pluie: ${(c.base_rain_probability ?? 0) === 0 ? "Sec" : c.base_rain_probability + "%"}`,
                ]
                    .filter(Boolean)
                    .join(" · "),
            })),
        [filteredCircuits],
    );

    const selectedCircuit = circuits.find((c) => c.id === selectedCircuitId) ?? null;

    const handleConfirm = () => {
        if (selectedCircuit) {
            onSelect(selectedCircuit);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Select
                label="Type de circuit"
                placeholder="Tous les types"
                items={typeFilterItems}
                selectedKey={typeFilter}
                onSelectionChange={(key) => setTypeFilter(String(key))}
            >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>

            <Select.ComboBox
                label="Circuit"
                placeholder="Rechercher un circuit..."
                items={comboItems}
                selectedKey={selectedCircuitId}
                onSelectionChange={(key) => setSelectedCircuitId(key ? String(key) : null)}
            >
                {(item) => (
                    <Select.Item id={item.id} supportingText={item.supportingText}>
                        {item.label}
                    </Select.Item>
                )}
            </Select.ComboBox>

            <div className="mt-2 flex justify-end gap-3">
                <Button size="md" color="secondary" type="button" onClick={onCancel}>
                    Annuler
                </Button>
                <Button
                    size="md"
                    type="button"
                    isDisabled={!selectedCircuit}
                    onClick={handleConfirm}
                >
                    Ajouter
                </Button>
            </div>
        </div>
    );
}

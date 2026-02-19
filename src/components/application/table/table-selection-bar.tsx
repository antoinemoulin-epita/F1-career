"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/base/buttons/button";

interface TableSelectionBarProps {
    /** Number of selected items. */
    count: number;
    /** Action buttons (e.g. bulk delete). */
    actions?: ReactNode;
    /** Clear the selection. */
    onClearSelection: () => void;
}

export function TableSelectionBar({ count, actions, onClearSelection }: TableSelectionBarProps) {
    return (
        <div className="flex items-center justify-between border-b border-secondary bg-primary px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-primary">
                    {count} element{count !== 1 ? "s" : ""} selectionne{count !== 1 ? "s" : ""}
                </span>
                <Button size="sm" color="link-gray" onClick={onClearSelection}>
                    Deselectionner
                </Button>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
}

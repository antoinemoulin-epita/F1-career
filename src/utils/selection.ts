import type { Selection } from "react-aria-components";

/**
 * Extract selected IDs from a React Aria Selection.
 * Handles both "all" and Set-based selections.
 */
export function getSelectedIds(selection: Selection, allIds: string[]): string[] {
    if (selection === "all") return allIds;
    return [...selection] as string[];
}

/**
 * Get the count of selected items.
 */
export function getSelectedCount(selection: Selection, totalCount: number): number {
    if (selection === "all") return totalCount;
    return selection.size;
}

import { useMemo, useState } from "react";
import type { SortDescriptor } from "react-aria-components";

type ColumnAccessors<T> = Record<string, (item: T) => unknown>;

/**
 * Generic table sort hook with 3-state cycle: ascending → descending → clear.
 * Nulls are always sorted last regardless of direction.
 */
export function useTableSort<T>(
    items: T[],
    columns: ColumnAccessors<T>,
) {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(null);

    const onSortChange = (descriptor: SortDescriptor) => {
        setSortDescriptor((prev) => {
            // Same column, already descending → clear sort
            if (
                prev &&
                prev.column === descriptor.column &&
                prev.direction === "descending"
            ) {
                return null;
            }
            return descriptor;
        });
    };

    const sortedItems = useMemo(() => {
        if (!sortDescriptor) return items;

        const accessor = columns[sortDescriptor.column as string];
        if (!accessor) return items;

        const direction = sortDescriptor.direction === "ascending" ? 1 : -1;

        return [...items].sort((a, b) => {
            const va = accessor(a);
            const vb = accessor(b);

            // Nulls last
            const aNullish = va == null || va === "";
            const bNullish = vb == null || vb === "";
            if (aNullish && bNullish) return 0;
            if (aNullish) return 1;
            if (bNullish) return -1;

            if (typeof va === "string" && typeof vb === "string") {
                return va.localeCompare(vb) * direction;
            }

            return (Number(va) - Number(vb)) * direction;
        });
    }, [items, sortDescriptor, columns]);

    return {
        sortDescriptor: sortDescriptor ?? undefined,
        onSortChange,
        sortedItems,
    };
}

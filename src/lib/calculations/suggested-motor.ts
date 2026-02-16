/**
 * Calculates the suggested motor note for a team based on its engine supplier.
 * Factory teams get the full supplier note; customer teams get supplier note - 1.
 */
export function getSuggestedMotor(
    team: { engine_supplier_id: string | null; is_factory_team: boolean | null },
    supplierMap: Map<string, { note: number }>,
): number | null {
    if (!team.engine_supplier_id) return null;
    const supplier = supplierMap.get(team.engine_supplier_id);
    if (!supplier) return null;
    return team.is_factory_team ? supplier.note : supplier.note - 1;
}

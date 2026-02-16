import { describe, it, expect } from "vitest";
import { getSuggestedMotor } from "./suggested-motor";

describe("getSuggestedMotor", () => {
    const supplierMap = new Map([["s1", { note: 8 }]]);

    it("retourne null si engine_supplier_id est null", () => {
        expect(
            getSuggestedMotor({ engine_supplier_id: null, is_factory_team: false }, supplierMap),
        ).toBeNull();
    });

    it("retourne null si le supplier est inconnu", () => {
        expect(
            getSuggestedMotor({ engine_supplier_id: "unknown", is_factory_team: true }, supplierMap),
        ).toBeNull();
    });

    it("retourne supplier.note pour une factory team", () => {
        expect(
            getSuggestedMotor({ engine_supplier_id: "s1", is_factory_team: true }, supplierMap),
        ).toBe(8);
    });

    it("retourne supplier.note - 1 pour une customer team", () => {
        expect(
            getSuggestedMotor({ engine_supplier_id: "s1", is_factory_team: false }, supplierMap),
        ).toBe(7);
    });
});

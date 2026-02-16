import { describe, it, expect } from "vitest";
import { engineSupplierSchema } from "./engine-supplier";

describe("engineSupplierSchema", () => {
    const valid = { name: "Honda", note: 7, investment_level: 2 };

    it("accepte un fournisseur valide", () => {
        expect(engineSupplierSchema.safeParse(valid).success).toBe(true);
    });

    it("accepte avec nationality optionnel", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, nationality: "JPN" }).success).toBe(true);
        expect(engineSupplierSchema.safeParse({ ...valid, nationality: "" }).success).toBe(true);
    });

    it("rejette name trop court (1 char)", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, name: "H" }).success).toBe(false);
    });

    it("rejette name vide", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    });

    it("rejette name > 100 chars", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, name: "A".repeat(101) }).success).toBe(false);
    });

    it("accepte note bornes 0 et 10", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, note: 0 }).success).toBe(true);
        expect(engineSupplierSchema.safeParse({ ...valid, note: 10 }).success).toBe(true);
    });

    it("rejette note hors bornes", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, note: -1 }).success).toBe(false);
        expect(engineSupplierSchema.safeParse({ ...valid, note: 11 }).success).toBe(false);
    });

    it("rejette note decimale", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, note: 7.5 }).success).toBe(false);
    });

    it("accepte investment_level bornes 1 et 3", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, investment_level: 1 }).success).toBe(true);
        expect(engineSupplierSchema.safeParse({ ...valid, investment_level: 3 }).success).toBe(true);
    });

    it("rejette investment_level hors bornes", () => {
        expect(engineSupplierSchema.safeParse({ ...valid, investment_level: 0 }).success).toBe(false);
        expect(engineSupplierSchema.safeParse({ ...valid, investment_level: 4 }).success).toBe(false);
    });
});

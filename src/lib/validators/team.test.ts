import { describe, it, expect } from "vitest";
import { teamSchema, teamFormDefaults } from "./team";

describe("teamSchema", () => {
    it("accepte des donnees valides", () => {
        const validTeam = {
            name: "Ferrari",
            short_name: "FER",
            owner_investment: 2,
            sponsor_investment: 1,
            engineer_level: 3,
            is_factory_team: true,
        };
        expect(() => teamSchema.parse(validTeam)).not.toThrow();
    });

    it("accepte une equipe minimale (name seul)", () => {
        expect(() => teamSchema.parse({ name: "McLaren" })).not.toThrow();
    });

    it("rejette un objet vide", () => {
        expect(() => teamSchema.parse({})).toThrow();
    });

    it("rejette nom trop court (< 2 caracteres)", () => {
        expect(() => teamSchema.parse({ name: "F" })).toThrow();
    });

    it("rejette nom vide", () => {
        expect(() => teamSchema.parse({ name: "" })).toThrow();
    });

    it("accepte nom de 2 caracteres (borne)", () => {
        expect(() => teamSchema.parse({ name: "AB" })).not.toThrow();
    });

    describe("short_name (max 5)", () => {
        it("accepte short_name de 5 caracteres", () => {
            expect(() =>
                teamSchema.parse({ name: "Ferrari", short_name: "FERRI" }),
            ).not.toThrow();
        });

        it("rejette short_name > 5 caracteres", () => {
            expect(() =>
                teamSchema.parse({ name: "Ferrari", short_name: "FERRAR" }),
            ).toThrow();
        });

        it("accepte short_name vide", () => {
            expect(() =>
                teamSchema.parse({ name: "Ferrari", short_name: "" }),
            ).not.toThrow();
        });
    });

    describe("engineer_level (1-3)", () => {
        it("accepte les niveaux 1, 2, 3", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", engineer_level: 1 }),
            ).not.toThrow();
            expect(() =>
                teamSchema.parse({ name: "Test", engineer_level: 2 }),
            ).not.toThrow();
            expect(() =>
                teamSchema.parse({ name: "Test", engineer_level: 3 }),
            ).not.toThrow();
        });

        it("rejette engineer_level < 1", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", engineer_level: 0 }),
            ).toThrow();
        });

        it("rejette engineer_level > 3", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", engineer_level: 4 }),
            ).toThrow();
        });

        it("rejette engineer_level hors range", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", engineer_level: 4 }),
            ).toThrow();
        });

        it("accepte engineer_level null", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", engineer_level: null }),
            ).not.toThrow();
        });
    });

    describe("owner_investment (0-2)", () => {
        it("accepte 0, 1, 2", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", owner_investment: 0 }),
            ).not.toThrow();
            expect(() =>
                teamSchema.parse({ name: "Test", owner_investment: 2 }),
            ).not.toThrow();
        });

        it("rejette budget > 2", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", owner_investment: 3 }),
            ).toThrow();
        });

        it("rejette budget < 0", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", owner_investment: -1 }),
            ).toThrow();
        });
    });

    describe("sponsor_investment (0-2)", () => {
        it("rejette > 2", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", sponsor_investment: 3 }),
            ).toThrow();
        });

        it("rejette < 0", () => {
            expect(() =>
                teamSchema.parse({ name: "Test", sponsor_investment: -1 }),
            ).toThrow();
        });
    });

    it("rejette les defaults bruts (name vide)", () => {
        expect(() => teamSchema.parse(teamFormDefaults)).toThrow();
    });

    it("accepte les defaults avec un name valide", () => {
        expect(() =>
            teamSchema.parse({ ...teamFormDefaults, name: "Ferrari" }),
        ).not.toThrow();
    });
});

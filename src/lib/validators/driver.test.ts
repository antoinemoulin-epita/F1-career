import { describe, it, expect } from "vitest";
import { driverSchema, driverFormDefaults } from "./driver";

describe("driverSchema", () => {
    const validDriver = {
        last_name: "Leclerc",
        note: 9,
        potential_min: 8,
        potential_max: 10,
        years_in_team: 2,
    };

    it("accepte des donnees valides", () => {
        expect(() => driverSchema.parse(validDriver)).not.toThrow();
    });

    it("accepte un pilote minimal (last_name + note)", () => {
        expect(() =>
            driverSchema.parse({ last_name: "Verstappen", note: 10 }),
        ).not.toThrow();
    });

    it("rejette un objet vide", () => {
        expect(() => driverSchema.parse({})).toThrow();
    });

    describe("last_name", () => {
        it("rejette last_name trop court (< 2)", () => {
            expect(() =>
                driverSchema.parse({ last_name: "L", note: 7 }),
            ).toThrow();
        });

        it("rejette last_name vide", () => {
            expect(() =>
                driverSchema.parse({ last_name: "", note: 7 }),
            ).toThrow();
        });

        it("accepte last_name de 2 caracteres", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Li", note: 7 }),
            ).not.toThrow();
        });
    });

    describe("note (0-10)", () => {
        it("rejette note > 10", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 11 }),
            ).toThrow();
        });

        it("rejette note < 0", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: -1 }),
            ).toThrow();
        });

        it("accepte note = 0 (borne min)", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 0 }),
            ).not.toThrow();
        });

        it("accepte note = 10 (borne max)", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 10 }),
            ).not.toThrow();
        });

        it("accepte note decimale (ex: 7.5)", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7.5 }),
            ).not.toThrow();
        });
    });

    describe("birth_year (1950-2015)", () => {
        it("rejette birth_year < 1950", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, birth_year: 1949 }),
            ).toThrow();
        });

        it("rejette birth_year > 2015", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, birth_year: 2016 }),
            ).toThrow();
        });

        it("accepte birth_year null", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, birth_year: null }),
            ).not.toThrow();
        });

        it("rejette birth_year decimal", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, birth_year: 2000.5 }),
            ).toThrow();
        });
    });

    describe("potential_min / potential_max (0-10)", () => {
        it("rejette potential_min > 10", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, potential_min: 11 }),
            ).toThrow();
        });

        it("rejette potential_max < 0", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, potential_max: -1 }),
            ).toThrow();
        });

        it("accepte potential_min et potential_max null", () => {
            expect(() =>
                driverSchema.parse({
                    last_name: "Test",
                    note: 7,
                    potential_min: null,
                    potential_max: null,
                }),
            ).not.toThrow();
        });

        // NOTE: driverSchema n'a PAS de refine min <= max (seul rookiePoolSchema l'a)
        it("accepte potential_min > potential_max (pas de refine)", () => {
            expect(() =>
                driverSchema.parse({
                    last_name: "Test",
                    note: 7,
                    potential_min: 9,
                    potential_max: 8,
                }),
            ).not.toThrow();
        });
    });

    describe("career stats", () => {
        it("rejette career_wins negatif", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, career_wins: -1 }),
            ).toThrow();
        });

        it("rejette world_titles negatif", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, world_titles: -1 }),
            ).toThrow();
        });

        it("accepte career stats a 0", () => {
            expect(() =>
                driverSchema.parse({
                    last_name: "Test",
                    note: 7,
                    career_wins: 0,
                    career_podiums: 0,
                    career_poles: 0,
                    career_points: 0,
                    career_races: 0,
                    world_titles: 0,
                }),
            ).not.toThrow();
        });

        it("accepte career stats null", () => {
            expect(() =>
                driverSchema.parse({
                    last_name: "Test",
                    note: 7,
                    career_wins: null,
                    career_podiums: null,
                }),
            ).not.toThrow();
        });
    });

    describe("champs optionnels", () => {
        it("accepte first_name vide", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, first_name: "" }),
            ).not.toThrow();
        });

        it("accepte nationality vide", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, nationality: "" }),
            ).not.toThrow();
        });

        it("accepte team_id null", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, team_id: null }),
            ).not.toThrow();
        });

        it("accepte is_rookie boolean", () => {
            expect(() =>
                driverSchema.parse({ last_name: "Test", note: 7, is_rookie: true }),
            ).not.toThrow();
        });
    });

    it("rejette les defaults bruts (last_name vide)", () => {
        expect(() => driverSchema.parse(driverFormDefaults)).toThrow();
    });

    it("accepte les defaults avec un last_name valide", () => {
        expect(() =>
            driverSchema.parse({ ...driverFormDefaults, last_name: "Verstappen" }),
        ).not.toThrow();
    });
});

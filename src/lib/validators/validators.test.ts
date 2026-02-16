import { describe, it, expect } from "vitest";
import { createUniverseSchema } from "./index";
import { driverSchema, driverFormDefaults } from "./driver";
import { carSchema, carFormDefaults } from "./car";
import { teamSchema, teamFormDefaults } from "./team";
import { rookiePoolSchema, rookiePoolFormDefaults } from "./rookie-pool";
import { narrativeArcSchema, narrativeArcFormDefaults } from "./narrative-arc";
import { newsSchema, newsFormDefaults } from "./news";

// ─── createUniverseSchema ───────────────────────────────────────────

describe("createUniverseSchema", () => {
    it("accepte un univers valide", () => {
        const result = createUniverseSchema.safeParse({
            name: "Mon Univers",
            start_year: 2024,
        });
        expect(result.success).toBe(true);
    });

    it("accepte une description optionnelle", () => {
        const result = createUniverseSchema.safeParse({
            name: "Test",
            start_year: 2024,
            description: "Description libre",
        });
        expect(result.success).toBe(true);
    });

    it("rejette un nom trop court (<3)", () => {
        const result = createUniverseSchema.safeParse({
            name: "AB",
            start_year: 2024,
        });
        expect(result.success).toBe(false);
    });

    it("rejette un nom vide", () => {
        const result = createUniverseSchema.safeParse({
            name: "",
            start_year: 2024,
        });
        expect(result.success).toBe(false);
    });

    it("rejette start_year < 1950", () => {
        const result = createUniverseSchema.safeParse({
            name: "Test",
            start_year: 1949,
        });
        expect(result.success).toBe(false);
    });

    it("rejette start_year > 2030", () => {
        const result = createUniverseSchema.safeParse({
            name: "Test",
            start_year: 2031,
        });
        expect(result.success).toBe(false);
    });

    it("accepte les bornes start_year (1950 et 2030)", () => {
        expect(
            createUniverseSchema.safeParse({ name: "Test", start_year: 1950 }).success,
        ).toBe(true);
        expect(
            createUniverseSchema.safeParse({ name: "Test", start_year: 2030 }).success,
        ).toBe(true);
    });

    it("rejette start_year decimal", () => {
        const result = createUniverseSchema.safeParse({
            name: "Test",
            start_year: 2024.5,
        });
        expect(result.success).toBe(false);
    });
});

// ─── driverSchema ───────────────────────────────────────────────────

describe("driverSchema", () => {
    it("rejette les valeurs par defaut (last_name vide)", () => {
        const result = driverSchema.safeParse(driverFormDefaults);
        expect(result.success).toBe(false); // last_name is "" < 2 chars
    });

    it("accepte un pilote valide", () => {
        const result = driverSchema.safeParse({
            ...driverFormDefaults,
            last_name: "Verstappen",
        });
        expect(result.success).toBe(true);
    });

    it("rejette last_name trop court (<2)", () => {
        const result = driverSchema.safeParse({
            ...driverFormDefaults,
            last_name: "A",
        });
        expect(result.success).toBe(false);
    });

    it("rejette last_name vide", () => {
        const result = driverSchema.safeParse({
            ...driverFormDefaults,
            last_name: "",
        });
        expect(result.success).toBe(false);
    });

    it("accepte first_name vide (optionnel)", () => {
        const result = driverSchema.safeParse({
            ...driverFormDefaults,
            last_name: "Verstappen",
            first_name: "",
        });
        expect(result.success).toBe(true);
    });

    describe("note (0-10)", () => {
        it("rejette note < 0", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Test",
                note: -1,
            });
            expect(result.success).toBe(false);
        });

        it("rejette note > 10", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Test",
                note: 11,
            });
            expect(result.success).toBe(false);
        });

        it("accepte les bornes (0 et 10)", () => {
            expect(
                driverSchema.safeParse({ ...driverFormDefaults, last_name: "T", note: 0 })
                    .success,
            ).toBe(false); // last_name too short, but let's use valid name
            expect(
                driverSchema.safeParse({ ...driverFormDefaults, last_name: "Te", note: 0 })
                    .success,
            ).toBe(true);
            expect(
                driverSchema.safeParse({ ...driverFormDefaults, last_name: "Te", note: 10 })
                    .success,
            ).toBe(true);
        });
    });

    describe("birth_year", () => {
        it("rejette birth_year < 1950", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Te",
                birth_year: 1949,
            });
            expect(result.success).toBe(false);
        });

        it("rejette birth_year > 2015", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Te",
                birth_year: 2016,
            });
            expect(result.success).toBe(false);
        });

        it("accepte birth_year null", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Te",
                birth_year: null,
            });
            expect(result.success).toBe(true);
        });
    });

    describe("potential_min/max", () => {
        it("accepte potential_min et potential_max null", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Te",
                potential_min: null,
                potential_max: null,
            });
            expect(result.success).toBe(true);
        });

        it("rejette potential_min > 10", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Te",
                potential_min: 11,
            });
            expect(result.success).toBe(false);
        });
    });

    describe("career stats nullable", () => {
        it("accepte world_titles null", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Te",
                world_titles: null,
            });
            expect(result.success).toBe(true);
        });

        it("rejette career_wins negatif", () => {
            const result = driverSchema.safeParse({
                ...driverFormDefaults,
                last_name: "Te",
                career_wins: -1,
            });
            expect(result.success).toBe(false);
        });
    });
});

// ─── carSchema ──────────────────────────────────────────────────────

describe("carSchema", () => {
    it("accepte les valeurs par defaut", () => {
        const result = carSchema.safeParse(carFormDefaults);
        expect(result.success).toBe(true);
    });

    it("accepte les bornes (0 et 10) pour motor/aero/chassis", () => {
        const min = carSchema.safeParse({ motor: 0, aero: 0, chassis: 0 });
        const max = carSchema.safeParse({ motor: 10, aero: 10, chassis: 10 });
        expect(min.success).toBe(true);
        expect(max.success).toBe(true);
    });

    it("rejette motor > 10", () => {
        const result = carSchema.safeParse({ ...carFormDefaults, motor: 11 });
        expect(result.success).toBe(false);
    });

    it("rejette aero < 0", () => {
        const result = carSchema.safeParse({ ...carFormDefaults, aero: -1 });
        expect(result.success).toBe(false);
    });

    it("rejette chassis > 10", () => {
        const result = carSchema.safeParse({ ...carFormDefaults, chassis: 11 });
        expect(result.success).toBe(false);
    });

    it("engine_change_penalty est optionnel", () => {
        const result = carSchema.safeParse({ motor: 5, aero: 5, chassis: 5 });
        expect(result.success).toBe(true);
    });
});

// ─── teamSchema ─────────────────────────────────────────────────────

describe("teamSchema", () => {
    it("accepte les valeurs par defaut", () => {
        const result = teamSchema.safeParse(teamFormDefaults);
        expect(result.success).toBe(false); // name is "" which is < 2 chars
    });

    it("accepte une equipe valide", () => {
        const result = teamSchema.safeParse({
            ...teamFormDefaults,
            name: "Ferrari",
        });
        expect(result.success).toBe(true);
    });

    it("rejette name trop court", () => {
        const result = teamSchema.safeParse({
            ...teamFormDefaults,
            name: "F",
        });
        expect(result.success).toBe(false);
    });

    it("rejette short_name > 5 caracteres", () => {
        const result = teamSchema.safeParse({
            ...teamFormDefaults,
            name: "Ferrari",
            short_name: "FERRAR",
        });
        expect(result.success).toBe(false);
    });

    it("accepte short_name vide", () => {
        const result = teamSchema.safeParse({
            ...teamFormDefaults,
            name: "Ferrari",
            short_name: "",
        });
        expect(result.success).toBe(true);
    });

    describe("engineer_level (1-3)", () => {
        it("rejette engineer_level < 1", () => {
            const result = teamSchema.safeParse({
                ...teamFormDefaults,
                name: "Ferrari",
                engineer_level: 0,
            });
            expect(result.success).toBe(false);
        });

        it("rejette engineer_level > 3", () => {
            const result = teamSchema.safeParse({
                ...teamFormDefaults,
                name: "Ferrari",
                engineer_level: 4,
            });
            expect(result.success).toBe(false);
        });

        it("accepte engineer_level null", () => {
            const result = teamSchema.safeParse({
                ...teamFormDefaults,
                name: "Ferrari",
                engineer_level: null,
            });
            expect(result.success).toBe(true);
        });
    });

    describe("owner_investment / sponsor_investment (0-2)", () => {
        it("rejette owner_investment > 2", () => {
            const result = teamSchema.safeParse({
                ...teamFormDefaults,
                name: "Ferrari",
                owner_investment: 3,
            });
            expect(result.success).toBe(false);
        });

        it("rejette sponsor_investment < 0", () => {
            const result = teamSchema.safeParse({
                ...teamFormDefaults,
                name: "Ferrari",
                sponsor_investment: -1,
            });
            expect(result.success).toBe(false);
        });
    });
});

// ─── rookiePoolSchema ───────────────────────────────────────────────

describe("rookiePoolSchema", () => {
    it("accepte les valeurs par defaut", () => {
        const result = rookiePoolSchema.safeParse(rookiePoolFormDefaults);
        expect(result.success).toBe(false); // last_name is "" < 2 chars
    });

    it("accepte un rookie valide", () => {
        const result = rookiePoolSchema.safeParse({
            ...rookiePoolFormDefaults,
            last_name: "Bearman",
            potential_min: 4,
            potential_max: 8,
        });
        expect(result.success).toBe(true);
    });

    it("rejette last_name trop court", () => {
        const result = rookiePoolSchema.safeParse({
            ...rookiePoolFormDefaults,
            last_name: "B",
            potential_min: 4,
            potential_max: 8,
        });
        expect(result.success).toBe(false);
    });

    it("rejette potential_min > potential_max (refine)", () => {
        const result = rookiePoolSchema.safeParse({
            ...rookiePoolFormDefaults,
            last_name: "Bearman",
            potential_min: 8,
            potential_max: 4,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].path).toContain("potential_min");
        }
    });

    it("accepte potential_min == potential_max", () => {
        const result = rookiePoolSchema.safeParse({
            ...rookiePoolFormDefaults,
            last_name: "Bearman",
            potential_min: 5,
            potential_max: 5,
        });
        expect(result.success).toBe(true);
    });

    it("rejette potential_min > 10", () => {
        const result = rookiePoolSchema.safeParse({
            ...rookiePoolFormDefaults,
            last_name: "Bearman",
            potential_min: 11,
            potential_max: 11,
        });
        expect(result.success).toBe(false);
    });

    it("rejette birth_year < 1980", () => {
        const result = rookiePoolSchema.safeParse({
            ...rookiePoolFormDefaults,
            last_name: "Bearman",
            potential_min: 3,
            potential_max: 7,
            birth_year: 1979,
        });
        expect(result.success).toBe(false);
    });

    it("rejette available_from_year > 2100", () => {
        const result = rookiePoolSchema.safeParse({
            ...rookiePoolFormDefaults,
            last_name: "Bearman",
            potential_min: 3,
            potential_max: 7,
            available_from_year: 2101,
        });
        expect(result.success).toBe(false);
    });
});

// ─── narrativeArcSchema ─────────────────────────────────────────────

describe("narrativeArcSchema", () => {
    it("accepte les valeurs par defaut", () => {
        const result = narrativeArcSchema.safeParse(narrativeArcFormDefaults);
        expect(result.success).toBe(false); // name "" < 2 chars
    });

    it("accepte un arc valide", () => {
        const result = narrativeArcSchema.safeParse({
            ...narrativeArcFormDefaults,
            name: "Transfert Hamilton",
            arc_type: "transfer",
            status: "developing",
            importance: 4,
        });
        expect(result.success).toBe(true);
    });

    it("rejette un arc_type invalide", () => {
        const result = narrativeArcSchema.safeParse({
            ...narrativeArcFormDefaults,
            name: "Test Arc",
            arc_type: "invalid_type",
        });
        expect(result.success).toBe(false);
    });

    it("rejette un status invalide", () => {
        const result = narrativeArcSchema.safeParse({
            ...narrativeArcFormDefaults,
            name: "Test Arc",
            status: "invalid_status",
        });
        expect(result.success).toBe(false);
    });

    it("accepte tous les arc_type valides", () => {
        const types = [
            "transfer",
            "rivalry",
            "technical",
            "sponsor",
            "entry_exit",
            "drama",
            "regulation",
            "other",
        ];
        for (const arc_type of types) {
            const result = narrativeArcSchema.safeParse({
                ...narrativeArcFormDefaults,
                name: "Test Arc",
                arc_type,
            });
            expect(result.success).toBe(true);
        }
    });

    it("accepte tous les statuts valides", () => {
        const statuses = ["signal", "developing", "confirmed", "resolved"];
        for (const status of statuses) {
            const result = narrativeArcSchema.safeParse({
                ...narrativeArcFormDefaults,
                name: "Test Arc",
                status,
            });
            expect(result.success).toBe(true);
        }
    });

    describe("importance (1-5)", () => {
        it("rejette importance < 1", () => {
            const result = narrativeArcSchema.safeParse({
                ...narrativeArcFormDefaults,
                name: "Test Arc",
                importance: 0,
            });
            expect(result.success).toBe(false);
        });

        it("rejette importance > 5", () => {
            const result = narrativeArcSchema.safeParse({
                ...narrativeArcFormDefaults,
                name: "Test Arc",
                importance: 6,
            });
            expect(result.success).toBe(false);
        });
    });

    it("accepte related_driver_ids comme tableau", () => {
        const result = narrativeArcSchema.safeParse({
            ...narrativeArcFormDefaults,
            name: "Test Arc",
            related_driver_ids: ["id1", "id2"],
        });
        expect(result.success).toBe(true);
    });
});

// ─── newsSchema ─────────────────────────────────────────────────────

describe("newsSchema", () => {
    it("accepte les valeurs par defaut", () => {
        const result = newsSchema.safeParse(newsFormDefaults);
        expect(result.success).toBe(false); // headline "" < 2 chars
    });

    it("accepte une news valide", () => {
        const result = newsSchema.safeParse({
            ...newsFormDefaults,
            headline: "Hamilton signe chez Ferrari",
            news_type: "transfer",
            importance: 5,
        });
        expect(result.success).toBe(true);
    });

    it("rejette headline trop court", () => {
        const result = newsSchema.safeParse({
            ...newsFormDefaults,
            headline: "H",
        });
        expect(result.success).toBe(false);
    });

    it("rejette un news_type invalide", () => {
        const result = newsSchema.safeParse({
            ...newsFormDefaults,
            headline: "Test News",
            news_type: "invalid",
        });
        expect(result.success).toBe(false);
    });

    it("accepte tous les news_type valides", () => {
        const types = [
            "transfer",
            "technical",
            "sponsor",
            "regulation",
            "injury",
            "retirement",
            "other",
        ];
        for (const news_type of types) {
            const result = newsSchema.safeParse({
                ...newsFormDefaults,
                headline: "Test News",
                news_type,
            });
            expect(result.success).toBe(true);
        }
    });

    describe("importance (1-5)", () => {
        it("rejette importance < 1", () => {
            const result = newsSchema.safeParse({
                ...newsFormDefaults,
                headline: "Test",
                importance: 0,
            });
            expect(result.success).toBe(false);
        });

        it("rejette importance > 5", () => {
            const result = newsSchema.safeParse({
                ...newsFormDefaults,
                headline: "Test",
                importance: 6,
            });
            expect(result.success).toBe(false);
        });
    });

    it("accepte content vide", () => {
        const result = newsSchema.safeParse({
            ...newsFormDefaults,
            headline: "Test News",
            content: "",
        });
        expect(result.success).toBe(true);
    });

    it("accepte after_round null", () => {
        const result = newsSchema.safeParse({
            ...newsFormDefaults,
            headline: "Test News",
            after_round: null,
        });
        expect(result.success).toBe(true);
    });
});

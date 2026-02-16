import { describe, it, expect } from "vitest";
import { carImportSchema } from "./car-import";
import { driverImportSchema } from "./driver-import";
import { teamImportSchema } from "./team-import";
import { newsImportSchema } from "./news-import";

// ─── carImportSchema ────────────────────────────────────────────────────────

describe("carImportSchema", () => {
    const validCar = { team: "Red Bull", motor: 8, aero: 7, chassis: 9 };

    it("accepte une voiture valide", () => {
        expect(carImportSchema.safeParse(validCar).success).toBe(true);
    });

    it("accepte engine_change_penalty optionnel", () => {
        expect(carImportSchema.safeParse({ ...validCar, engine_change_penalty: true }).success).toBe(true);
    });

    it("rejette team vide", () => {
        expect(carImportSchema.safeParse({ ...validCar, team: "" }).success).toBe(false);
    });

    it("rejette team manquant", () => {
        const { team, ...noTeam } = validCar;
        expect(carImportSchema.safeParse(noTeam).success).toBe(false);
    });

    it("rejette motor < 0", () => {
        expect(carImportSchema.safeParse({ ...validCar, motor: -1 }).success).toBe(false);
    });

    it("rejette motor > 10", () => {
        expect(carImportSchema.safeParse({ ...validCar, motor: 11 }).success).toBe(false);
    });

    it("accepte bornes 0 et 10 pour aero", () => {
        expect(carImportSchema.safeParse({ ...validCar, aero: 0 }).success).toBe(true);
        expect(carImportSchema.safeParse({ ...validCar, aero: 10 }).success).toBe(true);
    });

    it("rejette chassis > 10", () => {
        expect(carImportSchema.safeParse({ ...validCar, chassis: 10.5 }).success).toBe(false);
    });
});

// ─── driverImportSchema ─────────────────────────────────────────────────────

describe("driverImportSchema", () => {
    const validDriver = { last_name: "Verstappen", note: 9 };

    it("accepte un pilote minimal valide", () => {
        expect(driverImportSchema.safeParse(validDriver).success).toBe(true);
    });

    it("rejette last_name trop court (1 char)", () => {
        expect(driverImportSchema.safeParse({ ...validDriver, last_name: "V" }).success).toBe(false);
    });

    it("rejette last_name manquant", () => {
        expect(driverImportSchema.safeParse({ note: 9 }).success).toBe(false);
    });

    it("rejette note < 0", () => {
        expect(driverImportSchema.safeParse({ ...validDriver, note: -1 }).success).toBe(false);
    });

    it("rejette note > 10", () => {
        expect(driverImportSchema.safeParse({ ...validDriver, note: 11 }).success).toBe(false);
    });

    it("rejette note decimale", () => {
        expect(driverImportSchema.safeParse({ ...validDriver, note: 7.5 }).success).toBe(false);
    });

    it("accepte team comme string optionnel", () => {
        expect(driverImportSchema.safeParse({ ...validDriver, team: "Red Bull" }).success).toBe(true);
        expect(driverImportSchema.safeParse({ ...validDriver, team: "" }).success).toBe(true);
    });

    it("accepte tous les champs optionnels", () => {
        const full = {
            ...validDriver,
            first_name: "Max",
            nationality: "NED",
            birth_year: 1997,
            potential_min: 8,
            potential_max: 10,
            potential_revealed: true,
            potential_final: 9,
            team: "Red Bull",
            years_in_team: 5,
            is_first_driver: true,
            contract_years_remaining: 2,
            is_rookie: false,
            is_retiring: false,
            world_titles: 3,
            career_races: 180,
            career_wins: 60,
            career_poles: 40,
            career_podiums: 110,
            career_points: 2800,
        };
        expect(driverImportSchema.safeParse(full).success).toBe(true);
    });
});

// ─── teamImportSchema ───────────────────────────────────────────────────────

describe("teamImportSchema", () => {
    const validTeam = { name: "Red Bull Racing" };

    it("accepte une equipe minimale valide", () => {
        expect(teamImportSchema.safeParse(validTeam).success).toBe(true);
    });

    it("rejette name trop court (1 char)", () => {
        expect(teamImportSchema.safeParse({ name: "R" }).success).toBe(false);
    });

    it("rejette name manquant", () => {
        expect(teamImportSchema.safeParse({}).success).toBe(false);
    });

    it("accepte short_name <= 5 chars", () => {
        expect(teamImportSchema.safeParse({ ...validTeam, short_name: "RBR" }).success).toBe(true);
    });

    it("rejette short_name > 5 chars", () => {
        expect(teamImportSchema.safeParse({ ...validTeam, short_name: "REDBUL" }).success).toBe(false);
    });

    it("accepte engineer_level 1 a 3", () => {
        expect(teamImportSchema.safeParse({ ...validTeam, engineer_level: 1 }).success).toBe(true);
        expect(teamImportSchema.safeParse({ ...validTeam, engineer_level: 3 }).success).toBe(true);
    });

    it("rejette engineer_level hors bornes", () => {
        expect(teamImportSchema.safeParse({ ...validTeam, engineer_level: 0 }).success).toBe(false);
        expect(teamImportSchema.safeParse({ ...validTeam, engineer_level: 4 }).success).toBe(false);
    });

    it("accepte engine_supplier comme string optionnel", () => {
        expect(teamImportSchema.safeParse({ ...validTeam, engine_supplier: "Honda" }).success).toBe(true);
        expect(teamImportSchema.safeParse({ ...validTeam, engine_supplier: "" }).success).toBe(true);
    });
});

// ─── newsImportSchema ───────────────────────────────────────────────────────

describe("newsImportSchema", () => {
    const validNews = { headline: "Breaking News", news_type: "transfer" as const, importance: 3 };

    it("accepte une news valide", () => {
        expect(newsImportSchema.safeParse(validNews).success).toBe(true);
    });

    it("rejette headline trop court (1 char)", () => {
        expect(newsImportSchema.safeParse({ ...validNews, headline: "B" }).success).toBe(false);
    });

    it("rejette headline manquant", () => {
        const { headline, ...noHeadline } = validNews;
        expect(newsImportSchema.safeParse(noHeadline).success).toBe(false);
    });

    it("accepte tous les news_type valides", () => {
        const types = ["transfer", "technical", "sponsor", "regulation", "injury", "retirement", "other"];
        for (const t of types) {
            expect(newsImportSchema.safeParse({ ...validNews, news_type: t }).success).toBe(true);
        }
    });

    it("rejette un news_type invalide", () => {
        expect(newsImportSchema.safeParse({ ...validNews, news_type: "rumor" }).success).toBe(false);
    });

    it("accepte importance 1 a 5", () => {
        expect(newsImportSchema.safeParse({ ...validNews, importance: 1 }).success).toBe(true);
        expect(newsImportSchema.safeParse({ ...validNews, importance: 5 }).success).toBe(true);
    });

    it("rejette importance hors bornes", () => {
        expect(newsImportSchema.safeParse({ ...validNews, importance: 0 }).success).toBe(false);
        expect(newsImportSchema.safeParse({ ...validNews, importance: 6 }).success).toBe(false);
    });

    it("accepte content et arc optionnels", () => {
        expect(newsImportSchema.safeParse({ ...validNews, content: "Details...", arc: "Title Race" }).success).toBe(true);
    });
});

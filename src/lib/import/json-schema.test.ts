import { describe, it, expect } from "vitest";
import { universeExportSchema } from "./json-schema";

function makeValidExport() {
    return {
        version: "1.0" as const,
        exportDate: "2026-02-16T00:00:00.000Z",
        universe: {
            name: "My Universe",
            description: null,
            start_year: 2024,
        },
        pointsSystem: [{ position: 1, points: 25 }],
        regulations: [],
        rookiePool: [],
        narrativeArcs: [],
        historyChampions: [],
        seasons: [
            {
                _exportId: "s1",
                year: 2024,
                engineSuppliers: [{ _exportId: "es1", name: "Honda", note: 7 }],
                teams: [{ _exportId: "t1", name: "Red Bull" }],
                drivers: [{ _exportId: "d1", last_name: "Verstappen", note: 9 }],
                cars: [{ motor: 8, aero: 7, chassis: 9 }],
                calendar: [],
                qualifyingResults: [],
                raceResults: [],
                standingsDrivers: [],
                standingsConstructors: [],
                predictionsDrivers: [],
                predictionsConstructors: [],
                news: [],
                transfers: [],
            },
        ],
    };
}

describe("universeExportSchema", () => {
    it("accepte un export valide complet", () => {
        expect(universeExportSchema.safeParse(makeValidExport()).success).toBe(true);
    });

    it("rejette version != '1.0'", () => {
        const data = { ...makeValidExport(), version: "2.0" };
        expect(universeExportSchema.safeParse(data).success).toBe(false);
    });

    it("rejette universe.name vide", () => {
        const data = makeValidExport();
        data.universe.name = "";
        expect(universeExportSchema.safeParse(data).success).toBe(false);
    });

    it("rejette saison sans year", () => {
        const data = makeValidExport();
        const { year, ...noYear } = data.seasons[0];
        data.seasons[0] = noYear as any;
        expect(universeExportSchema.safeParse(data).success).toBe(false);
    });

    it("accepte saisons vides (tableaux vides)", () => {
        const data = makeValidExport();
        data.seasons[0].drivers = [];
        data.seasons[0].teams = [];
        data.seasons[0].cars = [];
        data.seasons[0].engineSuppliers = [];
        expect(universeExportSchema.safeParse(data).success).toBe(true);
    });

    it("rejette driver sans last_name", () => {
        const data = makeValidExport();
        data.seasons[0].drivers = [{ _exportId: "d1", note: 9 } as any];
        expect(universeExportSchema.safeParse(data).success).toBe(false);
    });

    it("rejette team sans _exportId", () => {
        const data = makeValidExport();
        data.seasons[0].teams = [{ name: "Red Bull" } as any];
        expect(universeExportSchema.safeParse(data).success).toBe(false);
    });

    it("accepte tous les champs nullable a null", () => {
        const data = makeValidExport();
        data.universe.description = null;
        data.seasons[0].status = null;
        data.seasons[0].gp_count = null;
        data.seasons[0].drivers = [
            {
                _exportId: "d1",
                last_name: "Test",
                note: 5,
                first_name: null,
                nationality: null,
                birth_year: null,
                potential_min: null,
                potential_max: null,
                potential_revealed: null,
                potential_final: null,
                team_id: null,
                years_in_team: null,
                is_first_driver: null,
                contract_years_remaining: null,
                is_rookie: null,
                is_retiring: null,
                world_titles: null,
                career_races: null,
                career_wins: null,
                career_poles: null,
                career_podiums: null,
                career_points: null,
            },
        ];
        expect(universeExportSchema.safeParse(data).success).toBe(true);
    });

    it("rejette sans exportDate", () => {
        const { exportDate, ...data } = makeValidExport();
        expect(universeExportSchema.safeParse(data).success).toBe(false);
    });

    it("rejette sans pointsSystem", () => {
        const { pointsSystem, ...data } = makeValidExport();
        expect(universeExportSchema.safeParse(data).success).toBe(false);
    });
});

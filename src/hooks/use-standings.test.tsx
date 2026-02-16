// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/test/helpers/create-wrapper";
import { chainResult } from "@/test/helpers/mock-supabase";

// ─── Mock Supabase client ────────────────────────────────────────────────────

let mockFromResults: Map<string, { data: unknown; error: unknown }>;

vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({
        from: (table: string) => {
            const result = mockFromResults.get(table) ?? {
                data: [],
                error: null,
            };
            return chainResult(result);
        },
    }),
}));

// Must import AFTER vi.mock
const { useDriverStandings, useConstructorStandings } = await import(
    "./use-standings"
);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useDriverStandings", () => {
    beforeEach(() => {
        mockFromResults = new Map();
    });

    it("recupere les classements tries par points", async () => {
        const mockStandings = [
            {
                driver_id: "d1",
                season_id: "s1",
                points: 100,
                position: 1,
                wins: 4,
                podiums: 8,
                poles: 3,
                first_name: "Max",
                last_name: "Verstappen",
                team_name: "Red Bull",
            },
            {
                driver_id: "d2",
                season_id: "s1",
                points: 80,
                position: 2,
                wins: 2,
                podiums: 6,
                poles: 1,
                first_name: "Lando",
                last_name: "Norris",
                team_name: "McLaren",
            },
        ];

        mockFromResults.set("v_current_standings_drivers", {
            data: mockStandings,
            error: null,
        });

        const { wrapper } = createWrapper();
        const { result } = renderHook(
            () => useDriverStandings("s1"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toHaveLength(2);
        expect(result.current.data![0].position).toBe(1);
        expect(result.current.data![0].points).toBe(100);
        expect(result.current.data![0].driver_id).toBe("d1");
        expect(result.current.data![1].position).toBe(2);
        expect(result.current.data![1].points).toBe(80);
    });

    it("gere les erreurs", async () => {
        mockFromResults.set("v_current_standings_drivers", {
            data: null,
            error: { message: "DB error", code: "42P01" },
        });

        const { wrapper } = createWrapper();
        const { result } = renderHook(
            () => useDriverStandings("s1"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBeDefined();
    });

    it("retourne un tableau vide si aucun classement", async () => {
        mockFromResults.set("v_current_standings_drivers", {
            data: [],
            error: null,
        });

        const { wrapper } = createWrapper();
        const { result } = renderHook(
            () => useDriverStandings("s1"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toHaveLength(0);
    });

    it("ne fetch pas si seasonId est vide", async () => {
        mockFromResults.set("v_current_standings_drivers", {
            data: [{ driver_id: "d1" }],
            error: null,
        });

        const { wrapper } = createWrapper();
        const { result } = renderHook(
            () => useDriverStandings(""),
            { wrapper },
        );

        // Should stay in idle/pending state, never fetch
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(result.current.data).toBeUndefined();
    });
});

describe("useConstructorStandings", () => {
    beforeEach(() => {
        mockFromResults = new Map();
    });

    it("recupere les classements constructeurs", async () => {
        const mockStandings = [
            {
                team_id: "t1",
                season_id: "s1",
                team_name: "Ferrari",
                points: 200,
                position: 1,
                wins: 6,
            },
            {
                team_id: "t2",
                season_id: "s1",
                team_name: "McLaren",
                points: 180,
                position: 2,
                wins: 4,
            },
        ];

        mockFromResults.set("v_current_standings_constructors", {
            data: mockStandings,
            error: null,
        });

        const { wrapper } = createWrapper();
        const { result } = renderHook(
            () => useConstructorStandings("s1"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toHaveLength(2);
        expect(result.current.data![0].position).toBe(1);
        expect(result.current.data![0].team_name).toBe("Ferrari");
        expect(result.current.data![1].position).toBe(2);
    });

    it("gere les erreurs constructeurs", async () => {
        mockFromResults.set("v_current_standings_constructors", {
            data: null,
            error: { message: "View not found" },
        });

        const { wrapper } = createWrapper();
        const { result } = renderHook(
            () => useConstructorStandings("s1"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("ne fetch pas si seasonId est vide", async () => {
        const { wrapper } = createWrapper();
        const { result } = renderHook(
            () => useConstructorStandings(""),
            { wrapper },
        );

        expect(result.current.data).toBeUndefined();
        expect(result.current.isFetching).toBe(false);
    });
});

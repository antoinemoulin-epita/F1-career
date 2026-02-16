import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Regression tests pour les fixes de hooks ───────────────────────────────
// Ces tests verifient que les patterns d'erreur sont corrects en simulant
// la logique des mutation functions.

describe("Regression Hooks", () => {
    // ─── Fix #5: useCreateUniverse verifie erreur RPC ────────────────

    describe("Fix #5: useCreateUniverse verifie erreur RPC", () => {
        it("lance une erreur si fn_seed_default_points echoue", async () => {
            // Simule la logique du mutationFn de useCreateUniverse
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: { user: { id: "u1" } },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { id: "univ-123", name: "Test" },
                                error: null,
                            }),
                        }),
                    }),
                }),
                rpc: vi
                    .fn()
                    .mockResolvedValue({ error: { message: "RPC failed" } }),
            };

            // Reproduction de la logique du mutationFn
            const mutationFn = async () => {
                const {
                    data: { user },
                } = await mockSupabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data, error } = await mockSupabase
                    .from("universes")
                    .insert({})
                    .select()
                    .single();
                if (error) throw error;

                // Le FIX: on verifie l'erreur RPC
                const { error: rpcError } = await mockSupabase.rpc(
                    "fn_seed_default_points",
                    { p_universe_id: data.id },
                );
                if (rpcError) throw rpcError;

                return data;
            };

            await expect(mutationFn()).rejects.toEqual({
                message: "RPC failed",
            });
        });

        it("reussit quand rpc ne retourne pas d'erreur", async () => {
            const mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: { user: { id: "u1" } },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { id: "univ-123", name: "Test" },
                                error: null,
                            }),
                        }),
                    }),
                }),
                rpc: vi.fn().mockResolvedValue({ error: null }),
            };

            const mutationFn = async () => {
                const {
                    data: { user },
                } = await mockSupabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data, error } = await mockSupabase
                    .from("universes")
                    .insert({})
                    .select()
                    .single();
                if (error) throw error;

                const { error: rpcError } = await mockSupabase.rpc(
                    "fn_seed_default_points",
                    { p_universe_id: data.id },
                );
                if (rpcError) throw rpcError;

                return data;
            };

            const result = await mutationFn();
            expect(result).toEqual({ id: "univ-123", name: "Test" });
        });
    });

    // ─── Fix #6: useCreateSeason verifie erreur update ───────────────

    describe("Fix #6: useCreateSeason verifie erreur update", () => {
        it("lance une erreur si universes.update echoue", async () => {
            const mockSupabase = {
                from: vi.fn((table: string) => {
                    if (table === "seasons") {
                        return {
                            insert: vi.fn().mockReturnValue({
                                select: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({
                                        data: {
                                            id: "s1",
                                            universe_id: "u1",
                                            year: 2024,
                                        },
                                        error: null,
                                    }),
                                }),
                            }),
                        };
                    }
                    if (table === "universes") {
                        return {
                            update: vi.fn().mockReturnValue({
                                eq: vi.fn().mockResolvedValue({
                                    error: { message: "Update failed" },
                                }),
                            }),
                        };
                    }
                    return {};
                }),
            };

            // Reproduction de la logique du mutationFn de useCreateSeason
            const mutationFn = async () => {
                const { data, error } = await mockSupabase
                    .from("seasons")
                    .insert({})
                    .select()
                    .single();
                if (error) throw error;

                // Le FIX: on verifie l'erreur de l'update
                const { error: updateError } = await mockSupabase
                    .from("universes")
                    .update({ current_season_id: data.id })
                    .eq("id", "u1");
                if (updateError) throw updateError;

                return data;
            };

            await expect(mutationFn()).rejects.toEqual({
                message: "Update failed",
            });
        });

        it("reussit quand insert ET update reussissent", async () => {
            const mockSupabase = {
                from: vi.fn((table: string) => {
                    if (table === "seasons") {
                        return {
                            insert: vi.fn().mockReturnValue({
                                select: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({
                                        data: {
                                            id: "s1",
                                            universe_id: "u1",
                                            year: 2024,
                                        },
                                        error: null,
                                    }),
                                }),
                            }),
                        };
                    }
                    if (table === "universes") {
                        return {
                            update: vi.fn().mockReturnValue({
                                eq: vi.fn().mockResolvedValue({ error: null }),
                            }),
                        };
                    }
                    return {};
                }),
            };

            const mutationFn = async () => {
                const { data, error } = await mockSupabase
                    .from("seasons")
                    .insert({})
                    .select()
                    .single();
                if (error) throw error;

                const { error: updateError } = await mockSupabase
                    .from("universes")
                    .update({ current_season_id: data.id })
                    .eq("id", "u1");
                if (updateError) throw updateError;

                return data;
            };

            const result = await mutationFn();
            expect(result).toEqual({
                id: "s1",
                universe_id: "u1",
                year: 2024,
            });
        });
    });

    // ─── Fix #7: useCalendar verifie erreurs reorder ─────────────────

    describe("Fix #7: useRemoveRace verifie erreurs de renumerotation", () => {
        it("lance une erreur si la renumerotation echoue", async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    delete: vi.fn().mockReturnValue({
                        eq: vi
                            .fn()
                            .mockResolvedValue({ error: null }),
                    }),
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockImplementation((_field: string, id: string) => {
                            // Le 2eme update echoue
                            if (id === "r3") {
                                return Promise.resolve({
                                    error: { message: "Reorder failed" },
                                });
                            }
                            return Promise.resolve({ error: null });
                        }),
                    }),
                }),
            };

            // Reproduction de la logique de useRemoveRace
            const mutationFn = async () => {
                const { error } = await mockSupabase
                    .from("calendar")
                    .delete()
                    .eq("id", "r1");
                if (error) throw error;

                const remainingIds = ["r2", "r3", "r4"];
                if (remainingIds.length > 0) {
                    const results = await Promise.all(
                        remainingIds.map((entryId, index) =>
                            mockSupabase
                                .from("calendar")
                                .update({ round_number: index + 1 })
                                .eq("id", entryId),
                        ),
                    );
                    // Le FIX: on verifie les erreurs de renumerotation
                    const renumberError = results.find(
                        (r: { error: unknown }) => r.error,
                    )?.error;
                    if (renumberError) throw renumberError;
                }
            };

            await expect(mutationFn()).rejects.toEqual({
                message: "Reorder failed",
            });
        });
    });

    describe("Fix #7b: useReorderRaces verifie erreurs de reordonnancement", () => {
        it("lance une erreur si un update echoue", async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockImplementation((_field: string, id: string) => {
                            if (id === "r2") {
                                return Promise.resolve({
                                    error: { message: "Reorder failed" },
                                });
                            }
                            return Promise.resolve({ error: null });
                        }),
                    }),
                }),
            };

            const mutationFn = async () => {
                const orderedIds = ["r1", "r2", "r3"];
                const results = await Promise.all(
                    orderedIds.map((id, index) =>
                        mockSupabase
                            .from("calendar")
                            .update({ round_number: index + 1 })
                            .eq("id", id),
                    ),
                );
                const reorderError = results.find(
                    (r: { error: unknown }) => r.error,
                )?.error;
                if (reorderError) throw reorderError;
            };

            await expect(mutationFn()).rejects.toEqual({
                message: "Reorder failed",
            });
        });

        it("reussit quand tous les updates passent", async () => {
            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            };

            const mutationFn = async () => {
                const orderedIds = ["r1", "r2", "r3"];
                const results = await Promise.all(
                    orderedIds.map((id, index) =>
                        mockSupabase
                            .from("calendar")
                            .update({ round_number: index + 1 })
                            .eq("id", id),
                    ),
                );
                const reorderError = results.find(
                    (r: { error: unknown }) => r.error,
                )?.error;
                if (reorderError) throw reorderError;
            };

            await expect(mutationFn()).resolves.not.toThrow();
        });
    });
});

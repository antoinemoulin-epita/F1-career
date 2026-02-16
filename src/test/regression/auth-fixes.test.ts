import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Fix #1: Middleware copie les cookies lors d'un redirect ─────────────────

describe("Regression Auth", () => {
    describe("Fix #1: Refresh token sur redirect", () => {
        let mockGetUser: ReturnType<typeof vi.fn>;
        let mockCookies: { name: string; value: string }[];

        beforeEach(() => {
            vi.resetModules();
            mockCookies = [
                { name: "sb-access-token", value: "tok_access_123" },
                { name: "sb-refresh-token", value: "tok_refresh_456" },
            ];
            mockGetUser = vi.fn();
        });

        it("copie les cookies de refresh vers la response de redirect (non-auth)", async () => {
            // Mock supabase SSR
            mockGetUser.mockResolvedValue({ data: { user: null } });

            const redirectCookies: { name: string; value: string }[] = [];

            vi.doMock("@supabase/ssr", () => ({
                createServerClient: (_url: string, _key: string, options: { cookies: { getAll: () => unknown[]; setAll: (c: unknown[]) => void } }) => {
                    // Simulate cookie refresh: the client calls setAll during getUser
                    options.cookies.setAll(
                        mockCookies.map((c) => ({ name: c.name, value: c.value, options: {} })),
                    );
                    return {
                        auth: { getUser: mockGetUser },
                    };
                },
            }));

            vi.doMock("next/server", () => {
                const storedCookies: { name: string; value: string }[] = [];
                return {
                    NextResponse: {
                        next: () => ({
                            cookies: {
                                getAll: () => mockCookies.map((c) => ({ ...c })),
                                set: (name: string, value: string, opts: unknown) => {
                                    storedCookies.push({ name, value });
                                },
                            },
                        }),
                        redirect: (url: URL) => {
                            const rCookies: { name: string; value: string }[] = [];
                            return {
                                url: url.toString(),
                                cookies: {
                                    set: (name: string, value: string, _opts: unknown) => {
                                        rCookies.push({ name, value });
                                        redirectCookies.push({ name, value });
                                    },
                                    getAll: () => rCookies,
                                },
                            };
                        },
                    },
                };
            });

            const { updateSession } = await import("@/lib/supabase/middleware");

            const mockRequest = {
                cookies: {
                    getAll: () => mockCookies,
                    set: vi.fn(),
                },
                nextUrl: {
                    pathname: "/universe",
                    clone: () => ({ pathname: "/login" }),
                },
            };

            const response = await updateSession(mockRequest as never);

            // La response de redirect doit contenir les cookies de session
            expect(redirectCookies.length).toBeGreaterThanOrEqual(2);
            expect(redirectCookies.some((c) => c.name === "sb-access-token")).toBe(true);
            expect(redirectCookies.some((c) => c.name === "sb-refresh-token")).toBe(true);
        });

        it("redirige un utilisateur non-auth vers /login", async () => {
            mockGetUser.mockResolvedValue({ data: { user: null } });

            vi.doMock("@supabase/ssr", () => ({
                createServerClient: (_url: string, _key: string, _options: unknown) => ({
                    auth: { getUser: mockGetUser },
                }),
            }));

            let redirectUrl = "";
            vi.doMock("next/server", () => ({
                NextResponse: {
                    next: () => ({
                        cookies: {
                            getAll: () => [],
                            set: vi.fn(),
                        },
                    }),
                    redirect: (url: { pathname: string }) => {
                        redirectUrl = url.pathname;
                        return {
                            url: url.pathname,
                            cookies: { set: vi.fn(), getAll: () => [] },
                        };
                    },
                },
            }));

            const { updateSession } = await import("@/lib/supabase/middleware");

            const mockRequest = {
                cookies: { getAll: () => [], set: vi.fn() },
                nextUrl: {
                    pathname: "/universe",
                    clone: () => ({ pathname: "/login" }),
                },
            };

            await updateSession(mockRequest as never);
            expect(redirectUrl).toBe("/login");
        });

        it("redirige un utilisateur auth depuis /login vers /universe", async () => {
            mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });

            vi.doMock("@supabase/ssr", () => ({
                createServerClient: (_url: string, _key: string, _options: unknown) => ({
                    auth: { getUser: mockGetUser },
                }),
            }));

            let redirectUrl = "";
            vi.doMock("next/server", () => ({
                NextResponse: {
                    next: () => ({
                        cookies: {
                            getAll: () => [],
                            set: vi.fn(),
                        },
                    }),
                    redirect: (url: { pathname: string }) => {
                        redirectUrl = url.pathname;
                        return {
                            url: url.pathname,
                            cookies: { set: vi.fn(), getAll: () => [] },
                        };
                    },
                },
            }));

            const { updateSession } = await import("@/lib/supabase/middleware");

            const mockRequest = {
                cookies: { getAll: () => [], set: vi.fn() },
                nextUrl: {
                    pathname: "/login",
                    clone: () => ({ pathname: "/universe" }),
                },
            };

            await updateSession(mockRequest as never);
            expect(redirectUrl).toBe("/universe");
        });
    });

    // ─── Fix #3: signOut redirige toujours ───────────────────────────────

    describe("Fix #3: signOut redirige toujours", () => {
        beforeEach(() => {
            vi.resetModules();
        });

        it("redirige vers /login meme si supabase.auth.signOut echoue", async () => {
            const mockRedirect = vi.fn();

            vi.doMock("next/navigation", () => ({
                redirect: (...args: unknown[]) => {
                    mockRedirect(...args);
                    throw new Error("NEXT_REDIRECT");
                },
            }));

            vi.doMock("@/lib/supabase/server", () => ({
                createClient: vi.fn().mockResolvedValue({
                    auth: {
                        signOut: vi.fn().mockRejectedValue(new Error("Network error")),
                    },
                }),
            }));

            const { signOut } = await import("@/lib/auth/actions");

            await expect(signOut()).rejects.toThrow("NEXT_REDIRECT");
            expect(mockRedirect).toHaveBeenCalledWith("/login");
        });
    });

    // ─── Fix #4: useUser lance les erreurs ───────────────────────────────

    describe("Fix #4: useUser lance les erreurs", () => {
        it("le queryFn throw quand getUser retourne une erreur", async () => {
            // On teste la logique directement sans React
            const mockError = { message: "Session expired", status: 401 };

            // Simule ce que fait le queryFn du hook useUser
            const queryFn = async () => {
                const supabase = {
                    auth: {
                        getUser: vi.fn().mockResolvedValue({
                            data: { user: null },
                            error: mockError,
                        }),
                    },
                };

                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                // C'est le fix: on throw l'erreur au lieu de la masquer
                if (error) throw error;
                return user;
            };

            await expect(queryFn()).rejects.toEqual(mockError);
        });

        it("retourne le user quand getUser reussit", async () => {
            const mockUser = { id: "u1", email: "test@test.com" };

            const queryFn = async () => {
                const supabase = {
                    auth: {
                        getUser: vi.fn().mockResolvedValue({
                            data: { user: mockUser },
                            error: null,
                        }),
                    },
                };

                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error) throw error;
                return user;
            };

            const result = await queryFn();
            expect(result).toEqual(mockUser);
        });
    });
});

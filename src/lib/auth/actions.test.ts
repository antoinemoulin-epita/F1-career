import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
    redirect: (...args: unknown[]) => {
        mockRedirect(...args);
        throw new Error("NEXT_REDIRECT");
    },
}));

// Mock supabase server client
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn().mockResolvedValue({
        auth: {
            signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
            signOut: (...args: unknown[]) => mockSignOut(...args),
        },
    }),
}));

// Import after mocks
const { signIn, signOut } = await import("./actions");

describe("signIn", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("retourne une erreur si signInWithPassword echoue", async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: { message: "Invalid login credentials" },
        });

        const result = await signIn({
            email: "bad@test.com",
            password: "wrong",
        });

        expect(result).toEqual({ error: "Invalid login credentials" });
        expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("redirige vers /universe si login reussi", async () => {
        mockSignInWithPassword.mockResolvedValue({ error: null });

        await expect(
            signIn({ email: "user@test.com", password: "pass123" }),
        ).rejects.toThrow("NEXT_REDIRECT");

        expect(mockRedirect).toHaveBeenCalledWith("/universe");
    });

    it("passe les credentials au client supabase", async () => {
        mockSignInWithPassword.mockResolvedValue({ error: null });

        try {
            await signIn({ email: "user@test.com", password: "secret" });
        } catch {
            // redirect throws
        }

        expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: "user@test.com",
            password: "secret",
        });
    });
});

describe("signOut", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redirige vers /login apres deconnexion", async () => {
        mockSignOut.mockResolvedValue({ error: null });

        await expect(signOut()).rejects.toThrow("NEXT_REDIRECT");
        expect(mockRedirect).toHaveBeenCalledWith("/login");
    });

    it("redirige meme si signOut echoue (catch silencieux)", async () => {
        mockSignOut.mockRejectedValue(new Error("Network error"));

        await expect(signOut()).rejects.toThrow("NEXT_REDIRECT");
        expect(mockRedirect).toHaveBeenCalledWith("/login");
    });
});

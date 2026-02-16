/**
 * Helper pour creer un mock Supabase chainable.
 *
 * Chaque appel .from(table) retourne un builder chainable qui se resout
 * avec le resultat configure pour cette table.
 *
 * Usage:
 *   const results = new Map([["my_table", { data: [...], error: null }]]);
 *   const client = createMockSupabaseClient(results);
 */

import { vi } from "vitest";

type QueryResult = { data: unknown; error: unknown };

/**
 * Cree un objet chainable qui se resout avec le resultat donne.
 * Supporte: select, eq, neq, in, order, single, insert, update, delete, limit
 */
export function chainResult(result: QueryResult) {
    const chain: Record<string, unknown> = {
        select: (..._args: unknown[]) => chain,
        eq: (..._args: unknown[]) => chain,
        neq: (..._args: unknown[]) => chain,
        in: (..._args: unknown[]) => chain,
        order: (..._args: unknown[]) => chain,
        single: (..._args: unknown[]) => chain,
        insert: (..._args: unknown[]) => chain,
        update: (..._args: unknown[]) => chain,
        delete: (..._args: unknown[]) => chain,
        upsert: (..._args: unknown[]) => chain,
        limit: (..._args: unknown[]) => chain,
        // Thenable: when awaited, resolve with result
        then: (
            resolve: (value: QueryResult) => void,
            reject?: (reason: unknown) => void,
        ) => Promise.resolve(result).then(resolve, reject),
    };
    return chain;
}

/**
 * Cree un mock complet du client Supabase.
 *
 * @param tableResults - Map<tableName, { data, error }> pour les queries
 * @param authUser - L'utilisateur retourne par auth.getUser()
 * @param rpcResult - Le resultat retourne par rpc()
 */
export function createMockSupabaseClient(
    tableResults: Map<string, QueryResult> = new Map(),
    authUser: { id: string; email?: string } | null = null,
    rpcResult: QueryResult = { data: null, error: null },
) {
    return {
        from: vi.fn((table: string) => {
            const result = tableResults.get(table) ?? {
                data: [],
                error: null,
            };
            return chainResult(result);
        }),
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: authUser },
                error: authUser ? null : { message: "Not authenticated" },
            }),
            signInWithPassword: vi.fn(),
            signOut: vi.fn().mockResolvedValue({ error: null }),
        },
        rpc: vi.fn().mockResolvedValue(rpcResult),
    };
}

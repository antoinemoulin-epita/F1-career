import { describe, it, expect } from "vitest";

// ─── Regression tests pour les fixes de pages ───────────────────────────────

describe("Regression Pages", () => {
    // ─── Fix #9: CarsPage acces securise teamMap ─────────────────────

    describe("Fix #9: CarsPage acces securise teamMap", () => {
        it("ne crash pas si team_id est inconnu dans teamMap", () => {
            // Simule le pattern utilise dans CarsPage:
            // avant fix: teamMap.get(editingCar.team_id)! → crash si undefined
            // apres fix: teamMap.get(editingCar.team_id) → undefined safe

            const teams = [
                { id: "team-1", name: "Ferrari" },
                { id: "team-2", name: "McLaren" },
            ];
            const teamMap = new Map(teams.map((t) => [t.id, t]));

            const editingCar = { id: "c1", team_id: "unknown-team" };

            // Pattern apres fix: verification avant d'acceder
            const team = editingCar.team_id
                ? teamMap.get(editingCar.team_id)
                : undefined;

            // Ne doit PAS crash - retourne undefined
            expect(team).toBeUndefined();

            // Le suggested motor doit etre null si team pas trouvee
            const suggestedMotor =
                editingCar.team_id && teamMap.get(editingCar.team_id)
                    ? 8 // valeur fictive
                    : null;
            expect(suggestedMotor).toBeNull();
        });

        it("accede correctement quand team_id est connu", () => {
            const teams = [
                { id: "team-1", name: "Ferrari" },
                { id: "team-2", name: "McLaren" },
            ];
            const teamMap = new Map(teams.map((t) => [t.id, t]));

            const editingCar = { id: "c1", team_id: "team-1" };

            const team = editingCar.team_id
                ? teamMap.get(editingCar.team_id)
                : undefined;

            expect(team).toBeDefined();
            expect(team?.name).toBe("Ferrari");
        });

        it("gere team_id null", () => {
            const teams = [{ id: "team-1", name: "Ferrari" }];
            const teamMap = new Map(teams.map((t) => [t.id, t]));

            const editingCar = { id: "c1", team_id: null as string | null };

            const team = editingCar.team_id
                ? teamMap.get(editingCar.team_id)
                : undefined;

            expect(team).toBeUndefined();
        });
    });

    // ─── Fix #9b: getSuggestedMotor helper ───────────────────────────

    describe("Fix #9b: getSuggestedMotor helper", () => {
        // Reproduction de la fonction helper de CarsPage
        function getSuggestedMotor(
            team: { engine_supplier_id: string | null; is_factory_team: boolean },
            supplierMap: Map<string, { id: string; note: number }>,
        ): number | null {
            if (!team.engine_supplier_id) return null;
            const supplier = supplierMap.get(team.engine_supplier_id);
            if (!supplier) return null;
            return team.is_factory_team ? supplier.note : supplier.note - 1;
        }

        it("retourne null si pas de engine_supplier_id", () => {
            const supplierMap = new Map([["s1", { id: "s1", note: 8 }]]);
            expect(
                getSuggestedMotor(
                    { engine_supplier_id: null, is_factory_team: false },
                    supplierMap,
                ),
            ).toBeNull();
        });

        it("retourne null si supplier inconnu", () => {
            const supplierMap = new Map([["s1", { id: "s1", note: 8 }]]);
            expect(
                getSuggestedMotor(
                    { engine_supplier_id: "unknown", is_factory_team: true },
                    supplierMap,
                ),
            ).toBeNull();
        });

        it("retourne supplier.note pour factory team", () => {
            const supplierMap = new Map([["s1", { id: "s1", note: 8 }]]);
            expect(
                getSuggestedMotor(
                    { engine_supplier_id: "s1", is_factory_team: true },
                    supplierMap,
                ),
            ).toBe(8);
        });

        it("retourne supplier.note - 1 pour customer team", () => {
            const supplierMap = new Map([["s1", { id: "s1", note: 8 }]]);
            expect(
                getSuggestedMotor(
                    { engine_supplier_id: "s1", is_factory_team: false },
                    supplierMap,
                ),
            ).toBe(7);
        });
    });

    // ─── Fix #10: EndSeasonPage pas de setState dans useMemo ─────────

    describe("Fix #10: EndSeasonPage useEffect au lieu de useMemo", () => {
        it("le pattern d'initialisation utilise des conditions de garde", () => {
            // Verifie que le pattern d'initialisation ne re-ecrit pas
            // l'etat s'il est deja initialise (taille > 0)

            // Simule le useEffect avec condition de garde
            const declineEnabled = new Map<string, boolean>();
            const decliningDrivers = [
                { id: "d1", full_name: "Test" },
                { id: "d2", full_name: "Test2" },
            ];

            // Premiere initialisation: map vide → on remplit
            if (decliningDrivers.length > 0 && declineEnabled.size === 0) {
                decliningDrivers.forEach((d) => {
                    if (d.id) declineEnabled.set(d.id, true);
                });
            }

            expect(declineEnabled.size).toBe(2);
            expect(declineEnabled.get("d1")).toBe(true);
            expect(declineEnabled.get("d2")).toBe(true);
        });

        it("ne re-initialise pas si deja rempli (guard .size === 0)", () => {
            // L'utilisateur toggle un driver → la map a deja des entrees
            const declineEnabled = new Map<string, boolean>([
                ["d1", false],
                ["d2", true],
            ]);

            const decliningDrivers = [
                { id: "d1", full_name: "Test" },
                { id: "d2", full_name: "Test2" },
            ];

            // Deuxieme appel: map.size > 0 → on ne touche pas
            if (decliningDrivers.length > 0 && declineEnabled.size === 0) {
                // Ce block ne devrait PAS s'executer
                decliningDrivers.forEach((d) => {
                    if (d.id) declineEnabled.set(d.id, true);
                });
            }

            // L'etat utilisateur est preserve
            expect(declineEnabled.get("d1")).toBe(false); // toggle preserve
            expect(declineEnabled.get("d2")).toBe(true);
        });

        it("rookieReveals utilise la surperformance pour suggerer le potentiel", () => {
            const rookieReveals = new Map<string, number | null>();
            const rookies = [
                {
                    id: "r1",
                    potential_min: 4,
                    potential_max: 8,
                },
                {
                    id: "r2",
                    potential_min: 3,
                    potential_max: 7,
                },
            ];

            const surperfData = {
                drivers: [
                    {
                        driver_id: "r1",
                        effect: "positive" as const,
                    },
                    {
                        driver_id: "r2",
                        effect: "negative" as const,
                    },
                ],
            };

            // Simule l'initialisation du useEffect
            if (rookies.length > 0 && rookieReveals.size === 0) {
                rookies.forEach((d) => {
                    if (d.id) {
                        const surp = surperfData.drivers.find(
                            (s) => s.driver_id === d.id,
                        );
                        if (
                            surp &&
                            surp.effect === "positive" &&
                            d.potential_max != null
                        ) {
                            rookieReveals.set(d.id, d.potential_max);
                        } else if (
                            surp &&
                            surp.effect === "negative" &&
                            d.potential_min != null
                        ) {
                            rookieReveals.set(d.id, d.potential_min);
                        } else {
                            rookieReveals.set(d.id, null);
                        }
                    }
                });
            }

            // r1 : positive → potential_max = 8
            expect(rookieReveals.get("r1")).toBe(8);
            // r2 : negative → potential_min = 3
            expect(rookieReveals.get("r2")).toBe(3);
        });
    });
});

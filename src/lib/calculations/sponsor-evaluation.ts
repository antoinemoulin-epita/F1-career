import type { SponsorObjective, CurrentStandingsDriver, CurrentStandingsConstructor } from "@/types";

export interface EvaluationResult {
    is_met: boolean;
    evaluated_value: number | null;
    label: string;
}

interface EvaluationContext {
    driverStandings: CurrentStandingsDriver[];
    constructorStandings: CurrentStandingsConstructor[];
    /** team_id → list of circuit_ids where the team has won */
    teamWinCircuits: Map<string, Set<string>>;
}

export function evaluateObjective(
    obj: SponsorObjective,
    ctx: EvaluationContext,
): EvaluationResult {
    const target = obj.target_value != null ? Number(obj.target_value) : null;
    const entityId = obj.target_entity_id;

    switch (obj.objective_type) {
        case "constructor_position": {
            const entry = ctx.constructorStandings.find((s) => s.team_id === obj.team_id);
            const pos = entry?.position ?? null;
            return {
                is_met: pos != null && target != null && pos <= target,
                evaluated_value: pos,
                label: pos != null ? `P${pos}` : "—",
            };
        }

        case "driver_position": {
            const entry = ctx.driverStandings.find((s) => s.driver_id === entityId);
            const pos = entry?.position ?? null;
            return {
                is_met: pos != null && target != null && pos <= target,
                evaluated_value: pos,
                label: pos != null ? `P${pos}` : "—",
            };
        }

        case "wins": {
            const teamDriverIds = ctx.driverStandings
                .filter((s) => s.team_color === ctx.constructorStandings.find((c) => c.team_id === obj.team_id)?.team_color)
                .map((s) => s.driver_id);
            const totalWins = ctx.driverStandings
                .filter((s) => teamDriverIds.includes(s.driver_id))
                .reduce((sum, s) => sum + (s.wins ?? 0), 0);
            return {
                is_met: target != null && totalWins >= target,
                evaluated_value: totalWins,
                label: `${totalWins} victoire${totalWins !== 1 ? "s" : ""}`,
            };
        }

        case "podiums": {
            const teamDriverIds = ctx.driverStandings
                .filter((s) => s.team_color === ctx.constructorStandings.find((c) => c.team_id === obj.team_id)?.team_color)
                .map((s) => s.driver_id);
            const totalPodiums = ctx.driverStandings
                .filter((s) => teamDriverIds.includes(s.driver_id))
                .reduce((sum, s) => sum + (s.podiums ?? 0), 0);
            return {
                is_met: target != null && totalPodiums >= target,
                evaluated_value: totalPodiums,
                label: `${totalPodiums} podium${totalPodiums !== 1 ? "s" : ""}`,
            };
        }

        case "points_minimum": {
            const entry = ctx.constructorStandings.find((s) => s.team_id === obj.team_id);
            const pts = entry?.points ?? 0;
            return {
                is_met: target != null && pts >= target,
                evaluated_value: pts,
                label: `${pts} pts`,
            };
        }

        case "beat_team": {
            const myEntry = ctx.constructorStandings.find((s) => s.team_id === obj.team_id);
            const rivalEntry = ctx.constructorStandings.find((s) => s.team_id === entityId);
            const myPos = myEntry?.position ?? 99;
            const rivalPos = rivalEntry?.position ?? 99;
            return {
                is_met: myPos < rivalPos,
                evaluated_value: myPos,
                label: myPos < rivalPos ? "Devant" : "Derriere",
            };
        }

        case "beat_driver": {
            const targetDriver = ctx.driverStandings.find((s) => s.driver_id === entityId);
            // find the best-placed driver from our team
            const teamDrivers = ctx.driverStandings.filter(
                (s) =>
                    s.team_color ===
                    ctx.constructorStandings.find((c) => c.team_id === obj.team_id)?.team_color,
            );
            const bestTeamPos = Math.min(...teamDrivers.map((s) => s.position ?? 99));
            const targetPos = targetDriver?.position ?? 99;
            return {
                is_met: bestTeamPos < targetPos,
                evaluated_value: bestTeamPos,
                label: bestTeamPos < targetPos ? "Devant" : "Derriere",
            };
        }

        case "race_win_at_circuit": {
            if (!entityId) return { is_met: false, evaluated_value: null, label: "—" };
            const circuits = ctx.teamWinCircuits.get(obj.team_id) ?? new Set();
            const won = circuits.has(entityId);
            return {
                is_met: won,
                evaluated_value: won ? 1 : 0,
                label: won ? "Victoire" : "Non",
            };
        }

        case "custom":
            return {
                is_met: obj.is_met ?? false,
                evaluated_value: null,
                label: "Manuel",
            };

        default:
            return { is_met: false, evaluated_value: null, label: "—" };
    }
}

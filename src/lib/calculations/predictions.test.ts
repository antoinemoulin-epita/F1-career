import { describe, it, expect } from "vitest";
import { computeDriverPredictions, computeConstructorPredictions } from "./predictions";

describe("computeDriverPredictions", () => {
    it("calcule le score = effective_note + car_total", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: "Max V", effective_note: 9 },
        ];
        const cars = [{ team_id: "t1", total: 24 }];

        const result = computeDriverPredictions(drivers, cars);
        expect(result[0].score).toBe(33); // 9 + 24
    });

    it("classe les pilotes par score decroissant", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: "Slow", effective_note: 5 },
            { id: "d2", team_id: "t2", full_name: "Fast", effective_note: 9 },
            { id: "d3", team_id: "t1", full_name: "Mid", effective_note: 7 },
        ];
        const cars = [
            { team_id: "t1", total: 20 },
            { team_id: "t2", total: 22 },
        ];

        const result = computeDriverPredictions(drivers, cars);
        expect(result[0].full_name).toBe("Fast"); // 9 + 22 = 31
        expect(result[1].full_name).toBe("Mid"); // 7 + 20 = 27
        expect(result[2].full_name).toBe("Slow"); // 5 + 20 = 25
    });

    it("assigne les positions correctes (1-indexed)", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: "A", effective_note: 9 },
            { id: "d2", team_id: "t1", full_name: "B", effective_note: 7 },
        ];
        const cars = [{ team_id: "t1", total: 20 }];

        const result = computeDriverPredictions(drivers, cars);
        expect(result[0].predicted_position).toBe(1);
        expect(result[1].predicted_position).toBe(2);
    });

    it("exclut les pilotes sans id, team_id, ou effective_note", () => {
        const drivers = [
            { id: null, team_id: "t1", full_name: "No ID", effective_note: 9 },
            { id: "d2", team_id: null, full_name: "No Team", effective_note: 9 },
            { id: "d3", team_id: "t1", full_name: "No Note", effective_note: null },
            { id: "d4", team_id: "t1", full_name: "Valid", effective_note: 7 },
        ];
        const cars = [{ team_id: "t1", total: 20 }];

        const result = computeDriverPredictions(drivers, cars);
        expect(result.length).toBe(1);
        expect(result[0].driver_id).toBe("d4");
    });

    it("gere une voiture manquante pour une equipe (total = 0)", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: "A", effective_note: 8 },
        ];
        const cars: { team_id: string | null; total: number | null }[] = [];

        const result = computeDriverPredictions(drivers, cars);
        expect(result[0].score).toBe(8); // 8 + 0
    });

    it("gere un tableau vide", () => {
        expect(computeDriverPredictions([], []).length).toBe(0);
    });

    it("ignore les voitures avec team_id null", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: "A", effective_note: 8 },
        ];
        const cars = [
            { team_id: null, total: 30 },
            { team_id: "t1", total: 20 },
        ];

        const result = computeDriverPredictions(drivers, cars);
        expect(result[0].score).toBe(28); // 8 + 20, pas 30
    });

    it("gere une voiture avec total null (traite comme 0)", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: "A", effective_note: 8 },
        ];
        const cars = [{ team_id: "t1", total: null }];

        const result = computeDriverPredictions(drivers, cars);
        expect(result[0].score).toBe(8); // 8 + 0
    });
});

describe("computeConstructorPredictions", () => {
    it("calcule le score = car_total + moyenne pilotes", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: "A", effective_note: 9 },
            { id: "d2", team_id: "t1", full_name: "B", effective_note: 7 },
        ];
        const cars = [{ team_id: "t1", total: 24 }];

        const result = computeConstructorPredictions(drivers, cars);
        expect(result[0].score).toBe(32); // 24 + (9+7)/2 = 24 + 8
        expect(result[0].avg_driver_note).toBe(8);
        expect(result[0].car_total).toBe(24);
    });

    it("classe les equipes par score decroissant", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: null, effective_note: 9 },
            { id: "d2", team_id: "t1", full_name: null, effective_note: 7 },
            { id: "d3", team_id: "t2", full_name: null, effective_note: 6 },
            { id: "d4", team_id: "t2", full_name: null, effective_note: 5 },
        ];
        const cars = [
            { team_id: "t1", total: 20 },
            { team_id: "t2", total: 25 },
        ];

        const result = computeConstructorPredictions(drivers, cars);
        // t2: 25 + 5.5 = 30.5
        // t1: 20 + 8 = 28
        expect(result[0].team_id).toBe("t2");
        expect(result[1].team_id).toBe("t1");
    });

    it("assigne les positions correctes", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: null, effective_note: 8 },
            { id: "d2", team_id: "t2", full_name: null, effective_note: 6 },
        ];
        const cars = [
            { team_id: "t1", total: 20 },
            { team_id: "t2", total: 20 },
        ];

        const result = computeConstructorPredictions(drivers, cars);
        expect(result[0].predicted_position).toBe(1);
        expect(result[1].predicted_position).toBe(2);
    });

    it("ignore les pilotes sans team_id ou effective_note", () => {
        const drivers = [
            { id: "d1", team_id: null, full_name: null, effective_note: 9 },
            { id: "d2", team_id: "t1", full_name: null, effective_note: null },
            { id: "d3", team_id: "t1", full_name: null, effective_note: 7 },
        ];
        const cars = [{ team_id: "t1", total: 20 }];

        const result = computeConstructorPredictions(drivers, cars);
        expect(result.length).toBe(1);
        expect(result[0].avg_driver_note).toBe(7);
    });

    it("gere une equipe avec pilotes mais sans voiture (car_total = 0)", () => {
        const drivers = [
            { id: "d1", team_id: "t1", full_name: null, effective_note: 8 },
            { id: "d2", team_id: "t1", full_name: null, effective_note: 6 },
        ];
        const cars: { team_id: string | null; total: number | null }[] = [];

        const result = computeConstructorPredictions(drivers, cars);
        expect(result.length).toBe(1);
        expect(result[0].car_total).toBe(0);
        expect(result[0].avg_driver_note).toBe(7);
        expect(result[0].score).toBe(7); // 0 + 7
    });
});

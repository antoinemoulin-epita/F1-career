export type PointsPreset = {
    id: string;
    label: string;
    years: string;
    rows: { position: number; points: number }[];
};

export const POINTS_PRESETS: PointsPreset[] = [
    {
        id: "1950-1959",
        label: "1950–1959",
        years: "Top 5 + FL",
        rows: [
            { position: 1, points: 8 },
            { position: 2, points: 6 },
            { position: 3, points: 4 },
            { position: 4, points: 3 },
            { position: 5, points: 2 },
        ],
    },
    {
        id: "1960-1990",
        label: "1960–1990",
        years: "Top 6",
        rows: [
            { position: 1, points: 9 },
            { position: 2, points: 6 },
            { position: 3, points: 4 },
            { position: 4, points: 3 },
            { position: 5, points: 2 },
            { position: 6, points: 1 },
        ],
    },
    {
        id: "2003-2009",
        label: "2003–2009",
        years: "Top 8",
        rows: [
            { position: 1, points: 10 },
            { position: 2, points: 8 },
            { position: 3, points: 6 },
            { position: 4, points: 5 },
            { position: 5, points: 4 },
            { position: 6, points: 3 },
            { position: 7, points: 2 },
            { position: 8, points: 1 },
        ],
    },
    {
        id: "2010+",
        label: "2010+",
        years: "Top 10",
        rows: [
            { position: 1, points: 25 },
            { position: 2, points: 18 },
            { position: 3, points: 15 },
            { position: 4, points: 12 },
            { position: 5, points: 10 },
            { position: 6, points: 8 },
            { position: 7, points: 6 },
            { position: 8, points: 4 },
            { position: 9, points: 2 },
            { position: 10, points: 1 },
        ],
    },
    {
        id: "custom-30",
        label: "Custom 30pts",
        years: "Top 20",
        rows: [
            { position: 1, points: 30 },
            { position: 2, points: 25 },
            { position: 3, points: 22 },
            { position: 4, points: 19 },
            { position: 5, points: 17 },
            { position: 6, points: 15 },
            { position: 7, points: 13 },
            { position: 8, points: 11 },
            { position: 9, points: 9 },
            { position: 10, points: 8 },
            { position: 11, points: 7 },
            { position: 12, points: 6 },
            { position: 13, points: 5 },
            { position: 14, points: 4 },
            { position: 15, points: 3 },
            { position: 16, points: 2.5 },
            { position: 17, points: 2 },
            { position: 18, points: 1.5 },
            { position: 19, points: 1 },
            { position: 20, points: 0 },
        ],
    },
];

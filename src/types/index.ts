export interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    number: number;
    teamId: string;
    nationality: string;
}

export interface Team {
    id: string;
    name: string;
    color: string;
    engineManufacturer: string;
}

export interface Season {
    id: string;
    year: number;
    isActive: boolean;
    createdAt: string;
}

export interface Race {
    id: string;
    seasonId: string;
    circuitName: string;
    country: string;
    round: number;
    date: string;
    isCompleted: boolean;
}

export interface RaceResult {
    id: string;
    raceId: string;
    driverId: string;
    position: number;
    points: number;
    fastestLap: boolean;
    dnf: boolean;
}

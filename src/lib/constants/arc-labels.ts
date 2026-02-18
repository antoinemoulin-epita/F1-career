export const arcTypeLabels: Record<string, string> = {
    transfer: "Transfert",
    rivalry: "Rivalite",
    technical: "Technique",
    sponsor: "Sponsor",
    entry_exit: "Entree/Sortie",
    drama: "Drame",
    regulation: "Reglementation",
    other: "Autre",
};

export const arcTypeBadgeColor: Record<
    string,
    "blue" | "orange" | "purple" | "brand" | "indigo" | "pink" | "warning" | "gray"
> = {
    transfer: "blue",
    rivalry: "orange",
    technical: "purple",
    sponsor: "brand",
    entry_exit: "indigo",
    drama: "pink",
    regulation: "warning",
    other: "gray",
};

export const arcStatusLabels: Record<string, string> = {
    signal: "Signal",
    developing: "En cours",
    confirmed: "Confirme",
    resolved: "Resolu",
};

export const arcStatusColor: Record<string, "gray" | "warning" | "brand" | "success"> = {
    signal: "gray",
    developing: "warning",
    confirmed: "brand",
    resolved: "success",
};

export const newsTypeLabels: Record<string, string> = {
    transfer: "Transfert",
    technical: "Technique",
    sponsor: "Sponsor",
    regulation: "Reglementation",
    injury: "Blessure",
    retirement: "Retraite",
    on_track: "En piste",
    business: "Business",
    world: "Monde",
    feeder_series: "Filieres",
    personality: "Personnalite",
    other: "Autre",
};

export const newsTypeBadgeColor: Record<
    string,
    "blue" | "blue-light" | "purple" | "brand" | "warning" | "orange" | "gray" | "success" | "indigo" | "pink" | "gray-blue"
> = {
    transfer: "blue",
    technical: "purple",
    sponsor: "brand",
    regulation: "warning",
    injury: "orange",
    retirement: "gray",
    on_track: "success",
    business: "indigo",
    world: "gray-blue",
    feeder_series: "pink",
    personality: "blue-light",
    other: "gray",
};

// ─── Sponsor Objective types ────────────────────────────────────────────────

export const objectiveTypeLabels: Record<string, string> = {
    constructor_position: "Position constructeurs",
    driver_position: "Position pilote",
    wins: "Victoires",
    podiums: "Podiums",
    points_minimum: "Points minimum",
    beat_team: "Battre une equipe",
    beat_driver: "Battre un pilote",
    race_win_at_circuit: "Victoire sur circuit",
    custom: "Personnalise",
};

export const objectiveTypeBadgeColor: Record<
    string,
    "brand" | "blue" | "success" | "orange" | "purple" | "indigo" | "pink" | "warning" | "gray"
> = {
    constructor_position: "brand",
    driver_position: "blue",
    wins: "success",
    podiums: "orange",
    points_minimum: "purple",
    beat_team: "indigo",
    beat_driver: "pink",
    race_win_at_circuit: "warning",
    custom: "gray",
};
